CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    alert_id UUID,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('push',
    'email',
    'sms')),
    message TEXT NOT NULL,
    status TEXT CHECK (status IN ('sent',
    'failed',
    'pending')),
    error_message TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);