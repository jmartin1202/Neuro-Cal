import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from './auth.js';
import { pool } from '../server.js';

const router = express.Router();

// Get user preferences
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT preferences FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const preferences = result.rows[0].preferences || {};
    
    // Default preferences if none set
    const defaultPreferences = {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      workingHours: {
        start: '09:00',
        end: '17:00'
      },
      notifications: {
        email: true,
        push: true,
        reminderTime: 15
      },
      calendar: {
        defaultView: 'month',
        showWeekends: true,
        firstDayOfWeek: 1
      },
      ai: {
        suggestions: true,
        autoScheduling: false,
        meetingPrep: true
      }
    };

    const userPreferences = { ...defaultPreferences, ...preferences };

    res.json({ preferences: userPreferences });

  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Update user preferences
router.put('/preferences', authenticateToken, [
  body('preferences').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { preferences } = req.body;

    // Get current preferences
    const currentResult = await pool.query(
      'SELECT preferences FROM users WHERE id = $1',
      [req.user.id]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentPreferences = currentResult.rows[0].preferences || {};
    
    // Merge preferences (deep merge for nested objects)
    const mergedPreferences = deepMerge(currentPreferences, preferences);

    // Update preferences
    await pool.query(
      'UPDATE users SET preferences = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [JSON.stringify(mergedPreferences), req.user.id]
    );

    res.json({
      message: 'Preferences updated successfully',
      preferences: mergedPreferences
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Get user analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, period = '30' } = req.query;
    
    let dateFilter = '';
    const params = [req.user.id];
    let paramCount = 1;

    if (startDate && endDate) {
      dateFilter = `AND date >= $${++paramCount} AND date <= $${++paramCount}`;
      params.push(startDate, endDate);
    } else {
      // Default to last 30 days
      dateFilter = `AND date >= CURRENT_DATE - INTERVAL '${period} days'`;
    }

    // Get analytics data
    const analyticsResult = await pool.query(
      `SELECT * FROM user_analytics 
       WHERE user_id = $1 ${dateFilter}
       ORDER BY date DESC`,
      params
    );

    // Get event type distribution
    const eventTypeResult = await pool.query(
      `SELECT type, COUNT(*) as count, 
              SUM(EXTRACT(EPOCH FROM (end_time - start_time))/3600) as total_hours
       FROM events 
       WHERE user_id = $1 ${dateFilter.replace('date', 'start_time')}
       GROUP BY type`,
      params
    );

    // Get AI interaction stats
    const aiStatsResult = await pool.query(
      `SELECT interaction_type, COUNT(*) as count, 
              AVG(confidence_score) as avg_confidence
       FROM ai_interactions 
       WHERE user_id = $1 ${dateFilter.replace('date', 'created_at')}
       GROUP BY interaction_type`,
      params
    );

    // Calculate productivity trends
    const productivityTrends = analyticsResult.rows.map(row => ({
      date: row.date,
      productivityScore: parseFloat(row.productivity_score || 0),
      totalEvents: parseInt(row.total_events || 0),
      focusTime: parseInt(row.focus_time_minutes || 0),
      meetingTime: parseInt(row.meeting_time_minutes || 0)
    }));

    // Calculate summary statistics
    const totalDays = analyticsResult.rows.length;
    const avgProductivity = totalDays > 0 
      ? productivityTrends.reduce((sum, day) => sum + day.productivityScore, 0) / totalDays
      : 0;

    const totalFocusTime = productivityTrends.reduce((sum, day) => sum + day.focusTime, 0);
    const totalMeetingTime = productivityTrends.reduce((sum, day) => sum + day.meetingTime, 0);

    const analytics = {
      period: {
        startDate: startDate || new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: endDate || new Date().toISOString().split('T')[0],
        totalDays
      },
      summary: {
        averageProductivityScore: parseFloat(avgProductivity.toFixed(2)),
        totalFocusTimeHours: parseFloat((totalFocusTime / 60).toFixed(1)),
        totalMeetingTimeHours: parseFloat((totalMeetingTime / 60).toFixed(1)),
        averageEventsPerDay: totalDays > 0 ? parseFloat((productivityTrends.reduce((sum, day) => sum + day.totalEvents, 0) / totalDays).toFixed(1)) : 0
      },
      trends: productivityTrends,
      eventDistribution: eventTypeResult.rows.map(row => ({
        type: row.type,
        count: parseInt(row.count),
        totalHours: parseFloat(row.total_hours || 0)
      })),
      aiInteractions: aiStatsResult.rows.map(row => ({
        type: row.interaction_type,
        count: parseInt(row.count),
        averageConfidence: parseFloat(row.avg_confidence || 0)
      }))
    };

    res.json({ analytics });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get productivity insights
router.get('/productivity-insights', authenticateToken, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    // Get recent events and AI interactions
    const eventsResult = await pool.query(
      `SELECT type, start_time, end_time, is_ai_suggested
       FROM events 
       WHERE user_id = $1 AND start_time >= NOW() - INTERVAL '${days} days'`,
      [req.user.id]
    );

    const aiInteractionsResult = await pool.query(
      `SELECT interaction_type, confidence_score, created_at
       FROM ai_interactions 
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '${days} days'`,
      [req.user.id]
    );

    const events = eventsResult.rows;
    const aiInteractions = aiInteractionsResult.rows;

    // Calculate insights
    const totalEvents = events.length;
    const aiSuggestedEvents = events.filter(e => e.is_ai_suggested).length;
    const aiAdoptionRate = totalEvents > 0 ? (aiSuggestedEvents / totalEvents) * 100 : 0;

    // Time distribution analysis
    const meetingEvents = events.filter(e => e.type === 'meeting');
    const focusEvents = events.filter(e => e.type === 'focus');
    const breakEvents = events.filter(e => e.type === 'break');

    const totalMeetingTime = meetingEvents.reduce((sum, e) => {
      return sum + (new Date(e.end_time) - new Date(e.start_time)) / (1000 * 60);
    }, 0);

    const totalFocusTime = focusEvents.reduce((sum, e) => {
      return sum + (new Date(e.end_time) - new Date(e.start_time)) / (1000 * 60);
    }, 0);

    const totalBreakTime = breakEvents.reduce((sum, e) => {
      return sum + (new Date(e.end_time) - new Date(e.start_time)) / (1000 * 60);
    }, 0);

    // AI confidence analysis
    const avgAIConfidence = aiInteractions.length > 0 
      ? aiInteractions.reduce((sum, i) => sum + parseFloat(i.confidence_score || 0), 0) / aiInteractions.length
      : 0;

    // Generate recommendations
    const recommendations = [];
    
    if (totalMeetingTime > totalFocusTime * 2) {
      recommendations.push({
        type: 'balance',
        priority: 'high',
        title: 'Meeting Overload',
        description: 'Consider blocking more focus time to balance your schedule',
        action: 'Schedule 2-3 focus blocks this week'
      });
    }

    if (aiAdoptionRate < 30) {
      recommendations.push({
        type: 'ai',
        priority: 'medium',
        title: 'AI Underutilization',
        description: 'Try using AI suggestions more often for better scheduling',
        action: 'Use natural language to create your next 3 events'
      });
    }

    if (totalBreakTime < totalMeetingTime * 0.1) {
      recommendations.push({
        type: 'wellness',
        priority: 'medium',
        title: 'Break Time Needed',
        description: 'You might need more breaks between meetings',
        action: 'Add 15-minute breaks between back-to-back meetings'
      });
    }

    if (avgAIConfidence < 0.7) {
      recommendations.push({
        type: 'ai',
        priority: 'low',
        title: 'AI Learning',
        description: 'AI is still learning your preferences',
        action: 'Continue using AI to improve accuracy'
      });
    }

    const insights = {
      period: `${days} days`,
      metrics: {
        totalEvents,
        aiSuggestedEvents,
        aiAdoptionRate: parseFloat(aiAdoptionRate.toFixed(1)),
        totalMeetingTimeMinutes: Math.round(totalMeetingTime),
        totalFocusTimeMinutes: Math.round(totalFocusTime),
        totalBreakTimeMinutes: Math.round(totalBreakTime),
        averageAIConfidence: parseFloat(avgAIConfidence.toFixed(2))
      },
      distribution: {
        meetings: meetingEvents.length,
        focus: focusEvents.length,
        breaks: breakEvents.length,
        personal: events.filter(e => e.type === 'personal').length
      },
      recommendations,
      trends: {
        aiUsage: aiInteractions.length,
        productivityScore: calculateProductivityScore(events, aiInteractions)
      }
    };

    res.json({ insights });

  } catch (error) {
    console.error('Get productivity insights error:', error);
    res.status(500).json({ error: 'Failed to fetch productivity insights' });
  }
});

// Update user timezone
router.put('/timezone', authenticateToken, [
  body('timezone').isString().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { timezone } = req.body;

    // Validate timezone
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
    } catch (e) {
      return res.status(400).json({ error: 'Invalid timezone' });
    }

    await pool.query(
      'UPDATE users SET timezone = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [timezone, req.user.id]
    );

    res.json({ 
      message: 'Timezone updated successfully',
      timezone
    });

  } catch (error) {
    console.error('Update timezone error:', error);
    res.status(500).json({ error: 'Failed to update timezone' });
  }
});

