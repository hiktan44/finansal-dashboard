CREATE TABLE market_summary (
    id SERIAL PRIMARY KEY,
    data_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    market_overview JSONB,
    daily_summary JSONB,
    key_highlights TEXT[]
);