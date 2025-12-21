import { getRandomError, getAllCategories, generatePrompt } from './data/errorCategories.js';
import { analyzeWithGroq } from './services/groq.js';
import { analyzeWithMistral } from './services/mistral.js';
import { analyzeWithCohere } from './services/cohere.js';
import { analyzeWithOpenRouter } from './services/openrouter.js';
import { analyzeWithOpenRouterMistral } from './services/openrouter-mistral.js';
import { analyzeWithOpenRouter2 } from './services/openrouter2.js';
import pool from './database/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function analyzeError(category, developerName = 'Developer') {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log(`║  🚀 6-LLM Error Analysis: ${category.padEnd(33)}║`);
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const error = getRandomError(category);
  console.log(`🔍 Error: ${error.name}`);
  console.log(`📝 Message: ${error.message}\n`);

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
  console.log(`   OpenRouter (Hermes 405B):${openrouterHermes.time ? openrouterHermes.time + 'ms' : 'Failed'} ${openrouterHermes.time && openrouterHermes.time < 40000 ? '💪' : ''}\n`);

  // Save to database
  try {
    const query = `
      INSERT INTO llm_error_analysis (
        developer_name, error_category, error_code, error_message,
        prompt_sent,
        groq_response, mistral_response, cohere_response,
        openrouter_response, openrouter_hermes_response,
        groq_response_time, mistral_response_time, cohere_response_time,
        openrouter_response_time, openrouter_hermes_response_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *;
    `;

    const values = [
      developerName,
      error.category,
      error.code,
      error.message,
      prompt,
      groq.response,
      mistral.response,
      cohere.response,
      `${openrouterLlama.response}\n\n--- OpenRouter Mistral 7B ---\n${openrouterMistral.response}`,
      openrouterHermes.response,
      groq.time,
      mistral.time,
      cohere.time,
      openrouterLlama.time,
      openrouterHermes.time
    ];

    const result = await pool.query(query, values);
    const record = result.rows[0];

    console.log(`💾 Analysis saved with ID: ${record.id}\n`);
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║              ✨ 6-LLM Analysis Complete! ✨               ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    return record;
  } catch (error) {
    console.error('❌ Database error:', error.message);
    throw error;
  }
}

async function analyzeMultiple(count = 3) {
  console.log(`\n🎯 Batch analysis: ${count} errors with 6 LLMs...\n`);

  const categories = getAllCategories();
  const results = [];

  for (let i = 0; i < count; i++) {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    try {
      const result = await analyzeError(randomCategory, process.env.DEVELOPER_NAME || 'Developer');
      results.push(result);

      if (i < count - 1) {
        console.log('⏳ Waiting 3 seconds...\n');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.error(`❌ Error ${i + 1}:`, error.message);
    }
  }

  console.log(`\n🎉 Batch complete! Analyzed ${results.length} errors.`);
  await pool.end();
  return results;
}

// Main
const args = process.argv.slice(2);

if (args.length > 0) {
  const category = args[0].toUpperCase();
  const developerName = args[1] || process.env.DEVELOPER_NAME || 'Developer';

  if (category === 'BATCH') {
    const count = parseInt(args[1]) || 3;
    analyzeMultiple(count).catch(console.error);
  } else {
    analyzeError(category, developerName)
      .then(() => pool.end())
      .catch(console.error);
  }
} else {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║       LLM Error Analysis Platform - 6 LLMs Edition         ║
╚════════════════════════════════════════════════════════════╝

🤖 6 FREE LLMs:
  1. Groq (Llama 3.3 70B) - Ultra fast
  2. Mistral (via API) - Code specialist
  3. Cohere (command-nightly) - Reasoning
  4. OpenRouter (Llama 3.2 3B) - Lightweight
  5. OpenRouter (Mistral 7B) - Balanced
  6. OpenRouter (Hermes 405B) - Most powerful

Usage:
  node src/index-6llm.js <CATEGORY> [DEVELOPER_NAME]
  node src/index-6llm.js BATCH [COUNT]

Categories:
  API_ERR, AUTO_ERR, BROWSER_ERR, CODE_ERR, CONFIG_ERR,
  DATA_ERR, DB_ERR, ENV_ERR, NET_ERR, PERF_ERR, SEC_ERR, VERSION_ERR

Examples:
  node src/index-6llm.js CODE_ERR "Alice"
  node src/index-6llm.js BATCH 5
  `);
  pool.end();
}

export { analyzeError, analyzeMultiple };
