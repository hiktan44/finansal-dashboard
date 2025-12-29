CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL,
    symbol TEXT NOT NULL,
    price NUMERIC NOT NULL,
    volume BIGINT,
    timestamp TIMESTAMP NOT NULL,
    source TEXT
);