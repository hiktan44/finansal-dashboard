-- BU KODU SUPABASE SQL EDITOR'ÜNE YAPIŞTIRIP ÇALIŞTIRIN --

-- 1. Tabloyu Oluştur
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

-- 2. Güvenlik Politikalarını (RLS) Aç
ALTER TABLE economic_data ENABLE ROW LEVEL SECURITY;

-- 3. Okuma ve Yazma İzinlerini Ver
-- Herkes okuyabilsin (Public Read)
CREATE POLICY "Allow public read access" ON economic_data
  FOR SELECT USING (true);

-- Sadece yetkili servisler (Backend) yazabilsin
CREATE POLICY "Allow authenticated upsert" ON economic_data
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON economic_data
  FOR UPDATE USING (true);

-- İşlem tamamlandığında sağ alttaki "RUN" tuşuna basın.
