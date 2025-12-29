CREATE TABLE predictions (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    prediction_type VARCHAR(50) NOT NULL,
    predicted_price DECIMAL(15,2),
    confidence_level DECIMAL(5,2),
    prediction_date DATE NOT NULL,
    target_date DATE NOT NULL,
    algorithm VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);