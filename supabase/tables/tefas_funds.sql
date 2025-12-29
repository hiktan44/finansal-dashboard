CREATE TABLE tefas_funds (
    id SERIAL PRIMARY KEY,
    fund_code VARCHAR(10) UNIQUE NOT NULL,
    fund_name VARCHAR(255) NOT NULL,
    fund_type VARCHAR(20),
    price DECIMAL(10,4),
    performance_1m DECIMAL(5,2),
    performance_3m DECIMAL(5,2),
    performance_6m DECIMAL(5,2),
    performance_1y DECIMAL(5,2),
    risk_score DECIMAL(3,2),
    expense_ratio DECIMAL(4,3),
    volume BIGINT,
    category VARCHAR(50),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);