CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    exchange TEXT,
    price NUMERIC DEFAULT 0,
    previous_close NUMERIC,
    change_percent NUMERIC,
    volume BIGINT,
    market_cap NUMERIC,
    currency TEXT DEFAULT 'TRY',
    last_updated TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);