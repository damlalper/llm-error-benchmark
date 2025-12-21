-- LLM Error Analysis Platform Database Schema

-- Drop table if exists
DROP TABLE IF EXISTS llm_error_analysis;

-- Create main table
CREATE TABLE llm_error_analysis (
    id SERIAL PRIMARY KEY,
    developer_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    error_category TEXT NOT NULL,
    error_code TEXT NOT NULL,
    error_message TEXT NOT NULL,
    prompt_sent TEXT NOT NULL,
    gemini_response TEXT,
    groq_response TEXT,
    mistral_response TEXT,
    best_llm TEXT,
    notes TEXT
);

-- Create indexes for better query performance
CREATE INDEX idx_error_category ON llm_error_analysis(error_category);
CREATE INDEX idx_created_at ON llm_error_analysis(created_at);
CREATE INDEX idx_best_llm ON llm_error_analysis(best_llm);

-- Add check constraint for error_category
ALTER TABLE llm_error_analysis
ADD CONSTRAINT check_error_category
CHECK (error_category IN (
    'API_ERR',
    'AUTO_ERR',
    'BROWSER_ERR',
    'CODE_ERR',
    'CONFIG_ERR',
    'DATA_ERR',
    'DB_ERR',
    'ENV_ERR',
    'NET_ERR',
    'PERF_ERR',
    'SEC_ERR',
    'VERSION_ERR'
));

-- Add check constraint for best_llm
ALTER TABLE llm_error_analysis
ADD CONSTRAINT check_best_llm
CHECK (best_llm IS NULL OR best_llm IN ('gemini', 'groq', 'mistral'));
