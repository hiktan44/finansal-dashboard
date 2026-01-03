-- Add new columns for expanded analysis features
ALTER TABLE daily_analysis 
ADD COLUMN IF NOT EXISTS next_week_outcome TEXT, -- Gelecek hafta beklentisi
ADD COLUMN IF NOT EXISTS long_term_outcome JSONB, -- 3 ay, 6 ay, 1 yıl beklentileri
ADD COLUMN IF NOT EXISTS economic_calendar JSONB; -- Önemli veri takvimi
