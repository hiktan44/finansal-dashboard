CREATE TABLE alert_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL,
    user_id UUID NOT NULL,
    trigger_value DECIMAL(15,4),
    trigger_time TIMESTAMPTZ DEFAULT NOW(),
    message TEXT NOT NULL,
    notification_sent BOOLEAN DEFAULT false,
    notification_channels TEXT[] DEFAULT ARRAY['push'],
    created_at TIMESTAMPTZ DEFAULT NOW()
);