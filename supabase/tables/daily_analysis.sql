CREATE TABLE daily_analysis (
    id SERIAL PRIMARY KEY,
    analysis_date DATE UNIQUE NOT NULL,
    market_summary TEXT,
    technical_analysis TEXT,
    sector_highlights TEXT,
    top_movers JSONB,
    market_forecast TEXT,
    sentiment_score DECIMAL(3,2),
    volatility_index DECIMAL(5,2),
    audio_file_path VARCHAR(255),
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);