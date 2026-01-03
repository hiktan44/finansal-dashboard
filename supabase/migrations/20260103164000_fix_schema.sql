
-- 1. Create turkey_economics table
CREATE TABLE IF NOT EXISTS turkey_economics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    indicator_code TEXT NOT NULL UNIQUE,
    indicator_name TEXT NOT NULL,
    indicator_category TEXT NOT NULL,
    current_value NUMERIC,
    previous_value NUMERIC,
    change_percent NUMERIC,
    unit TEXT,
    source TEXT,
    period_date DATE,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE turkey_economics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access" ON turkey_economics FOR SELECT USING (true);


-- 2. Add Unique Constraints for Upserts in Market Data Tables
-- These constraints are required by the backend's upsert logic

-- market_indices
ALTER TABLE market_indices DROP CONSTRAINT IF EXISTS market_indices_symbol_data_date_key;
ALTER TABLE market_indices ADD CONSTRAINT market_indices_symbol_data_date_key UNIQUE (symbol, data_date);

-- commodities
ALTER TABLE commodities DROP CONSTRAINT IF EXISTS commodities_symbol_data_date_key;
ALTER TABLE commodities ADD CONSTRAINT commodities_symbol_data_date_key UNIQUE (symbol, data_date);

-- tech_stocks
ALTER TABLE tech_stocks DROP CONSTRAINT IF EXISTS tech_stocks_symbol_data_date_key;
ALTER TABLE tech_stocks ADD CONSTRAINT tech_stocks_symbol_data_date_key UNIQUE (symbol, data_date);

-- sector_indices
ALTER TABLE sector_indices DROP CONSTRAINT IF EXISTS sector_indices_symbol_data_date_key;
ALTER TABLE sector_indices ADD CONSTRAINT sector_indices_symbol_data_date_key UNIQUE (symbol, data_date);

-- market_summary
ALTER TABLE market_summary DROP CONSTRAINT IF EXISTS market_summary_data_date_key;
ALTER TABLE market_summary ADD CONSTRAINT market_summary_data_date_key UNIQUE (data_date);
