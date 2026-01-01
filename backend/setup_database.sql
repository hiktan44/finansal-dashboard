
-- 1. Macro Data Table
CREATE TABLE IF NOT EXISTS macro_data (
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

-- Constraint for upsert
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_macro_data') THEN
        ALTER TABLE macro_data ADD CONSTRAINT unique_macro_data UNIQUE (country, indicator, date);
    END IF;
END $$;

-- 2. Assets Table
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    exchange TEXT,
    price NUMERIC DEFAULT 0,
    previous_close NUMERIC,
    change_percent NUMERIC,
    volume BIGINT,
    market_cap NUMERIC,
    currency TEXT DEFAULT 'TRY',
    last_updated TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Price History Table
CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL,
    symbol TEXT NOT NULL,
    price NUMERIC NOT NULL,
    volume BIGINT,
    timestamp TIMESTAMP NOT NULL,
    source TEXT
);

-- 4. User Alerts Table
CREATE TABLE IF NOT EXISTS user_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('price_target', 'percentage_change', 'volume_spike', 'technical_breakout', 'portfolio_value', 'loss_profit_threshold', 'market_movers', 'ai_prediction')),
    symbol TEXT,
    target_value DECIMAL(15,4),
    threshold_percent DECIMAL(5,2),
    condition TEXT CHECK (condition IN ('above', 'below', 'equals')),
    is_active BOOLEAN DEFAULT true,
    notification_channels JSONB DEFAULT '{"push": true, "email": false}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Recommended)
ALTER TABLE macro_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;

-- Public Access Policy (for development, restrict in production)
CREATE POLICY "Public Read Access" ON macro_data FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON assets FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON price_history FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON user_alerts FOR SELECT USING (true);

-- Backend Service Role Bypass (already enabled by key, but RLS applies to anon/authenticated mostly)
-- Service Role ignores RLS by default.
-- Economic Data History Table
CREATE TABLE IF NOT EXISTS economic_data (
    id BIGSERIAL PRIMARY KEY,
    indicator_code VARCHAR(50) NOT NULL,
    period_date DATE NOT NULL,
    value DECIMAL(18,4),
    value_text VARCHAR(255),
    metadata JSONB,
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(indicator_code, period_date)
);

-- RLS Policies for economic_data
ALTER TABLE economic_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON economic_data
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated upsert" ON economic_data
  FOR INSERT WITH CHECK (true);

-- 5. Daily Analysis (AI Generated)
CREATE TABLE IF NOT EXISTS daily_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_date TIMESTAMP NOT NULL,
    market_summary TEXT,
    technical_analysis TEXT,
    sector_highlights TEXT,
    market_forecast TEXT,
    sentiment_score TEXT,
    volatility_index TEXT,
    top_movers JSONB,
    raw_news_sources JSONB,
    audio_file_path TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Market Indices (BIST, etc.)
CREATE TABLE IF NOT EXISTS market_indices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL,
    name TEXT,
    close_price NUMERIC, -- fixed column name to match frontend
    change_value NUMERIC, -- added
    change_percent NUMERIC,
    is_new_high BOOLEAN, -- added
    monthly_change NUMERIC, -- added
    quarterly_change NUMERIC, -- added
    note TEXT, -- added
    data_date TIMESTAMP DEFAULT NOW(),
    source TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Commodities (Gold, Silver, Oil, Industrial Metals)
CREATE TABLE IF NOT EXISTS commodities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL,
    name TEXT,
    price NUMERIC,
    unit TEXT,
    change_percent NUMERIC,
    monthly_change NUMERIC, -- added
    note TEXT, -- added
    data_date TIMESTAMP DEFAULT NOW(),
    source TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 8. Tech Stocks (New Table for TechGiants)
CREATE TABLE IF NOT EXISTS tech_stocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL,
    name TEXT,
    close_price NUMERIC,
    change_percent NUMERIC,
    day_high NUMERIC,
    day_low NUMERIC,
    volume BIGINT,
    note TEXT,
    data_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Historical Data (For AI Analysis)
CREATE TABLE IF NOT EXISTS historical_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL,
    price NUMERIC NOT NULL,
    volume BIGINT,
    data_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(symbol, data_date)
);

-- 10. Market Summary (New Table)
CREATE TABLE IF NOT EXISTS market_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    summary_text TEXT,
    key_points TEXT[], -- Array of strings
    market_sentiment TEXT,
    data_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 11. Sector Indices (New Table)
CREATE TABLE IF NOT EXISTS sector_indices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL,       -- XBANK, XUSIN etc.
    name TEXT,                  -- Banka, Sanayi
    last_price NUMERIC,
    change_percent NUMERIC,
    change_value NUMERIC,
    data_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS market_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    summary_text TEXT,
    key_points TEXT[], -- Array of strings
    market_sentiment TEXT,
    data_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 10. Indicator Definitions (Catalog of all economic data points)
CREATE TABLE IF NOT EXISTS indicator_definitions (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    source TEXT,
    frequency TEXT, -- e.g. Monthly, Daily
    unit TEXT,
    description TEXT
);

-- Enable RLS for new tables
ALTER TABLE daily_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_indices ENABLE ROW LEVEL SECURITY;
ALTER TABLE commodities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicator_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Access" ON daily_analysis FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON market_indices FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON commodities FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON tech_stocks FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON market_summary FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON indicator_definitions FOR SELECT USING (true);

