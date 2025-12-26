CREATE TABLE user_portfolios (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    portfolio_name VARCHAR(100) NOT NULL,
    description TEXT,
    total_investment DECIMAL(15,2) DEFAULT 0,
    current_value DECIMAL(15,2) DEFAULT 0,
    profit_loss DECIMAL(15,2) DEFAULT 0,
    profit_loss_percent DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);