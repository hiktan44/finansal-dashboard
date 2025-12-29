-- Migration: recreate_user_alerts_table
-- Created at: 1762306253

-- Drop existing table
DROP TABLE IF EXISTS user_alerts CASCADE;

-- Recreate with correct schema
CREATE TABLE user_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_target', 'percentage_change', 'volume_spike', 'volatility')),
  condition TEXT NOT NULL CHECK (condition IN ('above', 'below')),
  threshold NUMERIC NOT NULL,
  notification_method TEXT[] DEFAULT ARRAY['push']::TEXT[],
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  last_triggered TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own alerts" ON user_alerts
  FOR SELECT
  USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can insert own alerts" ON user_alerts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can update own alerts" ON user_alerts
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can delete own alerts" ON user_alerts
  FOR DELETE
  USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

-- Create indexes
CREATE INDEX idx_user_alerts_user_id ON user_alerts(user_id);
CREATE INDEX idx_user_alerts_symbol ON user_alerts(symbol);
CREATE INDEX idx_user_alerts_is_active ON user_alerts(is_active) WHERE is_active = true;;