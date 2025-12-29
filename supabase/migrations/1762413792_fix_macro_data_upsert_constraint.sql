-- Migration: fix_macro_data_upsert_constraint
-- Created at: 1762413792

-- Drop existing unique constraint
ALTER TABLE macro_data DROP CONSTRAINT IF EXISTS unique_macro_data;

-- Add new unique constraint with on conflict do update
-- This allows UPSERT to work properly
ALTER TABLE macro_data 
ADD CONSTRAINT unique_macro_data_entry 
UNIQUE (country, indicator, date);;