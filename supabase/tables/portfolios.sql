CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    name TEXT NOT NULL,
    description TEXT,
    total_value NUMERIC DEFAULT 0,
    total_cost NUMERIC DEFAULT 0,
    total_gain_loss NUMERIC DEFAULT 0,
    total_gain_loss_percent NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'TRY',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);