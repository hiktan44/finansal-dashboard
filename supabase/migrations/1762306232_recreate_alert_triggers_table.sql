-- Migration: recreate_alert_triggers_table
-- Created at: 1762306232

-- Drop existing table
DROP TABLE IF EXISTS alert_triggers CASCADE;

-- Recreate with correct schema
CREATE TABLE alert_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  trigger_value NUMERIC NOT NULL,
  current_price NUMERIC NOT NULL,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE alert_triggers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own triggers" ON alert_triggers
  FOR SELECT
  USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Service can insert triggers" ON alert_triggers
  FOR INSERT
  WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- Create indexes
CREATE INDEX idx_alert_triggers_user_id ON alert_triggers(user_id);
CREATE INDEX idx_alert_triggers_alert_id ON alert_triggers(alert_id);
CREATE INDEX idx_alert_triggers_triggered_at ON alert_triggers(triggered_at DESC);;