-- Upgrade database to support 6 LLMs

-- Add column for OpenRouter Hermes
ALTER TABLE llm_error_analysis
ADD COLUMN IF NOT EXISTS openrouter_hermes_response TEXT,
ADD COLUMN IF NOT EXISTS openrouter_hermes_response_time INTEGER;

-- Rename openrouter columns for clarity
-- (We'll handle this in the app layer instead)

-- Update constraint for 6 LLMs
ALTER TABLE llm_error_analysis DROP CONSTRAINT IF EXISTS check_best_llm;

ALTER TABLE llm_error_analysis
ADD CONSTRAINT check_best_llm
CHECK (best_llm IS NULL OR best_llm IN (
  'groq',
  'mistral',
  'cohere',
  'openrouter-llama',
  'openrouter-mistral',
  'openrouter-hermes'
));

SELECT 'Database upgraded to support 6 LLMs!' as message;
