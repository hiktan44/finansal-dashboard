CREATE TABLE economic_indicators (
    id SERIAL PRIMARY KEY,
    indicator_code VARCHAR(50) NOT NULL,
    indicator_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    value_type VARCHAR(50),
    unit VARCHAR(50),
    frequency VARCHAR(50),
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);