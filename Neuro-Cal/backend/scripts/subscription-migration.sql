-- NeuroCal Subscription System Database Migration
-- Run this script to create all necessary tables for the subscription system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  stripe_price_id_monthly VARCHAR(255),
  stripe_price_id_yearly VARCHAR(255),
  features JSONB NOT NULL DEFAULT '{}',
  limits JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id),
  status VARCHAR(50) NOT NULL CHECK (status IN ('trial', 'active', 'canceled', 'past_due', 'unpaid', 'expired')),
  trial_start_date TIMESTAMP,
  trial_end_date TIMESTAMP,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  payment_method_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  feature VARCHAR(100) NOT NULL,
  usage_count INTEGER DEFAULT 0,
  reset_date TIMESTAMP,
  month_year VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, feature, month_year)
);

-- Billing history table
CREATE TABLE IF NOT EXISTS billing_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  subscription_id UUID REFERENCES user_subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL CHECK (status IN ('paid', 'failed', 'refunded', 'pending')),
  stripe_invoice_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  billing_period_start TIMESTAMP,
  billing_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_trial_end ON user_subscriptions(trial_end_date) WHERE status = 'trial';
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_feature_month ON user_usage(user_id, feature, month_year);
CREATE INDEX IF NOT EXISTS idx_billing_history_user_date ON billing_history(user_id, created_at DESC);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, features, limits) VALUES
('basic', 'Basic', 'Essential AI scheduling features', 4.99, 49.99, 
 '{"basic_ai": true, "email_support": true, "basic_notifications": true, "limited_analytics": true}',
 '{"calendar_integrations": 2, "ai_suggestions": 50, "storage_gb": 1}'),
('pro', 'Pro', 'Full AI-powered scheduling experience', 9.99, 99.99,
 '{"advanced_ai": true, "priority_support": true, "full_analytics": true, "team_features": true, "export": true, "advanced_notifications": true, "meeting_prep_ai": true, "travel_time_calc": true}',
 '{"calendar_integrations": -1, "ai_suggestions": -1, "storage_gb": 10}')
ON CONFLICT (name) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_usage_updated_at BEFORE UPDATE ON user_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE subscription_plans IS 'Available subscription plans and their features';
COMMENT ON TABLE user_subscriptions IS 'User subscription status and billing information';
COMMENT ON TABLE user_usage IS 'Feature usage tracking for billing and limits';
COMMENT ON TABLE billing_history IS 'Payment history and invoice records';

COMMENT ON COLUMN subscription_plans.features IS 'JSON object containing feature flags for the plan';
COMMENT ON COLUMN subscription_plans.limits IS 'JSON object containing usage limits for the plan (-1 means unlimited)';
COMMENT ON COLUMN user_subscriptions.status IS 'Current subscription status: trial, active, canceled, past_due, unpaid, expired';
COMMENT ON COLUMN user_usage.month_year IS 'Month and year for usage tracking in YYYY-MM format';
COMMENT ON COLUMN user_usage.usage_count IS 'Current usage count for the feature in the given month';
