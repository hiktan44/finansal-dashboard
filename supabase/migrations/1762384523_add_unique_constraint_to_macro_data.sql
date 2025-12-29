-- Migration: add_unique_constraint_to_macro_data
-- Created at: 1762384523

ALTER TABLE macro_data 
ADD CONSTRAINT unique_macro_data 
UNIQUE (country, indicator, date);;