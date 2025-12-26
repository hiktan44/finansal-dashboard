CREATE TABLE diversification_analysis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id uuid NOT NULL,
    analysis_date date DEFAULT CURRENT_DATE,
    asset_type_distribution jsonb,
    sector_distribution jsonb,
    country_distribution jsonb,
    correlation_matrix jsonb,
    concentration_score numeric,
    diversification_score numeric,
    recommendations jsonb,
    created_at timestamp DEFAULT now()
);