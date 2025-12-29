CREATE TABLE market_indices (
    id SERIAL PRIMARY KEY,
    data_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    index_name VARCHAR(255) NOT NULL,
    current_value DECIMAL(15,2),
    previous_value DECIMAL(15,2),
    change_amount DECIMAL(15,2),
    change_percent DECIMAL(5,2),
    volume BIGINT,
    additional_data JSONB
);