// Get user dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    // Today's events
    const todayEventsResult = await pool.query(
      `SELECT e.*, array_agg(ea.email) as attendee_emails
       FROM events e
       LEFT JOIN event_attendees ea ON e.id = ea.event_id
       WHERE e.user_id = $1 AND DATE(e.start_time) = CURRENT_DATE
       GROUP BY e.id
       ORDER BY e.start_time`,
      [req.user.id]
    );

    // This week's events
    const weekEventsResult = await pool.query(
      `SELECT e.*, array_agg(ea.email) as attendee_emails
       FROM events e
       LEFT JOIN event_attendees ea ON e.id = ea.event_id
       WHERE e.user_id = $1 AND e.start_time >= $2
       GROUP BY e.id
       ORDER BY e.start_time`,
      [req.user.id, startOfWeek]
    );

    // Recent AI suggestions
    const aiSuggestionsResult = await pool.query(
      `SELECT * FROM smart_suggestions 
       WHERE user_id = $1 AND is_accepted = false
       ORDER BY created_at DESC
       LIMIT 5`,
      [req.user.id]
    );

    // Quick stats
    const statsResult = await pool.query(
      `SELECT 
         COUNT(*) as totalEvents,
         COUNT(CASE WHEN is_ai_suggested = true THEN 1 END) as aiEvents,
         COUNT(CASE WHEN type = 'meeting' THEN 1 END) as meetings,
         COUNT(CASE WHEN type = 'focus' THEN 1 END) as focusSessions
       FROM events 
       WHERE user_id = $1 AND start_time >= $2`,
      [req.user.id, startOfWeek]
    );

    const dashboard = {
      today: {
        date: today.toISOString().split('T')[0],
        events: todayEventsResult.rows.map(formatEvent)
      },
      week: {
        startDate: startOfWeek.toISOString().split('T')[0],
        events: weekEventsResult.rows.map(formatEvent)
      },
      aiSuggestions: aiSuggestionsResult.rows.map(row => ({
        id: row.id,
        type: row.suggestion_type,
        title: row.title,
        description: row.description,
        suggestedTime: row.suggested_time,
        priority: row.priority
      })),
      quickStats: {
        totalEvents: parseInt(statsResult.rows[0]?.totalEvents || 0),
        aiEvents: parseInt(statsResult.rows[0]?.aiEvents || 0),
        meetings: parseInt(statsResult.rows[0]?.meetings || 0),
        focusSessions: parseInt(statsResult.rows[0]?.focusSessions || 0)
      }
    };

    res.json({ dashboard });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Helper function to format events
function formatEvent(row) {
  return {
    id: row.id,
    title: row.title,
    startTime: row.start_time,
    endTime: row.end_time,
    type: row.type,
    color: row.color,
    location: row.location,
    attendees: row.attendee_emails?.filter(email => email !== null) || []
  };
}

// Helper function to calculate productivity score
function calculateProductivityScore(events, aiInteractions) {
  if (events.length === 0) return 0;

  let score = 0;
  
  // Base score from event distribution
  const meetingRatio = events.filter(e => e.type === 'meeting').length / events.length;
  const focusRatio = events.filter(e => e.type === 'focus').length / events.length;
  
  // Ideal ratios: 40% meetings, 40% focus, 20% breaks/personal
  score += Math.max(0, 1 - Math.abs(meetingRatio - 0.4) * 2);
  score += Math.max(0, 1 - Math.abs(focusRatio - 0.4) * 2);
  
  // AI usage bonus
  const aiUsageRatio = aiInteractions.length / events.length;
  score += Math.min(0.2, aiUsageRatio * 0.2);
  
  return Math.min(1, Math.max(0, score / 2.2));
}

// Helper function for deep merging objects
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

export default router;
