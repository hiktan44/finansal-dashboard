CREATE TABLE risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL,
    portfolio_id UUID,
    assessment_date TIMESTAMPTZ DEFAULT NOW(),
    risk_score NUMERIC NOT NULL,
    risk_category TEXT NOT NULL,
    risk_label TEXT NOT NULL,
    volatility_percent NUMERIC,
    sharpe_ratio NUMERIC,
    max_drawdown_percent NUMERIC,
    value_at_risk NUMERIC,
    beta NUMERIC,
    confidence_level INTEGER,
    recommendations TEXT[],
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);