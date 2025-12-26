CREATE TABLE analysis_sections (
    id SERIAL PRIMARY KEY,
    section_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    slide_range_start INTEGER,
    slide_range_end INTEGER,
    category VARCHAR(100),
    update_frequency VARCHAR(50),
    last_updated TIMESTAMP,
    subsection_count INTEGER DEFAULT 0,
    data_points JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);