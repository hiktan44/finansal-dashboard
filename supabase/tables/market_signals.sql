CREATE TABLE market_signals (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    signal_type VARCHAR(50) NOT NULL,
    signal_value VARCHAR(20),
    strength DECIMAL(5,2),
    description TEXT,
    signal_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);