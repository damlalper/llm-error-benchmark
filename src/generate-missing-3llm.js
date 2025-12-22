import { getErrorByCode, generatePrompt, ERROR_CATEGORIES } from './data/errorCategories.js';
import { analyzeWithGroq } from './services/groq.js';
import { analyzeWithMistral } from './services/mistral.js';
import { analyzeWithCohere } from './services/cohere.js';
import pool from './database/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function analyzeSpecificError(category, errorCode, developerName = 'Damla') {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log(`║  🎯 Specific Error: ${category} - ${errorCode.padEnd(30)}║`);
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const error = getErrorByCode(category, errorCode);
  console.log(`📝 ${error.name}`);
  console.log(`💬 ${error.message}\n`);

  const prompt = generatePrompt(error);
  console.log('📤 Sending to 3 LLMs (Groq, Mistral, Cohere)...\n');

  const startTime = Date.now();

  const [groqResult, mistralResult, cohereResult] =
    await Promise.allSettled([
      analyzeWithGroq(prompt).then(res => ({ response: res, time: Date.now() - startTime })),
      analyzeWithMistral(prompt).then(res => ({ response: res, time: Date.now() - startTime })),
      analyzeWithCohere(prompt).then(res => ({ response: res, time: Date.now() - startTime }))
    ]);

  console.log('✅ All responses received!\n');

  // Extract results
  const groq = groqResult.status === 'fulfilled' ? groqResult.value : { response: `Error: ${groqResult.reason}`, time: null };
  const mistral = mistralResult.status === 'fulfilled' ? mistralResult.value : { response: `Error: ${mistralResult.reason}`, time: null };
  const cohere = cohereResult.status === 'fulfilled' ? cohereResult.value : { response: `Error: ${cohereResult.reason}`, time: null };

  // Display response times
  console.log('⏱️  Response Times:');
  console.log(`   Groq:    ${groq.time ? groq.time + 'ms' : 'Failed'} ${groq.time && groq.time < 5000 ? '🚀' : ''}`);
  console.log(`   Mistral: ${mistral.time ? mistral.time + 'ms' : 'Failed'}`);
  console.log(`   Cohere:  ${cohere.time ? cohere.time + 'ms' : 'Failed'}\n`);

  // Save to database (only 3 LLMs)
  try {
    const result = await pool.query(
      `INSERT INTO llm_error_analysis
      (developer_name, error_category, error_code, error_message, prompt_sent,
       groq_response, mistral_response, cohere_response,
       groq_response_time, mistral_response_time, cohere_response_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id`,
      [
        developerName,
        error.category,
        error.code,
        error.message,
        prompt,
        groq.response,
        mistral.response,
        cohere.response,
        groq.time,
        mistral.time,
        cohere.time
      ]
    );

    console.log(`💾 Saved with ID: ${result.rows[0].id}\n`);
    return result.rows[0].id;
  } catch (error) {
    console.error('❌ Database error:', error.message);
    throw error;
  }
}

// Generate all missing errors
async function generateAllMissing() {
  // Get missing errors from database
  const result = await pool.query(`
    SELECT DISTINCT error_code
    FROM llm_error_analysis
  `);

  const createdErrorCodes = new Set(result.rows.map(r => r.error_code));

  const missingErrors = [];

  // Priority order: least covered categories first
  const priorityOrder = ['NET_ERR', 'CODE_ERR', 'ENV_ERR', 'PERF_ERR', 'SEC_ERR'];

  // Add priority categories first
  priorityOrder.forEach(categoryKey => {
    if (ERROR_CATEGORIES[categoryKey]) {
      ERROR_CATEGORIES[categoryKey].errors.forEach(err => {
        if (!createdErrorCodes.has(err.code)) {
          missingErrors.push({
            category: categoryKey,
            code: err.code,
            name: err.name
          });
        }
      });
    }
  });

  // Add remaining categories
  Object.keys(ERROR_CATEGORIES).forEach(categoryKey => {
    if (!priorityOrder.includes(categoryKey)) {
      ERROR_CATEGORIES[categoryKey].errors.forEach(err => {
        if (!createdErrorCodes.has(err.code)) {
          missingErrors.push({
            category: categoryKey,
            code: err.code,
            name: err.name
          });
        }
      });
    }
  });

  console.log(`\n╔════════════════════════════════════════════════════════════╗`);
  console.log(`║  🎯 Generating ${missingErrors.length} Missing Errors (3 LLMs Only)          ║`);
  console.log(`╚════════════════════════════════════════════════════════════╝\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < missingErrors.length; i++) {
    const err = missingErrors[i];
    console.log(`\n[${ (i + 1).toString().padStart(2) }/${missingErrors.length}] ${err.category} - ${err.code}`);

    try {
      await analyzeSpecificError(err.category, err.code);
      successCount++;

      if (i < missingErrors.length - 1) {
        console.log('⏳ Waiting 3 seconds...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n╔════════════════════════════════════════════════════════════╗`);
  console.log(`║  🎉 Complete! Success: ${successCount}, Errors: ${errorCount}                  ║`);
  console.log(`╚════════════════════════════════════════════════════════════╝\n`);

  await pool.end();
}

// Main
const args = process.argv.slice(2);

if (args.length >= 2) {
  const category = args[0].toUpperCase();
  const errorCode = args[1];
  const developerName = args[2] || 'Damla';

  analyzeSpecificError(category, errorCode, developerName)
    .then(() => pool.end())
    .catch(console.error);
} else if (args[0] === 'ALL') {
  generateAllMissing().catch(console.error);
} else {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║       Generate Missing Errors - 3 LLMs (No OpenRouter)    ║
╚════════════════════════════════════════════════════════════╝

Usage:
  node src/generate-missing-3llm.js ALL
  node src/generate-missing-3llm.js <CATEGORY> <ERROR_CODE> [DEVELOPER]

Examples:
  node src/generate-missing-3llm.js ALL
  node src/generate-missing-3llm.js NET_ERR ConnectionReset
  node src/generate-missing-3llm.js CODE_ERR NullPointerException "Damla"
  `);
  pool.end();
}

export { analyzeSpecificError, generateAllMissing };
