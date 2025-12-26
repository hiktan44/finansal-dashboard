CREATE TABLE data_fetch_logs (
    id SERIAL PRIMARY KEY,
    source VARCHAR(100) NOT NULL,
    indicator_code VARCHAR(50),
    status VARCHAR(50),
    records_fetched INTEGER DEFAULT 0,
    error_message TEXT,
    fetch_duration_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);