-- Migration: setup_rls_policies_and_indexes
-- Created at: 1762430568

-- Enable RLS on all tables
ALTER TABLE economic_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE economic_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_fetch_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE update_schedule ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow both anon and service_role (best practice for Edge Functions)
-- Economic Indicators
CREATE POLICY "Allow read access to economic_indicators" ON economic_indicators
  FOR SELECT USING (auth.role() IN ('anon', 'service_role', 'authenticated'));

CREATE POLICY "Allow write access to economic_indicators" ON economic_indicators
  FOR ALL USING (auth.role() IN ('anon', 'service_role'));

-- Economic Data
CREATE POLICY "Allow read access to economic_data" ON economic_data
  FOR SELECT USING (auth.role() IN ('anon', 'service_role', 'authenticated'));

CREATE POLICY "Allow write access to economic_data" ON economic_data
  FOR ALL USING (auth.role() IN ('anon', 'service_role'));

-- Analysis Sections
CREATE POLICY "Allow read access to analysis_sections" ON analysis_sections
  FOR SELECT USING (auth.role() IN ('anon', 'service_role', 'authenticated'));

CREATE POLICY "Allow write access to analysis_sections" ON analysis_sections
  FOR ALL USING (auth.role() IN ('anon', 'service_role'));

-- Data Fetch Logs
CREATE POLICY "Allow read access to data_fetch_logs" ON data_fetch_logs
  FOR SELECT USING (auth.role() IN ('anon', 'service_role', 'authenticated'));

CREATE POLICY "Allow write access to data_fetch_logs" ON data_fetch_logs
  FOR ALL USING (auth.role() IN ('anon', 'service_role'));

-- Update Schedule
CREATE POLICY "Allow read access to update_schedule" ON update_schedule
  FOR SELECT USING (auth.role() IN ('anon', 'service_role', 'authenticated'));

CREATE POLICY "Allow write access to update_schedule" ON update_schedule
  FOR ALL USING (auth.role() IN ('anon', 'service_role'));

-- Create indexes for performance
CREATE INDEX idx_economic_data_indicator ON economic_data(indicator_code);
CREATE INDEX idx_economic_data_date ON economic_data(period_date DESC);
CREATE INDEX idx_economic_data_fetched ON economic_data(fetched_at DESC);
CREATE INDEX idx_analysis_sections_section_id ON analysis_sections(section_id);
CREATE INDEX idx_data_fetch_logs_created ON data_fetch_logs(created_at DESC);
CREATE INDEX idx_update_schedule_next_run ON update_schedule(next_run) WHERE is_active = true;;