CREATE TABLE portfolio_items (
    id SERIAL PRIMARY KEY,
    portfolio_id INTEGER NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    asset_name VARCHAR(100),
    asset_type VARCHAR(20),
    quantity DECIMAL(15,4) NOT NULL,
    avg_purchase_price DECIMAL(10,4) NOT NULL,
    current_price DECIMAL(10,4),
    total_investment DECIMAL(15,2),
    current_value DECIMAL(15,2),
    profit_loss DECIMAL(15,2),
    profit_loss_percent DECIMAL(5,2),
    purchase_date DATE,
    commission DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);