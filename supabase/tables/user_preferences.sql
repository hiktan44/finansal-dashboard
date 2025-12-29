CREATE TABLE user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID,
    refresh_interval INTEGER DEFAULT 300,
    favorite_symbols TEXT[],
    dark_mode BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);