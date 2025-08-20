import express from 'express';
import { google } from 'googleapis';
import { authenticateToken } from './auth.js';
import { pool } from '../server.js';
import cron from 'node-cron';

const router = express.Router();

// Google Calendar OAuth2 configuration
const googleOAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/sync/google/callback'
);

// Microsoft Graph configuration
const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
const MICROSOFT_REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:5000/api/sync/outlook/callback';

// Google Calendar OAuth2 flow
router.get('/google/auth', authenticateToken, (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  const authUrl = googleOAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    state: req.user.id // Pass user ID in state for security
  });

  res.json({ authUrl });
});

// Google Calendar OAuth2 callback
router.get('/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      return res.status(400).json({ error: 'Authorization code or state missing' });
    }

    // Exchange code for tokens
    const { tokens } = await googleOAuth2Client.getToken(code);
    
    // Get user info
    googleOAuth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: googleOAuth2Client });
    const userInfo = await oauth2.userinfo.get();

    // Get primary calendar
    const calendar = google.calendar({ version: 'v3', auth: googleOAuth2Client });
    const calendarList = await calendar.calendarList.list();
    const primaryCalendar = calendarList.data.items.find(cal => cal.primary);

    // Store sync configuration
    await pool.query(
      `INSERT INTO calendar_syncs (
        user_id, provider, access_token, refresh_token, 
        expires_at, calendar_id, sync_enabled
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id, provider) 
      DO UPDATE SET 
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        expires_at = EXCLUDED.expires_at,
        calendar_id = EXCLUDED.calendar_id,
        updated_at = CURRENT_TIMESTAMP`,
      [
        state, 'google', tokens.access_token, tokens.refresh_token,
        tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        primaryCalendar?.id || 'primary', true
      ]
    );

    // Perform initial sync
    await syncGoogleCalendar(state, primaryCalendar?.id || 'primary');

    res.json({ 
      message: 'Google Calendar connected successfully',
      calendarId: primaryCalendar?.id || 'primary'
    });

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.status(500).json({ error: 'Failed to connect Google Calendar' });
  }
});

// Microsoft Outlook OAuth2 flow
router.get('/outlook/auth', authenticateToken, (req, res) => {
  const scopes = [
    'offline_access',
    'https://graph.microsoft.com/Calendars.ReadWrite',
    'https://graph.microsoft.com/User.Read'
  ];

  const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
    `client_id=${MICROSOFT_CLIENT_ID}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(MICROSOFT_REDIRECT_URI)}` +
    `&scope=${encodeURIComponent(scopes.join(' '))}` +
    `&state=${req.user.id}` +
    `&response_mode=query`;

  res.json({ authUrl });
});

// Microsoft Outlook OAuth2 callback
router.get('/outlook/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      return res.status(400).json({ error: 'Authorization code or state missing' });
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: MICROSOFT_CLIENT_ID,
        client_secret: MICROSOFT_CLIENT_SECRET,
        code,
        redirect_uri: MICROSOFT_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      throw new Error(tokens.error_description || tokens.error);
    }

    // Get user info and default calendar
    const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    const userInfo = await userResponse.json();
    const calendarResponse = await fetch('https://graph.microsoft.com/v1.0/me/calendar', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    const calendarInfo = await calendarResponse.json();

    // Store sync configuration
    await pool.query(
      `INSERT INTO calendar_syncs (
        user_id, provider, access_token, refresh_token, 
        expires_at, calendar_id, sync_enabled
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id, provider) 
      DO UPDATE SET 
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        expires_at = EXCLUDED.expires_at,
        calendar_id = EXCLUDED.calendar_id,
        updated_at = CURRENT_TIMESTAMP`,
      [
        state, 'outlook', tokens.access_token, tokens.refresh_token,
        tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
        calendarInfo.id, true
      ]
    );

    // Perform initial sync
    await syncOutlookCalendar(state, calendarInfo.id);

    res.json({ 
      message: 'Outlook Calendar connected successfully',
      calendarId: calendarInfo.id
    });

  } catch (error) {
    console.error('Outlook OAuth callback error:', error);
    res.status(500).json({ error: 'Failed to connect Outlook Calendar' });
  }
});

