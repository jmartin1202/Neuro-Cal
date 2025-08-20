-- NeuroCal CRM System Database Migration
-- This script creates all necessary tables for the CRM functionality

-- CRM System Database Migration

-- Companies/Organizations table
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  website VARCHAR(500),
  phone VARCHAR(50),
  address JSONB,
  annual_revenue DECIMAL(15,2),
  employee_count INTEGER,
  founded_year INTEGER,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  job_title VARCHAR(200),
  department VARCHAR(100),
  address JSONB,
  birthday DATE,
  notes TEXT,
  tags TEXT[],
  lead_score INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect', 'customer', 'partner')),
  source VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
  company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  company_name VARCHAR(255),
  job_title VARCHAR(200),
  industry VARCHAR(100),
  lead_score INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  source VARCHAR(100),
  source_details TEXT,
  budget DECIMAL(15,2),
  timeline VARCHAR(100),
  notes TEXT,
  assigned_to INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deals/Opportunities table
CREATE TABLE IF NOT EXISTS deals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
  company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'USD',
  stage VARCHAR(50) DEFAULT 'prospecting' CHECK (stage IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,
  lead_source VARCHAR(100),
  campaign VARCHAR(100),
  notes TEXT,
  assigned_to INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS crm_tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  type VARCHAR(50) DEFAULT 'general' CHECK (type IN ('call', 'email', 'meeting', 'follow_up', 'proposal', 'general')),
  related_to_type VARCHAR(20) CHECK (related_to_type IN ('contact', 'lead', 'deal', 'company')),
  related_to_id INTEGER,
  assigned_to INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activities table (calls, emails, meetings, etc.)
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note', 'task', 'other')),
  subject VARCHAR(255),
  description TEXT,
  duration_minutes INTEGER,
  activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  related_to_type VARCHAR(20) CHECK (related_to_type IN ('contact', 'lead', 'deal', 'company')),
  related_to_id INTEGER,
  outcome VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deal stages history for tracking progression
CREATE TABLE IF NOT EXISTS deal_stage_history (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  stage VARCHAR(50) NOT NULL,
  changed_by INTEGER NOT NULL REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Contact interactions for relationship tracking
CREATE TABLE IF NOT EXISTS contact_interactions (
  id SERIAL PRIMARY KEY,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('email', 'call', 'meeting', 'note', 'task')),
  subject VARCHAR(255),
  description TEXT,
  interaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duration_minutes INTEGER,
  outcome VARCHAR(100),
  next_action TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CRM settings and preferences
CREATE TABLE IF NOT EXISTS crm_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lead_stages JSONB DEFAULT '[]',
  deal_stages JSONB DEFAULT '[]',
  lead_sources JSONB DEFAULT '[]',
  industries JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  email_templates JSONB DEFAULT '{}',
  automation_rules JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_lead_score ON contacts(lead_score);

CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON leads(lead_score);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);

CREATE INDEX IF NOT EXISTS idx_deals_user_id ON deals(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_amount ON deals(amount);
CREATE INDEX IF NOT EXISTS idx_deals_expected_close_date ON deals(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_deals_assigned_to ON deals(assigned_to);

CREATE INDEX IF NOT EXISTS idx_crm_tasks_user_id ON crm_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_status ON crm_tasks(status);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_due_date ON crm_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_assigned_to ON crm_tasks(assigned_to);

CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_activity_date ON activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_activities_related_to ON activities(related_to_type, related_to_id);

-- Insert default CRM settings
INSERT INTO crm_settings (user_id, lead_stages, deal_stages, lead_sources, industries, tags)
SELECT 
  u.id,
  '["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"]'::jsonb,
  '["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"]'::jsonb,
  '["Website", "Referral", "Cold Call", "Trade Show", "Social Media", "Email Campaign", "Other"]'::jsonb,
  '["Technology", "Healthcare", "Finance", "Manufacturing", "Retail", "Education", "Consulting", "Other"]'::jsonb,
  '["Hot Lead", "VIP", "Decision Maker", "Influencer", "Budget Holder", "Technical Contact"]'::jsonb
FROM users u
ON CONFLICT (user_id) DO NOTHING;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_tasks_updated_at BEFORE UPDATE ON crm_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_settings_updated_at BEFORE UPDATE ON crm_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for CRM dashboard data
CREATE OR REPLACE VIEW crm_dashboard AS
SELECT 
  u.id as user_id,
  u.display_name,
  COUNT(DISTINCT c.id) as total_contacts,
  COUNT(DISTINCT l.id) as total_leads,
  COUNT(DISTINCT d.id) as total_deals,
  COUNT(DISTINCT CASE WHEN d.stage = 'closed_won' THEN d.id END) as won_deals,
  COUNT(DISTINCT CASE WHEN d.stage = 'closed_lost' THEN d.id END) as lost_deals,
  COALESCE(SUM(CASE WHEN d.stage = 'closed_won' THEN d.amount ELSE 0 END), 0) as total_revenue,
  COUNT(DISTINCT CASE WHEN l.status = 'new' THEN l.id END) as new_leads,
  COUNT(DISTINCT CASE WHEN l.status = 'qualified' THEN l.id END) as qualified_leads,
  COUNT(DISTINCT t.id) as pending_tasks
FROM users u
LEFT JOIN contacts c ON u.id = c.user_id
LEFT JOIN leads l ON u.id = l.user_id
LEFT JOIN deals d ON u.id = d.user_id
LEFT JOIN crm_tasks t ON u.id = t.user_id AND t.status = 'pending'
GROUP BY u.id, u.display_name;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO neurocal_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO neurocal_user;

COMMENT ON TABLE companies IS 'Companies and organizations tracked in the CRM';
COMMENT ON TABLE contacts IS 'Individual contacts and people tracked in the CRM';
COMMENT ON TABLE leads IS 'Sales leads and prospects';
COMMENT ON TABLE deals IS 'Sales opportunities and deals';
COMMENT ON TABLE crm_tasks IS 'CRM-specific tasks and activities';
COMMENT ON TABLE activities IS 'All CRM activities and interactions';
COMMENT ON TABLE deal_stage_history IS 'History of deal stage changes';
COMMENT ON TABLE contact_interactions IS 'Detailed contact interaction history';
COMMENT ON TABLE crm_settings IS 'User-specific CRM configuration and preferences';
COMMENT ON VIEW crm_dashboard IS 'Aggregated CRM data for dashboard views';
