CREATE TABLE risk_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id uuid,
    symbol text,
    metric_type text NOT NULL,
    value numeric NOT NULL,
    calculation_date date DEFAULT CURRENT_DATE,
    period text,
    metadata jsonb,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);