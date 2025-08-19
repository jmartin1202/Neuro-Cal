import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'neurocal',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

const createTables = async () => {
  try {
    console.log('🚀 Starting database migration...');

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        timezone VARCHAR(50) DEFAULT 'UTC',
        preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Calendar syncs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS calendar_syncs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        provider VARCHAR(50) NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at TIMESTAMP,
        calendar_id VARCHAR(255),
        sync_enabled BOOLEAN DEFAULT true,
        last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Events table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        all_day BOOLEAN DEFAULT false,
        location VARCHAR(255),
        color VARCHAR(7) DEFAULT '#3B82F6',
        type VARCHAR(50) DEFAULT 'event',
        recurrence_rule TEXT,
        external_id VARCHAR(255),
        external_calendar_id VARCHAR(255),
        is_ai_suggested BOOLEAN DEFAULT false,
        ai_confidence DECIMAL(3,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Event attendees table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_attendees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID REFERENCES events(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        response_status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // AI interactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_interactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        interaction_type VARCHAR(50) NOT NULL,
        input_text TEXT,
        ai_response TEXT,
        model_used VARCHAR(50),
        tokens_used INTEGER,
        confidence_score DECIMAL(3,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Smart suggestions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS smart_suggestions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        suggestion_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        suggested_time TIMESTAMP,
        priority INTEGER DEFAULT 1,
        is_accepted BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // User analytics table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_analytics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        total_events INTEGER DEFAULT 0,
        focus_time_minutes INTEGER DEFAULT 0,
        meeting_time_minutes INTEGER DEFAULT 0,
        productivity_score DECIMAL(3,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
      CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
      CREATE INDEX IF NOT EXISTS idx_events_external_id ON events(external_id);
      CREATE INDEX IF NOT EXISTS idx_calendar_syncs_user_id ON calendar_syncs(user_id);
      CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON ai_interactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_smart_suggestions_user_id ON smart_suggestions(user_id);
    `);

    console.log('✅ Database migration completed successfully!');
    console.log('📊 Tables created: users, calendar_syncs, events, event_attendees, ai_interactions, smart_suggestions, user_analytics');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

createTables().catch(console.error);
