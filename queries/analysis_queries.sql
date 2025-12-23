-- ============================================
-- LLM Error Analysis - SQL Queries
-- ============================================

-- 1. BASIC VIEW: best_llm ve description (error_message) görüntüleme
-- ============================================
SELECT
    id,
    developer_name,
    created_at,
    error_category,
    error_code,
    error_message AS description,
    best_llm,
    notes
FROM llm_error_analysis
ORDER BY created_at DESC;


-- 2. BEST AND WORST LLM ANALYSIS (Response Times ile)
-- ============================================
-- Her kayıt için en iyi ve en kötü LLM'i response time'a göre bulma
SELECT
    id,
    error_category,
    error_code,
    error_message AS description,
    best_llm,
    -- En düşük response time'a sahip LLM (en hızlı)
    CASE
        WHEN groq_response_time <= COALESCE(mistral_response_time, 999999)
         AND groq_response_time <= COALESCE(cohere_response_time, 999999)
         AND groq_response_time <= COALESCE(openrouter_response_time, 999999)
         AND groq_response_time <= COALESCE(openrouter_hermes_response_time, 999999)
        THEN 'groq (' || groq_response_time || 'ms)'
        WHEN mistral_response_time <= COALESCE(cohere_response_time, 999999)
         AND mistral_response_time <= COALESCE(openrouter_response_time, 999999)
         AND mistral_response_time <= COALESCE(openrouter_hermes_response_time, 999999)
        THEN 'mistral (' || mistral_response_time || 'ms)'
        WHEN cohere_response_time <= COALESCE(openrouter_response_time, 999999)
         AND cohere_response_time <= COALESCE(openrouter_hermes_response_time, 999999)
        THEN 'cohere (' || cohere_response_time || 'ms)'
        WHEN openrouter_response_time <= COALESCE(openrouter_hermes_response_time, 999999)
        THEN 'openrouter (' || openrouter_response_time || 'ms)'
        ELSE 'openrouter_hermes (' || openrouter_hermes_response_time || 'ms)'
    END AS fastest_llm,
    -- En yüksek response time'a sahip LLM (en yavaş)
    CASE
        WHEN groq_response_time >= COALESCE(mistral_response_time, 0)
         AND groq_response_time >= COALESCE(cohere_response_time, 0)
         AND groq_response_time >= COALESCE(openrouter_response_time, 0)
         AND groq_response_time >= COALESCE(openrouter_hermes_response_time, 0)
        THEN 'groq (' || groq_response_time || 'ms)'
        WHEN mistral_response_time >= COALESCE(cohere_response_time, 0)
         AND mistral_response_time >= COALESCE(openrouter_response_time, 0)
         AND mistral_response_time >= COALESCE(openrouter_hermes_response_time, 0)
        THEN 'mistral (' || mistral_response_time || 'ms)'
        WHEN cohere_response_time >= COALESCE(openrouter_response_time, 0)
         AND cohere_response_time >= COALESCE(openrouter_hermes_response_time, 0)
        THEN 'cohere (' || cohere_response_time || 'ms)'
        WHEN openrouter_response_time >= COALESCE(openrouter_hermes_response_time, 0)
        THEN 'openrouter (' || openrouter_response_time || 'ms)'
        ELSE 'openrouter_hermes (' || openrouter_hermes_response_time || 'ms)'
    END AS slowest_llm
FROM llm_error_analysis
ORDER BY created_at DESC;


-- 3. LLM PERFORMANCE SUMMARY
-- ============================================
-- Her LLM için ortalama response time ve best_llm olarak seçilme sayısı
SELECT
    'groq' AS llm_name,
    COUNT(*) FILTER (WHERE best_llm = 'groq') AS times_selected_as_best,
    ROUND(AVG(groq_response_time)::numeric, 2) AS avg_response_time_ms,
    MIN(groq_response_time) AS min_response_time_ms,
    MAX(groq_response_time) AS max_response_time_ms
FROM llm_error_analysis
WHERE groq_response_time IS NOT NULL

UNION ALL

SELECT
    'mistral' AS llm_name,
    COUNT(*) FILTER (WHERE best_llm = 'mistral') AS times_selected_as_best,
    ROUND(AVG(mistral_response_time)::numeric, 2) AS avg_response_time_ms,
    MIN(mistral_response_time) AS min_response_time_ms,
    MAX(mistral_response_time) AS max_response_time_ms
FROM llm_error_analysis
WHERE mistral_response_time IS NOT NULL

UNION ALL

SELECT
    'cohere' AS llm_name,
    COUNT(*) FILTER (WHERE best_llm = 'cohere') AS times_selected_as_best,
    ROUND(AVG(cohere_response_time)::numeric, 2) AS avg_response_time_ms,
    MIN(cohere_response_time) AS min_response_time_ms,
    MAX(cohere_response_time) AS max_response_time_ms
