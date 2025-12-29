CREATE TABLE tech_stocks (
    id SERIAL PRIMARY KEY,
    data_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    symbol VARCHAR(20) NOT NULL,
    company_name VARCHAR(255),
    current_price DECIMAL(10,2),
    previous_price DECIMAL(10,2),
    change_amount DECIMAL(10,2),
    change_percent DECIMAL(5,2),
    volume BIGINT,
    market_cap BIGINT,
    additional_data JSONB
);