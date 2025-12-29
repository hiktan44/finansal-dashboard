CREATE TABLE anomaly_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL,
    detection_date TIMESTAMPTZ DEFAULT NOW(),
    anomaly_score NUMERIC NOT NULL,
    anomaly_level TEXT NOT NULL,
    price_z_score NUMERIC,
    volume_z_score NUMERIC,
    volatility_ratio NUMERIC,
    anomalies_detected INTEGER,
    anomalies_json JSONB,
    recommendations TEXT[],
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);