CREATE TABLE dividends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL,
    holding_id UUID,
    symbol TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    currency TEXT DEFAULT 'USD',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);