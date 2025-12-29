-- Migration: add_data_date_to_commodities
-- Created at: 1764368622

ALTER TABLE commodities ADD COLUMN data_date DATE DEFAULT CURRENT_DATE;;