-- Initial Seed Data: 18 Requested Indicator Sets
INSERT INTO indicator_definitions (code, name, category, source, description) VALUES
('TR_CPI', 'TÜFE Manşet Enflasyon Oranı', 'Enflasyon', 'TÜİK', 'Tüketici Fiyat Endeksi'),
('TR_PPI', 'ÜFE – Üretici Fiyat Endeksi', 'Enflasyon', 'TÜİK', 'Üretici Fiyat Endeksi'),
('TR_EXP_CPI', 'TCMB Enflasyon Tahminleri', 'Enflasyon', 'BloombergHT', 'Yıl sonu ve 12 aylık beklentiler'),

('TR_BUDGET_BAL', 'Merkezi Yönetim Bütçe Dengesi', 'Bütçe', 'Muhasebat', 'Aylık bütçe dengesi'),
('TR_BUDGET_2025', '2025 Bütçe Denge Tablosu', 'Bütçe', 'Muhasebat', 'Bütçe hedefleri ve gerçekleşmeleri'),
('TR_BUDGET_GDP', 'Bütçe Açığının Milli Gelire Oranı', 'Bütçe', 'TÜİK', 'Bütçe/GSYH oranı'),

('TR_UNEMP_HIST', '2005–2013 İşsizlik', 'İşsizlik', 'TÜİK', 'Tarihsel işsizlik verisi'),
('TR_UNEMP_REC', '2014–2023 İşsizlik', 'İşsizlik', 'TÜİK', 'Yakın dönem işsizlik verisi'),
('TR_UNEMP_FCAST', '2024–2033 İşsizlik', 'İşsizlik', 'TÜİK', 'İşsizlik projeksiyonları'),

('TR_EXT_DEBT', 'Brüt Dış Borç Stoku', 'Dış Borç', 'TCMB', 'Türkiye brüt dış borç stoku'),

('TR_TRADE_SPEC', 'Dış Ticaret – Özel Ticaret Sistemi', 'Dış Ticaret', 'TÜİK', 'ÖTS İhracat/İthalat'),
('TR_TRADE_GEN', 'Genel Ticaret Sistemi', 'Dış Ticaret', 'TÜİK', 'GTS İhracat/İthalat'),
('TR_EXPORT_DIST', 'İhracat Dağılımı', 'Dış Ticaret', 'TÜİK', 'Sektörel ve Ülkesel dağılım'),
('TR_IMPORT_ITEMS', 'İthalat Kalemleri', 'Dış Ticaret', 'TÜİK', 'Mal gruplarına göre ithalat'),
('TR_CURR_ACC', 'Cari İşlemler Dengesi', 'Dış Ticaret', 'TCMB', 'Aylık cari açık/fazla'),

('TR_M3', 'M3 Para Arzı', 'Para Arzı', 'TCMB', 'Geniş tanımlı para arzı'),
('TR_DEPOSITS', 'Toplam Mevduatlar (TL/YP)', 'Bankacılık', 'TCMB', 'Bankacılık sistemi mevduat dağılımı'),

('TR_TOURISM_REV', 'Turizm Geliri', 'Turizm', 'KTB', 'Aylık/Yıllık turizm gelirleri'),
('TR_VISITORS', 'Gelen Yabancı Turist Sayısı', 'Turizm', 'KTB', 'Sınır giriş çıkış istatistikleri'),

('TR_REER', 'Reel Efektif Döviz Kuru (REK)', 'Döviz', 'TCMB', 'TÜFE bazlı reel kur endeksi'),
('TR_CDS', 'CDS – Kredi Risk Primi', 'Risk', 'Investing', '5 Yıllık CDS Primi'),
('TR_KKM', 'KKM Tutarları', 'Bankacılık', 'BDDK', 'Kur Korumalı Mevduat stoku'),

('TR_RES_GOLD', 'Altın ve Döviz Rezervleri', 'Rezervler', 'TCMB', 'Merkez Bankası brüt rezervleri'),
('TR_SWAP', 'Yurt İçi Swap Tutarı', 'Rezervler', 'TCMB', 'TCMB swap işlemleri'),

('TR_FOREIGN_INV', 'Yabancı Yatırım (DİBS/Hisse)', 'Yatırım', 'TCMB', 'Haftalık menkul kıymet istatistikleri'),

('TR_INT_DEP', 'Mevduat Faizi', 'Faiz', 'TCMB', 'TL mevduat ortalama faizi'),
('TR_INT_BENCH', 'Gösterge Faiz', 'Faiz', 'BloombergHT', '2 Yıllık Tahvil Faizi'),
('TR_TLREF', 'TLREF', 'Faiz', 'BIST', 'Türk Lirası Gecelik Referans Faiz Oranı'),

('TR_HPI', 'Konut Fiyat Endeksi', 'Konut', 'TCMB', 'Türkiye geneli KFE'),

('GL_LME', 'Londra Metal Endeksi', 'Emtia', 'Investing', 'LME Endeksi'),
('GL_COPPER', 'Bakır Fiyatları', 'Emtia', 'Investing', 'LME Bakır'),
('GL_ALUMINUM', 'Alüminyum Fiyatları', 'Emtia', 'Investing', 'LME Alüminyum'),
('GL_ZINC', 'Çinko Fiyatları', 'Emtia', 'Investing', 'LME Çinko')
ON CONFLICT (code) DO NOTHING;
