-- 850 TEFAS Fonu Ekleme
INSERT INTO funds (symbol, name, fund_type, manager, nav, change_percent, performance_1y, risk_score, currency, is_active)
SELECT 
  'FN' || LPAD(generate_series::text, 4, '0') as symbol,
  (ARRAY['Ak Portföy', 'Garanti Portföy', 'İş Portföy', 'Yapı Kredi Portföy', 'TEB Portföy', 'QNB Portföy'])[1 + floor(random() * 6)::int] || ' Fon ' || generate_series as name,
  (ARRAY['equity', 'bond', 'mixed', 'money_market', 'precious_metal'])[1 + floor(random() * 5)::int]::text as fund_type,
  (ARRAY['Ak Portföy', 'Garanti Portföy', 'İş Portföy', 'Yapı Kredi Portföy', 'TEB Portföy', 'QNB Portföy'])[1 + floor(random() * 6)::int] as manager,
  (random() * 4.99 + 0.01)::numeric(10, 6) as nav,
  (random() * 15 - 5)::numeric(10, 2) as change_percent,
  (random() * 80 - 25)::numeric(10, 2) as performance_1y,
  (1 + floor(random() * 10))::int as risk_score,
  'TRY' as currency,
  true as is_active
FROM generate_series(1, 850);
