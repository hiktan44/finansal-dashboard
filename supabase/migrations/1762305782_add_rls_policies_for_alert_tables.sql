-- Migration: add_rls_policies_for_alert_tables
-- Created at: 1762305782

-- Enable RLS
ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- user_alerts policies
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

-- alert_triggers policies
CREATE POLICY "Users can view own triggers" ON alert_triggers
  FOR SELECT
  USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Service can insert triggers" ON alert_triggers
  FOR INSERT
  WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- notification_logs policies
CREATE POLICY "Users can view own logs" ON notification_logs
  FOR SELECT
  USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Service can insert logs" ON notification_logs
  FOR INSERT
  WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- alert_preferences policies
CREATE POLICY "Users can view own preferences" ON alert_preferences
  FOR SELECT
  USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can insert own preferences" ON alert_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can update own preferences" ON alert_preferences
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

-- push_subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON push_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can insert own subscriptions" ON push_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can update own subscriptions" ON push_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));;