// Sync Google Calendar events
async function syncGoogleCalendar(userId, calendarId) {
  try {
    const syncResult = await pool.query(
      'SELECT access_token, refresh_token FROM calendar_syncs WHERE user_id = $1 AND provider = $2',
      [userId, 'google']
    );

    if (syncResult.rows.length === 0) {
      throw new Error('No Google Calendar sync found for user');
    }

    const { access_token, refresh_token } = syncResult.rows[0];

    // Set credentials
    googleOAuth2Client.setCredentials({
      access_token,
      refresh_token
    });

    // Get calendar events
    const calendar = google.calendar({ version: 'v3', auth: googleOAuth2Client });
    const now = new Date();
    const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const eventsResponse = await calendar.events.list({
      calendarId,
      timeMin: now.toISOString(),
      timeMax: oneMonthFromNow.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });

    const events = eventsResponse.data.items || [];

    // Sync events to database
    for (const event of events) {
      const startTime = event.start.dateTime || event.start.date;
      const endTime = event.end.dateTime || event.end.date;

      // Check if event already exists
      const existingEvent = await pool.query(
        'SELECT id FROM events WHERE external_id = $1 AND user_id = $2',
        [event.id, userId]
      );

      if (existingEvent.rows.length === 0) {
        // Create new event
        await pool.query(
          `INSERT INTO events (
            user_id, title, description, start_time, end_time,
            location, type, external_id, external_calendar_id,
            all_day, is_ai_suggested
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            userId, event.summary || 'Untitled Event',
            event.description || null,
            new Date(startTime), new Date(endTime),
            event.location || null, 'meeting',
            event.id, calendarId,
            !event.start.dateTime, false
          ]
        );

        // Add attendees if any
        if (event.attendees) {
          const eventResult = await pool.query(
            'SELECT id FROM events WHERE external_id = $1 AND user_id = $2',
            [event.id, userId]
          );

          for (const attendee of event.attendees) {
            await pool.query(
              'INSERT INTO event_attendees (event_id, email, name, response_status) VALUES ($1, $2, $3, $4)',
              [
                eventResult.rows[0].id,
                attendee.email,
                attendee.displayName || null,
                attendee.responseStatus || 'pending'
              ]
            );
          }
        }
      }
    }

    // Update last sync time
    await pool.query(
      'UPDATE calendar_syncs SET last_sync = CURRENT_TIMESTAMP WHERE user_id = $1 AND provider = $2',
      [userId, 'google']
    );

    console.log(`✅ Synced ${events.length} events from Google Calendar for user ${userId}`);

  } catch (error) {
    console.error('Google Calendar sync error:', error);
    throw error;
  }
}

// Sync Outlook Calendar events
async function syncOutlookCalendar(userId, calendarId) {
  try {
    const syncResult = await pool.query(
      'SELECT access_token FROM calendar_syncs WHERE user_id = $1 AND provider = $2',
      [userId, 'outlook']
    );

    if (syncResult.rows.length === 0) {
      throw new Error('No Outlook Calendar sync found for user');
    }

    const { access_token } = syncResult.rows[0];

    // Get calendar events
    const now = new Date();
    const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const eventsResponse = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${now.toISOString()}&endDateTime=${oneMonthFromNow.toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      }
    );

    const eventsData = await eventsResponse.json();
    const events = eventsData.value || [];

    // Sync events to database
    for (const event of events) {
      // Check if event already exists
      const existingEvent = await pool.query(
        'SELECT id FROM events WHERE external_id = $1 AND user_id = $2',
        [event.id, userId]
      );

      if (existingEvent.rows.length === 0) {
        // Create new event
        await pool.query(
          `INSERT INTO events (
            user_id, title, description, start_time, end_time,
            location, type, external_id, external_calendar_id,
            all_day, is_ai_suggested
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            userId, event.subject || 'Untitled Event',
            event.body?.content || null,
            new Date(event.start.dateTime), new Date(event.end.dateTime),
            event.location?.displayName || null, 'meeting',
            event.id, calendarId,
            event.isAllDay || false, false
          ]
        );

        // Add attendees if any
        if (event.attendees) {
          const eventResult = await pool.query(
            'SELECT id FROM events WHERE external_id = $1 AND user_id = $2',
            [event.id, userId]
          );

          for (const attendee of event.attendees) {
            await pool.query(
              'INSERT INTO event_attendees (event_id, email, name, response_status) VALUES ($1, $2, $3, $4)',
              [
                eventResult.rows[0].id,
                attendee.emailAddress.address,
                attendee.emailAddress.name || null,
                attendee.status?.response || 'pending'
              ]
            );
          }
        }
      }
    }

    // Update last sync time
    await pool.query(
      'UPDATE calendar_syncs SET last_sync = CURRENT_TIMESTAMP WHERE user_id = $1 AND provider = $2',
      [userId, 'outlook']
    );

    console.log(`✅ Synced ${events.length} events from Outlook Calendar for user ${userId}`);

  } catch (error) {
    console.error('Outlook Calendar sync error:', error);
    throw error;
  }
}

