import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { authenticateToken } from './auth.js';
import { pool } from '../server.js';

const router = express.Router();

// Get events for a specific date range
router.get('/events', authenticateToken, [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('type').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startDate, endDate, type, limit = 50 } = req.query;
    
    let query = `
      SELECT e.*, 
             array_agg(json_build_object('email', ea.email, 'name', ea.name, 'status', ea.response_status)) as attendees
      FROM events e
      LEFT JOIN event_attendees ea ON e.id = ea.event_id
      WHERE e.user_id = $1
    `;
    
    const params = [req.user.id];
    let paramCount = 1;

    if (startDate) {
      paramCount++;
      query += ` AND e.start_time >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND e.end_time <= $${paramCount}`;
      params.push(endDate);
    }

    if (type) {
      paramCount++;
      query += ` AND e.type = $${paramCount}`;
      params.push(type);
    }

    query += ` GROUP BY e.id ORDER BY e.start_time DESC LIMIT $${paramCount + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);

    const events = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      startTime: row.start_time,
      endTime: row.end_time,
      allDay: row.all_day,
      location: row.location,
      color: row.color,
      type: row.type,
      recurrenceRule: row.recurrence_rule,
      isAiSuggested: row.is_ai_suggested,
      aiConfidence: row.ai_confidence,
      attendees: row.attendees.filter(a => a.email !== null),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({ events });

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get a specific event
router.get('/events/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT e.*, 
              array_agg(json_build_object('email', ea.email, 'name', ea.name, 'status', ea.response_status)) as attendees
       FROM events e
       LEFT JOIN event_attendees ea ON e.id = ea.event_id
       WHERE e.id = $1 AND e.user_id = $2
       GROUP BY e.id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = result.rows[0];
    res.json({
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        startTime: event.start_time,
        endTime: event.end_time,
        allDay: event.all_day,
        location: event.location,
        color: event.color,
        type: event.type,
        recurrenceRule: event.recurrence_rule,
        isAiSuggested: event.is_ai_suggested,
        aiConfidence: event.ai_confidence,
        attendees: event.attendees.filter(a => a.email !== null),
        createdAt: event.created_at,
        updatedAt: event.updated_at
      }
    });

  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create a new event
router.post('/events', authenticateToken, [
  body('title').notEmpty().trim(),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  body('type').optional().isIn(['meeting', 'focus', 'break', 'personal']),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i),
  body('allDay').optional().isBoolean(),
  body('location').optional().trim(),
  body('description').optional().trim(),
  body('attendees').optional().isArray(),
  body('recurrenceRule').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title, startTime, endTime, type = 'meeting', color = '#3B82F6',
      allDay = false, location, description, attendees = [], recurrenceRule
    } = req.body;

    // Validate time logic
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    // Create event
    const eventResult = await pool.query(
      `INSERT INTO events (
        user_id, title, description, start_time, end_time,
        all_day, location, color, type, recurrence_rule
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, title, start_time, end_time, location, type, color`,
      [
        req.user.id, title, description, new Date(startTime), new Date(endTime),
        allDay, location, color, type, recurrenceRule
      ]
    );

    const event = eventResult.rows[0];

    // Add attendees if any
    if (attendees.length > 0) {
      for (const attendee of attendees) {
        if (attendee.email) {
          await pool.query(
            'INSERT INTO event_attendees (event_id, email, name) VALUES ($1, $2, $3)',
            [event.id, attendee.email, attendee.name || null]
          );
        }
      }
    }

    res.status(201).json({
      message: 'Event created successfully',
      event: {
        id: event.id,
        title: event.title,
        startTime: event.start_time,
        endTime: event.end_time,
        location: event.location,
        type: event.type,
        color: event.color
      }
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update an event
router.put('/events/:id', authenticateToken, [
  body('title').optional().notEmpty().trim(),
  body('startTime').optional().isISO8601(),
  body('endTime').optional().isISO8601(),
  body('type').optional().isIn(['meeting', 'focus', 'break', 'personal']),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i),
  body('allDay').optional().isBoolean(),
  body('location').optional().trim(),
  body('description').optional().trim(),
  body('attendees').optional().isArray(),
  body('recurrenceRule').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if event exists and belongs to user
    const existingEvent = await pool.query(
      'SELECT id FROM events WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (existingEvent.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Validate time logic if both times are provided
    if (updateData.startTime && updateData.endTime) {
      if (new Date(updateData.startTime) >= new Date(updateData.endTime)) {
        return res.status(400).json({ error: 'End time must be after start time' });
      }
    }

    // Build update query
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (updateData.title !== undefined) {
      updateFields.push(`title = $${paramCount++}`);
      values.push(updateData.title);
    }
    if (updateData.description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      values.push(updateData.description);
    }
    if (updateData.startTime !== undefined) {
      updateFields.push(`start_time = $${paramCount++}`);
      values.push(new Date(updateData.startTime));
    }
    if (updateData.endTime !== undefined) {
      updateFields.push(`end_time = $${paramCount++}`);
      values.push(new Date(updateData.endTime));
    }
    if (updateData.allDay !== undefined) {
      updateFields.push(`all_day = $${paramCount++}`);
      values.push(updateData.allDay);
    }
    if (updateData.location !== undefined) {
      updateFields.push(`location = $${paramCount++}`);
      values.push(updateData.location);
    }
    if (updateData.color !== undefined) {
      updateFields.push(`color = $${paramCount++}`);
      values.push(updateData.color);
    }
    if (updateData.type !== undefined) {
      updateFields.push(`type = $${paramCount++}`);
      values.push(updateData.type);
    }
    if (updateData.recurrenceRule !== undefined) {
      updateFields.push(`recurrence_rule = $${paramCount++}`);
      values.push(updateData.recurrenceRule);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE events SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    const event = result.rows[0];

    // Update attendees if provided
    if (updateData.attendees !== undefined) {
      // Remove existing attendees
      await pool.query('DELETE FROM event_attendees WHERE event_id = $1', [id]);

      // Add new attendees
      if (updateData.attendees.length > 0) {
        for (const attendee of updateData.attendees) {
          if (attendee.email) {
            await pool.query(
              'INSERT INTO event_attendees (event_id, email, name) VALUES ($1, $2, $3)',
              [id, attendee.email, attendee.name || null]
            );
          }
        }
      }
    }

    res.json({
      message: 'Event updated successfully',
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        startTime: event.start_time,
        endTime: event.end_time,
        allDay: event.all_day,
        location: event.location,
        color: event.color,
        type: event.type,
        recurrenceRule: event.recurrence_rule,
        updatedAt: event.updated_at
      }
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete an event
router.delete('/events/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if event exists and belongs to user
    const existingEvent = await pool.query(
      'SELECT id FROM events WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (existingEvent.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Delete event (attendees will be deleted automatically due to CASCADE)
    await pool.query('DELETE FROM events WHERE id = $1', [id]);

    res.json({ message: 'Event deleted successfully' });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Search events
router.get('/search', authenticateToken, [
  query('query').notEmpty().trim(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('type').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { query: searchQuery, startDate, endDate, type } = req.query;
    
    let sqlQuery = `
      SELECT e.*, 
             array_agg(json_build_object('email', ea.email, 'name', ea.name, 'status', ea.response_status)) as attendees
      FROM events e
      LEFT JOIN event_attendees ea ON e.id = ea.event_id
      WHERE e.user_id = $1 
        AND (e.title ILIKE $2 OR e.description ILIKE $2 OR e.location ILIKE $2)
    `;
    
    const params = [req.user.id, `%${searchQuery}%`];
    let paramCount = 2;

    if (startDate) {
      paramCount++;
      sqlQuery += ` AND e.start_time >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      sqlQuery += ` AND e.end_time <= $${paramCount}`;
      params.push(endDate);
    }

    if (type) {
      paramCount++;
      sqlQuery += ` AND e.type = $${paramCount}`;
      params.push(type);
    }

    sqlQuery += ` GROUP BY e.id ORDER BY e.start_time DESC`;

    const result = await pool.query(sqlQuery, params);

    const events = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      startTime: row.start_time,
      endTime: row.end_time,
      location: row.location,
      type: row.type,
      color: row.color,
      attendees: row.attendees.filter(a => a.email !== null)
    }));

    res.json({ 
      events,
      total: events.length,
      query: searchQuery
    });

  } catch (error) {
    console.error('Search events error:', error);
    res.status(500).json({ error: 'Failed to search events' });
  }
});

