CREATE TABLE commodities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    price DECIMAL(12,2),
    change_percent DECIMAL(8,2),
    monthly_change DECIMAL(8,2),
    note TEXT,
    data_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);