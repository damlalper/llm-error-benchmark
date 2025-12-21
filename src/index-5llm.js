import { getRandomError, getAllCategories, generatePrompt } from './data/errorCategories.js';
import { analyzeWithGemini } from './services/gemini.js';
import { analyzeWithGroq } from './services/groq.js';
import { analyzeWithMistral } from './services/mistral.js';
import { analyzeWithCohere } from './services/cohere.js';
import { analyzeWithOpenRouter } from './services/openrouter.js';
import pool from './database/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function analyzeError(category, developerName = 'Developer') {
  console.log('\n========================================');
  console.log(`📊 Starting 5-LLM Error Analysis for ${category}`);
  console.log('========================================\n');

  // Get random error from category
  const error = getRandomError(category);
  console.log(`🔍 Selected Error: ${error.name}`);
  console.log(`📝 Message: ${error.message}\n`);

  // Generate prompt
  const prompt = generatePrompt(error);
  console.log('📤 Prompt generated\n');

  // Analyze with all 5 LLMs in parallel with timing
  console.log('🚀 Sending to 5 LLMs...\n');

  const startTimes = {
    gemini: Date.now(),
    groq: Date.now(),
    mistral: Date.now(),
    cohere: Date.now(),
    openrouter: Date.now()
  };

  const [geminiResult, groqResult, mistralResult, cohereResult, openrouterResult] = await Promise.allSettled([
    analyzeWithGemini(prompt).then(res => ({ response: res, time: Date.now() - startTimes.gemini })),
    analyzeWithGroq(prompt).then(res => ({ response: res, time: Date.now() - startTimes.groq })),
    analyzeWithMistral(prompt).then(res => ({ response: res, time: Date.now() - startTimes.mistral })),
    analyzeWithCohere(prompt).then(res => ({ response: res, time: Date.now() - startTimes.cohere })),
    analyzeWithOpenRouter(prompt).then(res => ({ response: res, time: Date.now() - startTimes.openrouter }))
  ]);

  console.log('\n✅ All LLM responses received!\n');

  // Extract responses and times
  const geminiResponse = geminiResult.status === 'fulfilled' ? geminiResult.value.response : `Error: ${geminiResult.reason}`;
  const geminiTime = geminiResult.status === 'fulfilled' ? geminiResult.value.time : null;

  const groqResponse = groqResult.status === 'fulfilled' ? groqResult.value.response : `Error: ${groqResult.reason}`;
  const groqTime = groqResult.status === 'fulfilled' ? groqResult.value.time : null;

  const mistralResponse = mistralResult.status === 'fulfilled' ? mistralResult.value.response : `Error: ${mistralResult.reason}`;
  const mistralTime = mistralResult.status === 'fulfilled' ? mistralResult.value.time : null;

  const cohereResponse = cohereResult.status === 'fulfilled' ? cohereResult.value.response : `Error: ${cohereResult.reason}`;
  const cohereTime = cohereResult.status === 'fulfilled' ? cohereResult.value.time : null;

  const openrouterResponse = openrouterResult.status === 'fulfilled' ? openrouterResult.value.response : `Error: ${openrouterResult.reason}`;
  const openrouterTime = openrouterResult.status === 'fulfilled' ? openrouterResult.value.time : null;

  // Display response times
  console.log('⏱️  Response Times:');
  console.log(`   Gemini:     ${geminiTime ? geminiTime + 'ms' : 'Failed'}`);
  console.log(`   Groq:       ${groqTime ? groqTime + 'ms' : 'Failed'} ${groqTime && groqTime < 2000 ? '🚀 FASTEST!' : ''}`);
  console.log(`   Mistral:    ${mistralTime ? mistralTime + 'ms' : 'Failed'}`);
  console.log(`   Cohere:     ${cohereTime ? cohereTime + 'ms' : 'Failed'}`);
  console.log(`   OpenRouter: ${openrouterTime ? openrouterTime + 'ms' : 'Failed'}\n`);

  // Save to database
  try {
    const query = `
      INSERT INTO llm_error_analysis (
        developer_name, error_category, error_code, error_message,
        prompt_sent,
        gemini_response, groq_response, mistral_response, cohere_response, openrouter_response,
        gemini_response_time, groq_response_time, mistral_response_time, cohere_response_time, openrouter_response_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *;
    `;

    const values = [
      developerName,
      error.category,
      error.code,
      error.message,
      prompt,
      geminiResponse,
      groqResponse,
      mistralResponse,
      cohereResponse,
      openrouterResponse,
      geminiTime,
      groqTime,
      mistralTime,
      cohereTime,
      openrouterTime
    ];

    const result = await pool.query(query, values);
    const record = result.rows[0];

    console.log(`💾 Analysis saved to database with ID: ${record.id}\n`);
    console.log('========================================');
    console.log('✨ 5-LLM Analysis Complete!');
    console.log('========================================\n');

    return record;
  } catch (error) {
    console.error('❌ Failed to save analysis:', error.message);
    throw error;
  }
}

async function analyzeMultipleErrors(count = 3) {
  console.log(`\n🎯 Starting batch analysis of ${count} random errors with 5 LLMs...\n`);

  const categories = getAllCategories();
  const results = [];

  for (let i = 0; i < count; i++) {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    try {
      const result = await analyzeError(randomCategory, process.env.DEVELOPER_NAME || 'Developer');
      results.push(result);

      // Wait between requests
      if (i < count - 1) {
        console.log('⏳ Waiting 3 seconds before next analysis...\n');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.error(`❌ Failed to analyze error ${i + 1}:`, error.message);
    }
  }

  console.log(`\n🎉 Batch analysis complete! Analyzed ${results.length} errors with 5 LLMs.`);

  await pool.end();
  return results;
}

// Main execution
const args = process.argv.slice(2);

if (args.length > 0) {
  const category = args[0].toUpperCase();
  const developerName = args[1] || process.env.DEVELOPER_NAME || 'Developer';

  if (category === 'BATCH') {
    const count = parseInt(args[1]) || 3;
    analyzeMultipleErrors(count).catch(console.error);
  } else {
    analyzeError(category, developerName)
      .then(() => pool.end())
      .catch(console.error);
  }
} else {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║       LLM Error Analysis Platform - 5 LLMs Edition         ║
╚════════════════════════════════════════════════════════════╝

🤖 Supported LLMs:
  1. Gemini 2.5 Flash    - 1M+ token context
  2. Groq (Llama 3.3)    - Ultra-fast responses
  3. Mistral (Devstral)  - Code specialist
  4. Cohere (Command A)  - Reasoning expert
  5. OpenRouter (Qwen)   - General purpose

Usage:
  node src/index-5llm.js <CATEGORY> [DEVELOPER_NAME]
  node src/index-5llm.js BATCH [COUNT]

Available Categories:
  API_ERR, AUTO_ERR, BROWSER_ERR, CODE_ERR,
  CONFIG_ERR, DATA_ERR, DB_ERR, ENV_ERR,
  NET_ERR, PERF_ERR, SEC_ERR, VERSION_ERR

Examples:
  node src/index-5llm.js API_ERR "John Doe"
  node src/index-5llm.js CODE_ERR
  node src/index-5llm.js BATCH 5
  `);
  pool.end();
}

export { analyzeError, analyzeMultipleErrors };
