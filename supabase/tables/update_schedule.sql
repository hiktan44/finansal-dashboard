CREATE TABLE update_schedule (
    id SERIAL PRIMARY KEY,
    indicator_code VARCHAR(50) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    last_run TIMESTAMP,
    next_run TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);