CREATE TABLE macro_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country TEXT NOT NULL,
    indicator TEXT NOT NULL,
    value NUMERIC NOT NULL,
    previous_value NUMERIC,
    change_percent NUMERIC,
    unit TEXT,
    date DATE NOT NULL,
    source TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);