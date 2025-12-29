CREATE TABLE turkey_economics (
    id SERIAL PRIMARY KEY,
    indicator_code VARCHAR(50) UNIQUE NOT NULL,
    indicator_name VARCHAR(255) NOT NULL,
    indicator_category VARCHAR(100) NOT NULL,
    current_value DECIMAL(15,2),
    previous_value DECIMAL(15,2),
    change_percent DECIMAL(5,2),
    period_date DATE,
    data_frequency VARCHAR(50),
    unit VARCHAR(50),
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);