// Get calendar statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = '';
    const params = [req.user.id];
    let paramCount = 1;

    if (startDate && endDate) {
      dateFilter = `AND e.start_time >= $${++paramCount} AND e.end_time <= $${++paramCount}`;
      params.push(startDate, endDate);
    }

    // Total events
    const totalEventsResult = await pool.query(
      `SELECT COUNT(*) as total FROM events e WHERE e.user_id = $1 ${dateFilter}`,
      params
    );

    // Events by type
    const eventsByTypeResult = await pool.query(
      `SELECT type, COUNT(*) as count FROM events e 
       WHERE e.user_id = $1 ${dateFilter}
       GROUP BY type`,
      params
    );

    // AI suggested events
    const aiEventsResult = await pool.query(
      `SELECT COUNT(*) as count FROM events e 
       WHERE e.user_id = $1 AND e.is_ai_suggested = true ${dateFilter}`,
      params
    );

    // Average event duration
    const avgDurationResult = await pool.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (e.end_time - e.start_time))/3600 as avg_hours 
       FROM events e 
       WHERE e.user_id = $1 AND e.all_day = false ${dateFilter}`,
      params
    );

    // Busiest day of week
    const busiestDayResult = await pool.query(
      `SELECT EXTRACT(DOW FROM e.start_time) as day_of_week, COUNT(*) as count
       FROM events e 
       WHERE e.user_id = $1 ${dateFilter}
       GROUP BY EXTRACT(DOW FROM e.start_time)
       ORDER BY count DESC
       LIMIT 1`,
      params
    );

    const stats = {
      totalEvents: parseInt(totalEventsResult.rows[0].total),
      eventsByType: eventsByTypeResult.rows.reduce((acc, row) => {
        acc[row.type] = parseInt(row.count);
        return acc;
      }, {}),
      aiSuggestedEvents: parseInt(aiEventsResult.rows[0].count),
      averageDurationHours: parseFloat(avgDurationResult.rows[0].avg_hours || 0),
      busiestDay: busiestDayResult.rows[0] ? {
        dayOfWeek: parseInt(busiestDayResult.rows[0].day_of_week),
        count: parseInt(busiestDayResult.rows[0].count)
      } : null
    };

    res.json({ stats });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
