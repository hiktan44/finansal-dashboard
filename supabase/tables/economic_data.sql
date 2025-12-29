CREATE TABLE economic_data (
    id SERIAL PRIMARY KEY,
    indicator_code VARCHAR(50) NOT NULL,
    period_date DATE NOT NULL,
    value DECIMAL(20,4),
    value_text TEXT,
    metadata JSONB,
    source_url TEXT,
    fetched_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);