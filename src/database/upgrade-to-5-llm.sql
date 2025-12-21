-- Upgrade database to support 5 LLMs (Cohere and OpenRouter)

-- Add new columns for Cohere and OpenRouter
ALTER TABLE llm_error_analysis
ADD COLUMN IF NOT EXISTS cohere_response TEXT,
ADD COLUMN IF NOT EXISTS openrouter_response TEXT;

-- Add response time tracking columns
ALTER TABLE llm_error_analysis
ADD COLUMN IF NOT EXISTS gemini_response_time INTEGER,
ADD COLUMN IF NOT EXISTS groq_response_time INTEGER,
ADD COLUMN IF NOT EXISTS mistral_response_time INTEGER,
ADD COLUMN IF NOT EXISTS cohere_response_time INTEGER,
ADD COLUMN IF NOT EXISTS openrouter_response_time INTEGER;

-- Drop old constraint
ALTER TABLE llm_error_analysis DROP CONSTRAINT IF EXISTS check_best_llm;

-- Add new constraint for 5 LLMs
ALTER TABLE llm_error_analysis
ADD CONSTRAINT check_best_llm
CHECK (best_llm IS NULL OR best_llm IN ('gemini', 'groq', 'mistral', 'cohere', 'openrouter'));

-- Success message
SELECT 'Database upgraded to support 5 LLMs!' as message;
