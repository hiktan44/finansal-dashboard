CREATE TABLE IF NOT EXISTS tefas_funds (
    fund_code TEXT PRIMARY KEY,
    fund_name TEXT NOT NULL,
    fund_type TEXT,
    current_price NUMERIC,
    daily_change NUMERIC,
    daily_change_percent NUMERIC,
    weekly_change_percent NUMERIC,
    monthly_change_percent NUMERIC,
    yearly_change_percent NUMERIC,
    category TEXT,
    risk_score NUMERIC,
    expense_ratio NUMERIC,
    volume NUMERIC,
    last_updated TIMESTAMP DEFAULT NOW()
);

ALTER TABLE tefas_funds ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Public Read Access" ON tefas_funds FOR SELECT USING (true);

-- Allow authenticated/service_role to insert/update
CREATE POLICY "Allow All for Service Role" ON tefas_funds FOR ALL USING (true);
