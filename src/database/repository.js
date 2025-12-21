import pool from './db.js';

/**
 * Insert a new error analysis record
 */
export async function insertAnalysis(data) {
  const {
    developerName,
    errorCategory,
    errorCode,
    errorMessage,
    promptSent,
    geminiResponse,
    groqResponse,
    mistralResponse,
    bestLlm,
    notes
  } = data;

  const query = `
    INSERT INTO llm_error_analysis (
      developer_name,
      error_category,
      error_code,
      error_message,
      prompt_sent,
      gemini_response,
      groq_response,
      mistral_response,
      best_llm,
      notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;

  const values = [
    developerName,
    errorCategory,
    errorCode,
    errorMessage,
    promptSent,
    geminiResponse,
    groqResponse,
    mistralResponse,
    bestLlm,
    notes
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Insert error:', error.message);
    throw error;
  }
}

/**
 * Get all analysis records
 */
export async function getAllAnalyses() {
  const query = 'SELECT * FROM llm_error_analysis ORDER BY created_at DESC;';

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('❌ Get all error:', error.message);
    throw error;
  }
}

/**
 * Get analysis by ID
 */
export async function getAnalysisById(id) {
  const query = 'SELECT * FROM llm_error_analysis WHERE id = $1;';

  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Get by ID error:', error.message);
    throw error;
  }
}

/**
 * Get analyses by category
 */
export async function getAnalysesByCategory(category) {
  const query = 'SELECT * FROM llm_error_analysis WHERE error_category = $1 ORDER BY created_at DESC;';

  try {
    const result = await pool.query(query, [category]);
    return result.rows;
  } catch (error) {
    console.error('❌ Get by category error:', error.message);
    throw error;
  }
}

/**
 * Update best LLM for an analysis
 */
export async function updateBestLlm(id, bestLlm) {
  const query = 'UPDATE llm_error_analysis SET best_llm = $1 WHERE id = $2 RETURNING *;';

  try {
    const result = await pool.query(query, [bestLlm, id]);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Update error:', error.message);
    throw error;
  }
}

/**
 * Update notes for an analysis
 */
export async function updateNotes(id, notes) {
  const query = 'UPDATE llm_error_analysis SET notes = $1 WHERE id = $2 RETURNING *;';

  try {
    const result = await pool.query(query, [notes, id]);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Update notes error:', error.message);
    throw error;
  }
}

/**
 * Get statistics by best LLM
 */
export async function getStatsByBestLlm() {
  const query = `
    SELECT
      best_llm,
      COUNT(*) as count
    FROM llm_error_analysis
    WHERE best_llm IS NOT NULL
    GROUP BY best_llm
    ORDER BY count DESC;
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('❌ Get stats error:', error.message);
    throw error;
  }
}

/**
 * Get statistics by category
 */
export async function getStatsByCategory() {
  const query = `
    SELECT
      error_category,
      COUNT(*) as count
    FROM llm_error_analysis
    GROUP BY error_category
    ORDER BY count DESC;
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('❌ Get category stats error:', error.message);
    throw error;
  }
}

/**
 * Delete an analysis record
 */
export async function deleteAnalysis(id) {
  const query = 'DELETE FROM llm_error_analysis WHERE id = $1 RETURNING *;';

  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Delete error:', error.message);
    throw error;
  }
}
