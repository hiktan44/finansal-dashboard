-- Migration: add_rls_policies_for_macro_data
-- Created at: 1762373929

-- Enable RLS on macro_data table
ALTER TABLE macro_data ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon and service_role
CREATE POLICY "Allow all for anon and service_role" ON macro_data
FOR ALL
USING (auth.role() IN ('anon', 'service_role'))
WITH CHECK (auth.role() IN ('anon', 'service_role'));;