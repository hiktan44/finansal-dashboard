CREATE TABLE ai_insights (
    id BIGSERIAL PRIMARY KEY,
    insight_type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    severity VARCHAR(20),
    related_symbols TEXT,
    confidence DECIMAL(5,2),
    insight_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);