CREATE TABLE sentiment_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL,
    sentiment_score NUMERIC NOT NULL,
    sentiment_category TEXT NOT NULL,
    sentiment_label TEXT NOT NULL,
    fear_greed_index INTEGER NOT NULL,
    rsi_value NUMERIC,
    volatility_percent NUMERIC,
    volume_ratio NUMERIC,
    price_change_percent NUMERIC,
    analysis_date TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);