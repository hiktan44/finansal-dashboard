CREATE TABLE historical_data (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    price DECIMAL(15,2),
    volume BIGINT,
    change_percent DECIMAL(10,4),
    data_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);