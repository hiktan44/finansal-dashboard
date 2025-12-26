-- Migration: add_preferences_jsonb_column
-- Created at: 1762297074


-- user_preferences tablosuna JSONB preferences kolonu ekle
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- RLS Policy güncelle (public erişim)
DROP POLICY IF EXISTS "Public read access for user_preferences" ON user_preferences;
CREATE POLICY "Public read access for user_preferences" 
ON user_preferences FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Public insert access for user_preferences" ON user_preferences;
CREATE POLICY "Public insert access for user_preferences" 
ON user_preferences FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Public update access for user_preferences" ON user_preferences;
CREATE POLICY "Public update access for user_preferences" 
ON user_preferences FOR UPDATE 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Public delete access for user_preferences" ON user_preferences;
CREATE POLICY "Public delete access for user_preferences" 
ON user_preferences FOR DELETE 
USING (true);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
;