// Manual sync trigger
router.post('/sync/:provider', authenticateToken, async (req, res) => {
  try {
    const { provider } = req.params;
    
    if (provider === 'google') {
      await syncGoogleCalendar(req.user.id, 'primary');
      res.json({ message: 'Google Calendar synced successfully' });
    } else if (provider === 'outlook') {
      await syncOutlookCalendar(req.user.id, 'default');
      res.json({ message: 'Outlook Calendar synced successfully' });
    } else {
      res.status(400).json({ error: 'Unsupported provider' });
    }

  } catch (error) {
    console.error('Manual sync error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
});

// Get sync status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT provider, sync_enabled, last_sync, calendar_id 
       FROM calendar_syncs 
       WHERE user_id = $1`,
      [req.user.id]
    );

    res.json({
      syncs: result.rows.map(row => ({
        provider: row.provider,
        enabled: row.sync_enabled,
        lastSync: row.last_sync,
        calendarId: row.calendar_id
      }))
    });

  } catch (error) {
    console.error('Get sync status error:', error);
    res.status(500).json({ error: 'Failed to get sync status' });
  }
});

// Disconnect calendar
router.delete('/disconnect/:provider', authenticateToken, async (req, res) => {
  try {
    const { provider } = req.params;
    
    await pool.query(
      'DELETE FROM calendar_syncs WHERE user_id = $1 AND provider = $2',
      [req.user.id, provider]
    );

    res.json({ message: `${provider} calendar disconnected successfully` });

  } catch (error) {
    console.error('Disconnect calendar error:', error);
    res.status(500).json({ error: 'Failed to disconnect calendar' });
  }
});

// Set up automatic sync every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  try {
    const syncs = await pool.query(
      'SELECT user_id, provider, calendar_id FROM calendar_syncs WHERE sync_enabled = true'
    );

    for (const sync of syncs.rows) {
      try {
        if (sync.provider === 'google') {
          await syncGoogleCalendar(sync.user_id, sync.calendar_id);
        } else if (sync.provider === 'outlook') {
          await syncOutlookCalendar(sync.user_id, sync.calendar_id);
        }
      } catch (error) {
        console.error(`Auto-sync failed for user ${sync.user_id}, provider ${sync.provider}:`, error);
      }
    }
  } catch (error) {
    console.error('Auto-sync error:', error);
  }
});

export default router;
