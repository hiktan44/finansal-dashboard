CREATE TABLE portfolio_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL,
    asset_id UUID NOT NULL,
    symbol TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    purchase_price NUMERIC NOT NULL,
    purchase_date TIMESTAMP DEFAULT NOW(),
    current_price NUMERIC DEFAULT 0,
    current_value NUMERIC DEFAULT 0,
    gain_loss NUMERIC DEFAULT 0,
    gain_loss_percent NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);