FROM llm_error_analysis
WHERE cohere_response_time IS NOT NULL

UNION ALL

SELECT
    'openrouter' AS llm_name,
    COUNT(*) FILTER (WHERE best_llm = 'openrouter') AS times_selected_as_best,
    ROUND(AVG(openrouter_response_time)::numeric, 2) AS avg_response_time_ms,
    MIN(openrouter_response_time) AS min_response_time_ms,
    MAX(openrouter_response_time) AS max_response_time_ms
FROM llm_error_analysis
WHERE openrouter_response_time IS NOT NULL

UNION ALL

SELECT
    'openrouter_hermes' AS llm_name,
    COUNT(*) FILTER (WHERE best_llm = 'openrouter_hermes') AS times_selected_as_best,
    ROUND(AVG(openrouter_hermes_response_time)::numeric, 2) AS avg_response_time_ms,
    MIN(openrouter_hermes_response_time) AS min_response_time_ms,
    MAX(openrouter_hermes_response_time) AS max_response_time_ms
FROM llm_error_analysis
WHERE openrouter_hermes_response_time IS NOT NULL

ORDER BY times_selected_as_best DESC, avg_response_time_ms ASC;


-- 4. CATEGORY-BASED BEST LLM ANALYSIS
-- ============================================
-- Her hata kategorisi için hangi LLM en çok best_llm olarak seçilmiş
SELECT
    error_category,
    best_llm,
    COUNT(*) AS selection_count,
    ROUND(AVG(
        CASE best_llm
            WHEN 'groq' THEN groq_response_time
            WHEN 'mistral' THEN mistral_response_time
            WHEN 'cohere' THEN cohere_response_time
            WHEN 'openrouter' THEN openrouter_response_time
            WHEN 'openrouter_hermes' THEN openrouter_hermes_response_time
        END
    )::numeric, 2) AS avg_response_time_when_best
FROM llm_error_analysis
WHERE best_llm IS NOT NULL
GROUP BY error_category, best_llm
ORDER BY error_category, selection_count DESC;


-- 5. DETAILED COMPARISON VIEW
-- ============================================
-- Tüm LLM'lerin response time'larını yan yana gösterme
SELECT
    id,
    developer_name,
    error_category,
    error_code,
    LEFT(error_message, 50) AS description_preview,
    best_llm,
    groq_response_time AS groq_ms,
    mistral_response_time AS mistral_ms,
    cohere_response_time AS cohere_ms,
    openrouter_response_time AS openrouter_ms,
    openrouter_hermes_response_time AS openrouter_hermes_ms,
    -- En hızlı ve en yavaş arasındaki fark
    GREATEST(
        COALESCE(groq_response_time, 0),
        COALESCE(mistral_response_time, 0),
        COALESCE(cohere_response_time, 0),
        COALESCE(openrouter_response_time, 0),
        COALESCE(openrouter_hermes_response_time, 0)
    ) - LEAST(
        COALESCE(groq_response_time, 999999),
        COALESCE(mistral_response_time, 999999),
        COALESCE(cohere_response_time, 999999),
        COALESCE(openrouter_response_time, 999999),
        COALESCE(openrouter_hermes_response_time, 999999)
    ) AS time_difference_ms
FROM llm_error_analysis
ORDER BY created_at DESC;


-- 6. DEVELOPER PERFORMANCE VIEW
-- ============================================
-- Geliştirici bazında hangi LLM'ler daha çok kullanılmış
SELECT
    developer_name,
    COUNT(*) AS total_queries,
    COUNT(*) FILTER (WHERE best_llm = 'groq') AS groq_best_count,
    COUNT(*) FILTER (WHERE best_llm = 'mistral') AS mistral_best_count,
    COUNT(*) FILTER (WHERE best_llm = 'cohere') AS cohere_best_count,
    COUNT(*) FILTER (WHERE best_llm = 'openrouter') AS openrouter_best_count,
    COUNT(*) FILTER (WHERE best_llm = 'openrouter_hermes') AS openrouter_hermes_best_count,
    MODE() WITHIN GROUP (ORDER BY best_llm) AS most_common_best_llm
FROM llm_error_analysis
GROUP BY developer_name
ORDER BY total_queries DESC;


