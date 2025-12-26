CREATE TABLE market_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL,
    prediction_date TIMESTAMPTZ DEFAULT NOW(),
    current_price NUMERIC NOT NULL,
    prediction_days INTEGER NOT NULL,
    predicted_price NUMERIC NOT NULL,
    trend_direction TEXT NOT NULL,
    trend_strength NUMERIC,
    confidence_score NUMERIC,
    method TEXT,
    ma10 NUMERIC,
    ma20 NUMERIC,
    ma50 NUMERIC,
    volatility_percent NUMERIC,
    predictions_json JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);