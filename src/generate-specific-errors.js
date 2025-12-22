import { getErrorByCode, generatePrompt, ERROR_CATEGORIES } from './data/errorCategories.js';
import { analyzeWithGroq } from './services/groq.js';
import { analyzeWithMistral } from './services/mistral.js';
import { analyzeWithCohere } from './services/cohere.js';
import { analyzeWithOpenRouter } from './services/openrouter.js';
import { analyzeWithOpenRouterMistral } from './services/openrouter-mistral.js';
import { analyzeWithOpenRouter2 } from './services/openrouter2.js';
import pool from './database/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function analyzeSpecificError(category, errorCode, developerName = 'Damla') {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log(`║  🎯 Specific Error Analysis: ${category}                    ║`);
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const error = getErrorByCode(category, errorCode);
  console.log(`🔍 Error Code: ${error.code}`);
  console.log(`📝 Error Name: ${error.name}`);
  console.log(`💬 Message: ${error.message}\n`);

  const prompt = generatePrompt(error);
  console.log('📤 Sending to 6 LLMs in parallel...\n');

  const startTime = Date.now();

  const [groqResult, mistralResult, cohereResult, openrouterLlamaResult, openrouterMistralResult, openrouterHermesResult] =
    await Promise.allSettled([
      analyzeWithGroq(prompt).then(res => ({ response: res, time: Date.now() - startTime })),
      analyzeWithMistral(prompt).then(res => ({ response: res, time: Date.now() - startTime })),
      analyzeWithCohere(prompt).then(res => ({ response: res, time: Date.now() - startTime })),
      analyzeWithOpenRouter(prompt).then(res => ({ response: res, time: Date.now() - startTime })),
      analyzeWithOpenRouterMistral(prompt).then(res => ({ response: res, time: Date.now() - startTime })),
      analyzeWithOpenRouter2(prompt).then(res => ({ response: res, time: Date.now() - startTime }))
    ]);

  console.log('\n✅ All LLM responses received!\n');

  // Extract results
  const groq = groqResult.status === 'fulfilled' ? groqResult.value : { response: `Error: ${groqResult.reason}`, time: null };
  const mistral = mistralResult.status === 'fulfilled' ? mistralResult.value : { response: `Error: ${mistralResult.reason}`, time: null };
  const cohere = cohereResult.status === 'fulfilled' ? cohereResult.value : { response: `Error: ${cohereResult.reason}`, time: null };
  const openrouterLlama = openrouterLlamaResult.status === 'fulfilled' ? openrouterLlamaResult.value : { response: `Error: ${openrouterLlamaResult.reason}`, time: null };
  const openrouterMistral = openrouterMistralResult.status === 'fulfilled' ? openrouterMistralResult.value : { response: `Error: ${openrouterMistralResult.reason}`, time: null };
  const openrouterHermes = openrouterHermesResult.status === 'fulfilled' ? openrouterHermesResult.value : { response: `Error: ${openrouterHermesResult.reason}`, time: null };

  // Display response times
  console.log('⏱️  Response Times:');
  console.log(`   Groq (Llama 70B):        ${groq.time ? groq.time + 'ms' : 'Failed'} ${groq.time && groq.time < 5000 ? '🚀' : ''}`);
  console.log(`   Mistral (API):           ${mistral.time ? mistral.time + 'ms' : 'Failed'}`);
  console.log(`   Cohere (Nightly):        ${cohere.time ? cohere.time + 'ms' : 'Failed'}`);
  console.log(`   OpenRouter (Llama 3B):   ${openrouterLlama.time ? openrouterLlama.time + 'ms' : 'Failed'}`);
  console.log(`   OpenRouter (Mistral 7B): ${openrouterMistral.time ? openrouterMistral.time + 'ms' : 'Failed'}`);
  console.log(`   OpenRouter (Hermes 405B):${openrouterHermes.time ? openrouterHermes.time + 'ms' : 'Failed'} ${openrouterHermes.time && openrouterHermes.time > 30000 ? '💪' : ''}\n`);

  // Save to database
  try {
    const result = await pool.query(
      `INSERT INTO llm_error_analysis
      (developer_name, error_category, error_code, error_message,
       groq_response, mistral_response, cohere_response,
       openrouter_response, openrouter_mistral_response, openrouter_hermes_response,
       groq_response_time, mistral_response_time, cohere_response_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id`,
      [
        developerName,
        error.category,
        error.code,
        error.message,
        groq.response,
        mistral.response,
        cohere.response,
        openrouterLlama.response,
        openrouterMistral.response,
        openrouterHermes.response,
        groq.time,
        mistral.time,
        cohere.time
      ]
    );

    console.log(`💾 Analysis saved with ID: ${result.rows[0].id}\n`);

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║              ✨ 6-LLM Analysis Complete! ✨               ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    return result.rows[0].id;
  } catch (error) {
    console.error('❌ Database error:', error.message);
    throw error;
  }
}

// Generate multiple specific errors
async function generateMissingErrors() {
  // Get missing errors from database
  const result = await pool.query(`
    SELECT DISTINCT error_code
    FROM llm_error_analysis
  `);

  const createdErrorCodes = new Set(result.rows.map(r => r.error_code));

  const missingErrors = [];

  Object.keys(ERROR_CATEGORIES).forEach(categoryKey => {
    const category = ERROR_CATEGORIES[categoryKey];
    category.errors.forEach(err => {
      if (!createdErrorCodes.has(err.code)) {
        missingErrors.push({
          category: categoryKey,
          code: err.code,
          name: err.name
        });
      }
    });
  });

  console.log(`\n🎯 Generating ${missingErrors.length} missing errors...\n`);

  for (let i = 0; i < missingErrors.length; i++) {
    const err = missingErrors[i];
    console.log(`\n[${i + 1}/${missingErrors.length}] Generating ${err.category} - ${err.code}`);

    try {
      await analyzeSpecificError(err.category, err.code);

      if (i < missingErrors.length - 1) {
        console.log('\n⏳ Waiting 3 seconds...\n');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.error(`❌ Error generating ${err.code}:`, error.message);
    }
  }

  console.log(`\n🎉 All ${missingErrors.length} missing errors generated!`);
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
  generateMissingErrors().catch(console.error);
} else {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║       Generate Specific Errors - 6 LLMs Edition            ║
╚════════════════════════════════════════════════════════════╝

Usage:
  node src/generate-specific-errors.js <CATEGORY> <ERROR_CODE> [DEVELOPER_NAME]
  node src/generate-specific-errors.js ALL

Examples:
  node src/generate-specific-errors.js NET_ERR ConnectionReset "Damla"
  node src/generate-specific-errors.js CODE_ERR NullPointerException
  node src/generate-specific-errors.js ALL  # Generate all missing errors
  `);
  pool.end();
}

export { analyzeSpecificError, generateMissingErrors };
