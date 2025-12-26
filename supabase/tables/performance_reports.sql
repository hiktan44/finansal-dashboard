CREATE TABLE performance_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id uuid NOT NULL,
    report_type text NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    total_return numeric,
    annualized_return numeric,
    volatility numeric,
    sharpe_ratio numeric,
    max_drawdown numeric,
    best_performing_asset jsonb,
    worst_performing_asset jsonb,
    asset_allocation jsonb,
    report_data jsonb,
    created_at timestamp DEFAULT now()
);