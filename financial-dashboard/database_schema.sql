-- =============================================
-- Finansal Dashboard - Veritabanı Şeması
-- Self-hosted Supabase için
-- =============================================

-- Market Indices tablosu
CREATE TABLE IF NOT EXISTS market_indices (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    close_price DECIMAL(18, 4) NOT NULL,
    change_value DECIMAL(18, 4),
    change_percent DECIMAL(10, 4),
    is_new_high BOOLEAN DEFAULT FALSE,
    monthly_change DECIMAL(10, 4),
    quarterly_change DECIMAL(10, 4),
    note TEXT,
    data_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tech Stocks tablosu
CREATE TABLE IF NOT EXISTS tech_stocks (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    close_price DECIMAL(18, 4) NOT NULL,
    change_percent DECIMAL(10, 4),
    day_high DECIMAL(18, 4),
    day_low DECIMAL(18, 4),
    volume BIGINT,
    note TEXT,
    data_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Commodities tablosu
CREATE TABLE IF NOT EXISTS commodities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    price DECIMAL(18, 4) NOT NULL,
    change_percent DECIMAL(10, 4),
    monthly_change DECIMAL(10, 4),
    note TEXT,
    data_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market Summary tablosu
CREATE TABLE IF NOT EXISTS market_summary (
    id SERIAL PRIMARY KEY,
    summary_text TEXT NOT NULL,
    key_points JSONB,
    market_sentiment VARCHAR(50),
    data_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historical Data tablosu
CREATE TABLE IF NOT EXISTS historical_data (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(50) NOT NULL,
    open_price DECIMAL(18, 4),
    high_price DECIMAL(18, 4),
    low_price DECIMAL(18, 4),
    close_price DECIMAL(18, 4),
    volume BIGINT,
    data_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Predictions tablosu
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(50) NOT NULL,
    prediction_type VARCHAR(100),
    predicted_value DECIMAL(18, 4),
    confidence DECIMAL(5, 2),
    target_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Insights tablosu
CREATE TABLE IF NOT EXISTS ai_insights (
    id SERIAL PRIMARY KEY,
    insight_type VARCHAR(100),
    title VARCHAR(500),
    description TEXT,
    related_symbols TEXT,
    confidence DECIMAL(5, 2),
    insight_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market Signals tablosu
CREATE TABLE IF NOT EXISTS market_signals (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(50) NOT NULL,
    signal_type VARCHAR(100),
    signal_value VARCHAR(50),
    strength DECIMAL(5, 2),
    description TEXT,
    signal_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolios tablosu
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    initial_capital DECIMAL(18, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'TRY',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio Holdings tablosu
CREATE TABLE IF NOT EXISTS portfolio_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(50) NOT NULL,
    quantity DECIMAL(18, 8) NOT NULL,
    average_price DECIMAL(18, 4) NOT NULL,
    current_price DECIMAL(18, 4),
    purchase_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions tablosu
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(50) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    quantity DECIMAL(18, 8) NOT NULL,
    price DECIMAL(18, 4) NOT NULL,
    total_amount DECIMAL(18, 2),
    commission DECIMAL(18, 2) DEFAULT 0,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dividends tablosu
CREATE TABLE IF NOT EXISTS dividends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(50) NOT NULL,
    amount DECIMAL(18, 4) NOT NULL,
    payment_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Alerts tablosu
CREATE TABLE IF NOT EXISTS user_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    symbol VARCHAR(50),
    condition_type VARCHAR(50),
    target_value DECIMAL(18, 4),
    current_value DECIMAL(18, 4),
    is_active BOOLEAN DEFAULT TRUE,
    is_triggered BOOLEAN DEFAULT FALSE,
    triggered_at TIMESTAMP WITH TIME ZONE,
    notification_channels JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert Triggers tablosu
CREATE TABLE IF NOT EXISTS alert_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID REFERENCES user_alerts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    triggered_value DECIMAL(18, 4),
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notification_sent BOOLEAN DEFAULT FALSE
);

-- Alert Preferences tablosu
CREATE TABLE IF NOT EXISTS alert_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Logs tablosu
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    alert_id UUID,
    notification_type VARCHAR(50),
    title VARCHAR(500),
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error_message TEXT
);

-- Push Subscriptions tablosu
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    endpoint TEXT NOT NULL,
    keys JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TEFAS Funds tablosu
CREATE TABLE IF NOT EXISTS tefas_funds (
    id SERIAL PRIMARY KEY,
    fund_code VARCHAR(50) NOT NULL,
    fund_name VARCHAR(500) NOT NULL,
    fund_type VARCHAR(100),
    price DECIMAL(18, 6),
    current_price DECIMAL(18, 6),
    daily_change DECIMAL(18, 6),
    daily_change_percent DECIMAL(10, 4),
    performance_1m DECIMAL(10, 4),
    performance_3m DECIMAL(10, 4),
    performance_6m DECIMAL(10, 4),
    performance_1y DECIMAL(10, 4),
    weekly_change_percent DECIMAL(10, 4),
    monthly_change_percent DECIMAL(10, 4),
    yearly_change_percent DECIMAL(10, 4),
    total_value DECIMAL(18, 2),
    unit_count DECIMAL(18, 4),
    inception_date DATE,
    risk_rating VARCHAR(50),
    risk_score INTEGER,
    management_fee DECIMAL(10, 4),
    expense_ratio DECIMAL(10, 4),
    volume DECIMAL(18, 2),
    category VARCHAR(100),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Analysis tablosu
CREATE TABLE IF NOT EXISTS daily_analysis (
    id SERIAL PRIMARY KEY,
    analysis_date DATE NOT NULL,
    market_summary TEXT,
    technical_analysis TEXT,
    sector_highlights TEXT,
    top_movers JSONB,
    market_forecast TEXT,
    sentiment_score VARCHAR(50),
    volatility_index VARCHAR(50),
    audio_file_path TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turkey Economics tablosu
CREATE TABLE IF NOT EXISTS turkey_economics (
    id SERIAL PRIMARY KEY,
    indicator_code VARCHAR(100) NOT NULL,
    indicator_name VARCHAR(500),
    indicator_category VARCHAR(200),
    current_value DECIMAL(18, 4),
    previous_value DECIMAL(18, 4),
    change_percent DECIMAL(10, 4),
    period_date DATE,
    data_frequency VARCHAR(50),
    unit VARCHAR(100),
    source VARCHAR(200),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Portfolios tablosu (alternatif)
CREATE TABLE IF NOT EXISTS user_portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    initial_capital DECIMAL(18, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'TRY',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio Items tablosu
CREATE TABLE IF NOT EXISTS portfolio_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID,
    symbol VARCHAR(50) NOT NULL,
    quantity DECIMAL(18, 8) NOT NULL,
    average_price DECIMAL(18, 4) NOT NULL,
    current_price DECIMAL(18, 4),
    purchase_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- İndeksler
-- =============================================

CREATE INDEX IF NOT EXISTS idx_market_indices_date ON market_indices(data_date);
CREATE INDEX IF NOT EXISTS idx_market_indices_symbol ON market_indices(symbol);
CREATE INDEX IF NOT EXISTS idx_tech_stocks_date ON tech_stocks(data_date);
CREATE INDEX IF NOT EXISTS idx_tech_stocks_symbol ON tech_stocks(symbol);
CREATE INDEX IF NOT EXISTS idx_commodities_date ON commodities(data_date);
CREATE INDEX IF NOT EXISTS idx_historical_data_symbol_date ON historical_data(symbol, data_date);
CREATE INDEX IF NOT EXISTS idx_predictions_symbol ON predictions(symbol);
CREATE INDEX IF NOT EXISTS idx_ai_insights_date ON ai_insights(insight_date);
CREATE INDEX IF NOT EXISTS idx_market_signals_symbol_date ON market_signals(symbol, signal_date);
CREATE INDEX IF NOT EXISTS idx_portfolios_user ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_portfolio ON portfolio_holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_transactions_portfolio ON transactions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_user_alerts_user ON user_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_tefas_funds_code ON tefas_funds(fund_code);
CREATE INDEX IF NOT EXISTS idx_daily_analysis_date ON daily_analysis(analysis_date);
CREATE INDEX IF NOT EXISTS idx_turkey_economics_code ON turkey_economics(indicator_code);

-- =============================================
-- RLS (Row Level Security) Politikaları
-- =============================================

-- Tüm tablolar için RLS'yi etkinleştir (isteğe bağlı)
-- ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE alert_preferences ENABLE ROW LEVEL SECURITY;

-- Public okuma için politikalar
-- CREATE POLICY "Public read access" ON market_indices FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON tech_stocks FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON commodities FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON market_summary FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON tefas_funds FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON daily_analysis FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON turkey_economics FOR SELECT USING (true);

-- =============================================
-- Tamamlandı
-- =============================================
