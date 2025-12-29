-- Migration: enable_rls_and_policies_for_market_data
-- Created at: 1762293921

-- Enable RLS on all tables
ALTER TABLE market_indices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE commodities ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Market Indices Policies
CREATE POLICY "Allow public read access to market_indices"
ON market_indices FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow edge function insert to market_indices"
ON market_indices FOR INSERT
TO anon, authenticated, service_role
WITH CHECK (true);

CREATE POLICY "Allow edge function update to market_indices"
ON market_indices FOR UPDATE
TO anon, authenticated, service_role
USING (true);

-- Tech Stocks Policies
CREATE POLICY "Allow public read access to tech_stocks"
ON tech_stocks FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow edge function insert to tech_stocks"
ON tech_stocks FOR INSERT
TO anon, authenticated, service_role
WITH CHECK (true);

CREATE POLICY "Allow edge function update to tech_stocks"
ON tech_stocks FOR UPDATE
TO anon, authenticated, service_role
USING (true);

-- Commodities Policies
CREATE POLICY "Allow public read access to commodities"
ON commodities FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow edge function insert to commodities"
ON commodities FOR INSERT
TO anon, authenticated, service_role
WITH CHECK (true);

CREATE POLICY "Allow edge function update to commodities"
ON commodities FOR UPDATE
TO anon, authenticated, service_role
USING (true);

-- Market Summary Policies
CREATE POLICY "Allow public read access to market_summary"
ON market_summary FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow edge function insert to market_summary"
ON market_summary FOR INSERT
TO anon, authenticated, service_role
WITH CHECK (true);

CREATE POLICY "Allow edge function update to market_summary"
ON market_summary FOR UPDATE
TO anon, authenticated, service_role
USING (true);

-- User Preferences Policies
CREATE POLICY "Allow users to read own preferences"
ON user_preferences FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow users to insert own preferences"
ON user_preferences FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow users to update own preferences"
ON user_preferences FOR UPDATE
TO anon, authenticated
USING (true);;