-- 7. WORST LLM BY RESPONSE LENGTH (Cevap uzunluğu bazlı)
-- ============================================
-- En uzun ve en kısa cevap veren LLM'ler
SELECT
    id,
    error_code,
    CASE
        WHEN LENGTH(groq_response) >= COALESCE(LENGTH(mistral_response), 0)
         AND LENGTH(groq_response) >= COALESCE(LENGTH(cohere_response), 0)
         AND LENGTH(groq_response) >= COALESCE(LENGTH(openrouter_response), 0)
         AND LENGTH(groq_response) >= COALESCE(LENGTH(openrouter_hermes_response), 0)
        THEN 'groq (' || LENGTH(groq_response) || ' chars)'
        WHEN LENGTH(mistral_response) >= COALESCE(LENGTH(cohere_response), 0)
         AND LENGTH(mistral_response) >= COALESCE(LENGTH(openrouter_response), 0)
         AND LENGTH(mistral_response) >= COALESCE(LENGTH(openrouter_hermes_response), 0)
        THEN 'mistral (' || LENGTH(mistral_response) || ' chars)'
        WHEN LENGTH(cohere_response) >= COALESCE(LENGTH(openrouter_response), 0)
         AND LENGTH(cohere_response) >= COALESCE(LENGTH(openrouter_hermes_response), 0)
        THEN 'cohere (' || LENGTH(cohere_response) || ' chars)'
        WHEN LENGTH(openrouter_response) >= COALESCE(LENGTH(openrouter_hermes_response), 0)
        THEN 'openrouter (' || LENGTH(openrouter_response) || ' chars)'
        ELSE 'openrouter_hermes (' || LENGTH(openrouter_hermes_response) || ' chars)'
    END AS longest_response,
    CASE
        WHEN LENGTH(groq_response) <= COALESCE(LENGTH(mistral_response), 999999)
         AND LENGTH(groq_response) <= COALESCE(LENGTH(cohere_response), 999999)
         AND LENGTH(groq_response) <= COALESCE(LENGTH(openrouter_response), 999999)
         AND LENGTH(groq_response) <= COALESCE(LENGTH(openrouter_hermes_response), 999999)
        THEN 'groq (' || LENGTH(groq_response) || ' chars)'
        WHEN LENGTH(mistral_response) <= COALESCE(LENGTH(cohere_response), 999999)
         AND LENGTH(mistral_response) <= COALESCE(LENGTH(openrouter_response), 999999)
         AND LENGTH(mistral_response) <= COALESCE(LENGTH(openrouter_hermes_response), 999999)
        THEN 'mistral (' || LENGTH(mistral_response) || ' chars)'
        WHEN LENGTH(cohere_response) <= COALESCE(LENGTH(openrouter_response), 999999)
         AND LENGTH(cohere_response) <= COALESCE(LENGTH(openrouter_hermes_response), 999999)
        THEN 'cohere (' || LENGTH(cohere_response) || ' chars)'
        WHEN LENGTH(openrouter_response) <= COALESCE(LENGTH(openrouter_hermes_response), 999999)
        THEN 'openrouter (' || LENGTH(openrouter_response) || ' chars)'
        ELSE 'openrouter_hermes (' || LENGTH(openrouter_hermes_response) || ' chars)'
    END AS shortest_response
FROM llm_error_analysis
ORDER BY id DESC;


-- 8. SIMPLE VIEW FOR PGADMIN
-- ============================================
-- En basit görünüm: ID, Kategori, Description, Best LLM, Worst LLM (en yavaş)
SELECT
    id,
    error_category,
    error_message AS description,
    best_llm,
    -- Worst LLM (en yavaş response time)
    CASE
        WHEN GREATEST(
            COALESCE(groq_response_time, 0),
            COALESCE(mistral_response_time, 0),
            COALESCE(cohere_response_time, 0),
            COALESCE(openrouter_response_time, 0),
            COALESCE(openrouter_hermes_response_time, 0)
        ) = groq_response_time THEN 'groq'
        WHEN GREATEST(
            COALESCE(groq_response_time, 0),
            COALESCE(mistral_response_time, 0),
            COALESCE(cohere_response_time, 0),
            COALESCE(openrouter_response_time, 0),
            COALESCE(openrouter_hermes_response_time, 0)
        ) = mistral_response_time THEN 'mistral'
        WHEN GREATEST(
            COALESCE(groq_response_time, 0),
            COALESCE(mistral_response_time, 0),
            COALESCE(cohere_response_time, 0),
            COALESCE(openrouter_response_time, 0),
            COALESCE(openrouter_hermes_response_time, 0)
        ) = cohere_response_time THEN 'cohere'
        WHEN GREATEST(
            COALESCE(groq_response_time, 0),
            COALESCE(mistral_response_time, 0),
            COALESCE(cohere_response_time, 0),
            COALESCE(openrouter_response_time, 0),
            COALESCE(openrouter_hermes_response_time, 0)
        ) = openrouter_response_time THEN 'openrouter'
        ELSE 'openrouter_hermes'
    END AS worst_llm
FROM llm_error_analysis
ORDER BY id;
