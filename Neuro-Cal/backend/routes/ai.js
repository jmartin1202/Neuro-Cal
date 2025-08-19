import express from 'express';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from './auth.js';
import { pool } from '../server.js';

const router = express.Router();

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// AI-powered event creation from natural language
router.post('/create-event', authenticateToken, [
  body('inputText').notEmpty().trim(),
  body('preferredDate').optional().isISO8601(),
  body('context').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { inputText, preferredDate, context } = req.body;

    // Use OpenAI to parse natural language into structured event data
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an AI calendar assistant. Parse the user's natural language input and extract event details. Return a JSON object with the following structure:
          {
            "title": "Event title",
            "description": "Event description",
            "startTime": "YYYY-MM-DD HH:MM",
            "endTime": "YYYY-MM-DD HH:MM", 
            "duration": "duration in minutes",
            "location": "location if mentioned",
            "attendees": ["email1", "email2"],
            "type": "meeting|focus|break|personal",
            "priority": "high|medium|low",
            "confidence": 0.95
          }
          
          Rules:
          - If no specific time is mentioned, suggest optimal times based on context
          - If no duration is mentioned, estimate based on event type
          - Use current date if no date is specified
          - Suggest location if relevant
          - Extract email addresses for attendees
          - Set appropriate priority based on keywords
          - Confidence should be 0.0-1.0 based on clarity of input`
        },
        {
          role: "user",
          content: `User input: "${inputText}"\nPreferred date: ${preferredDate || 'today'}\nContext: ${context || 'none'}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const aiResponse = completion.choices[0].message.content;
    let eventData;
    
    try {
      eventData = JSON.parse(aiResponse);
    } catch (parseError) {
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    // Validate and process the AI response
    if (!eventData.title || !eventData.startTime) {
      return res.status(400).json({ error: 'AI could not extract required event information' });
    }

    // Convert times to proper format
    const startTime = new Date(eventData.startTime);
    const endTime = new Date(eventData.endTime);

    // Create event in database
    const eventResult = await pool.query(
      `INSERT INTO events (
        user_id, title, description, start_time, end_time, 
        location, type, is_ai_suggested, ai_confidence
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING id, title, start_time, end_time, location, type`,
      [
        req.user.id, eventData.title, eventData.description, 
        startTime, endTime, eventData.location, eventData.type,
        true, eventData.confidence
      ]
    );

    const event = eventResult.rows[0];

    // Add attendees if any
    if (eventData.attendees && eventData.attendees.length > 0) {
      for (const email of eventData.attendees) {
        await pool.query(
          'INSERT INTO event_attendees (event_id, email) VALUES ($1, $2)',
          [event.id, email]
        );
      }
    }

    // Log AI interaction
    await pool.query(
      `INSERT INTO ai_interactions (
        user_id, interaction_type, input_text, ai_response, 
        model_used, tokens_used, confidence_score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        req.user.id, 'event_creation', inputText, aiResponse,
        'gpt-4', completion.usage.total_tokens, eventData.confidence
      ]
    );

    res.status(201).json({
      message: 'Event created successfully with AI assistance',
      event: {
        id: event.id,
        title: event.title,
        startTime: event.start_time,
        endTime: event.end_time,
        location: event.location,
        type: event.type,
        isAiSuggested: true,
        confidence: eventData.confidence
      }
    });

  } catch (error) {
    console.error('AI event creation error:', error);
    res.status(500).json({ error: 'Failed to create event with AI' });
  }
});

// Smart scheduling suggestions
router.get('/suggestions', authenticateToken, async (req, res) => {
  try {
    const { date, duration, type } = req.query;
    
    // Get user's existing events and preferences
    const eventsResult = await pool.query(
      `SELECT start_time, end_time, type FROM events 
       WHERE user_id = $1 AND DATE(start_time) = $2`,
      [req.user.id, date || new Date().toISOString().split('T')[0]]
    );

    const existingEvents = eventsResult.rows;
    
    // Use Claude to analyze schedule and suggest optimal times
    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `Analyze this user's schedule and suggest optimal times for a ${duration || '1 hour'} ${type || 'meeting'} on ${date || 'today'}.
          
          Existing events:
          ${existingEvents.map(e => `${e.start_time} - ${e.end_time} (${e.type})`).join('\n')}
          
          Rules:
          - Avoid scheduling conflicts
          - Consider typical work hours (9 AM - 5 PM)
          - Leave buffer time between meetings
          - Suggest 2-3 optimal time slots
          - Consider the type of activity
          
          Return a JSON response with:
          {
            "suggestions": [
              {
                "startTime": "YYYY-MM-DD HH:MM",
                "endTime": "YYYY-MM-DD HH:MM",
                "reason": "why this time is optimal",
                "confidence": 0.95
              }
            ],
            "analysis": "brief analysis of current schedule",
            "recommendations": ["tip1", "tip2"]
          }`
        }
      ]
    });

    const aiResponse = message.content[0].text;
    let suggestions;
    
    try {
      suggestions = JSON.parse(aiResponse);
    } catch (parseError) {
      return res.status(500).json({ error: 'Failed to parse AI suggestions' });
    }

    // Store suggestions in database
    for (const suggestion of suggestions.suggestions) {
      await pool.query(
        `INSERT INTO smart_suggestions (
          user_id, suggestion_type, title, description, 
          suggested_time, priority
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          req.user.id, 'time_slot', 
          `${type || 'Activity'} Suggestion`, 
          suggestion.reason,
          new Date(suggestion.startTime), 1
        ]
      );
    }

    res.json({
      suggestions: suggestions.suggestions,
      analysis: suggestions.analysis,
      recommendations: suggestions.recommendations
    });

  } catch (error) {
    console.error('AI suggestions error:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

// AI-powered calendar insights
router.get('/insights', authenticateToken, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    // Get user's calendar data for analysis
    const eventsResult = await pool.query(
      `SELECT title, type, start_time, end_time, location 
       FROM events 
       WHERE user_id = $1 AND start_time >= NOW() - INTERVAL '${days} days'
       ORDER BY start_time DESC`,
      [req.user.id]
    );

    const events = eventsResult.rows;
    
    if (events.length === 0) {
      return res.json({
        insights: [],
        productivityScore: 0,
        recommendations: ['Start adding events to get personalized insights']
      });
    }

    // Use Claude to analyze calendar patterns
    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `Analyze this user's calendar data and provide insights:
          
          Events (last ${days} days):
          ${events.map(e => `${e.start_time}: ${e.title} (${e.type})`).join('\n')}
          
          Provide insights about:
          - Time distribution (meetings vs focus work)
          - Productivity patterns
          - Schedule optimization opportunities
          - Work-life balance
          
          Return JSON:
          {
            "insights": [
              {
                "type": "productivity|balance|optimization",
                "title": "Insight title",
                "description": "Detailed description",
                "impact": "high|medium|low",
                "actionable": true
              }
            ],
            "productivityScore": 0.85,
            "recommendations": ["actionable tip 1", "tip 2"],
            "patterns": {
              "meetingRatio": 0.6,
              "focusTimeRatio": 0.3,
              "breakTimeRatio": 0.1
            }
          }`
        }
      ]
    });

    const aiResponse = message.content[0].text;
    let insights;
    
    try {
      insights = JSON.parse(aiResponse);
    } catch (parseError) {
      return res.status(500).json({ error: 'Failed to parse AI insights' });
    }

    // Store insights in database
    for (const insight of insights.insights) {
      await pool.query(
        `INSERT INTO ai_interactions (
          user_id, interaction_type, input_text, ai_response, 
          model_used, confidence_score
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          req.user.id, 'calendar_insights', 
          `Analysis of ${days} days of calendar data`,
          JSON.stringify(insight), 'claude-3-sonnet', 0.9
        ]
      );
    }

    res.json(insights);

  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// AI meeting preparation assistant
router.post('/meeting-prep', authenticateToken, [
  body('eventId').isUUID(),
  body('questions').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId, questions = [] } = req.body;

    // Get event details
    const eventResult = await pool.query(
      `SELECT e.*, array_agg(ea.email) as attendee_emails
       FROM events e
       LEFT JOIN event_attendees ea ON e.id = ea.event_id
       WHERE e.id = $1 AND e.user_id = $2
       GROUP BY e.id`,
      [eventId, req.user.id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = eventResult.rows[0];

    // Use OpenAI to generate meeting preparation content
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an AI meeting preparation assistant. Help prepare for the upcoming meeting by providing:
          1. Agenda suggestions
          2. Key discussion points
          3. Preparation checklist
          4. Follow-up action items template
          
          Be specific and actionable. Consider the meeting type, duration, and attendees.`
        },
        {
          role: "user",
          content: `Meeting: ${event.title}
          Date: ${event.start_time}
          Duration: ${Math.round((new Date(event.end_time) - new Date(event.start_time)) / 60000)} minutes
          Type: ${event.type}
          Attendees: ${event.attendee_emails?.join(', ') || 'None'}
          Description: ${event.description || 'No description'}
          
          Specific questions: ${questions.join(', ') || 'None'}
          
          Please provide comprehensive meeting preparation assistance.`
        }
      ],
      temperature: 0.4,
      max_tokens: 800
    });

    const aiResponse = completion.choices[0].message.content;

    // Log AI interaction
    await pool.query(
      `INSERT INTO ai_interactions (
        user_id, interaction_type, input_text, ai_response, 
        model_used, tokens_used
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.user.id, 'meeting_preparation', 
        `Meeting prep for: ${event.title}`,
        aiResponse, 'gpt-4', completion.usage.total_tokens
      ]
    );

    res.json({
      message: 'Meeting preparation generated successfully',
      preparation: aiResponse,
      event: {
        id: event.id,
        title: event.title,
        startTime: event.start_time,
        attendees: event.attendee_emails
      }
    });

  } catch (error) {
    console.error('AI meeting prep error:', error);
    res.status(500).json({ error: 'Failed to generate meeting preparation' });
  }
});

export default router;
