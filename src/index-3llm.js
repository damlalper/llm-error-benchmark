import { getRandomError, getAllCategories, generatePrompt } from './data/errorCategories.js';
import { analyzeWithGroq } from './services/groq.js';
import { analyzeWithMistral } from './services/mistral.js';
import { analyzeWithCohere } from './services/cohere.js';
import pool from './database/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function analyzeError(category, developerName = 'Damla', seed = null) {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log(`║  🚀 3-LLM Error Analysis: ${category.padEnd(33)}║`);
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const error = getRandomError(category, seed);
  console.log(`🔍 Error: ${error.name}`);
  console.log(`📝 Message: ${error.message}\n`);

  const prompt = generatePrompt(error);
  console.log('📤 Sending to 3 LLMs (Groq, Mistral, Cohere)...\n');

  const startTime = Date.now();

  const [groqResult, mistralResult, cohereResult] =
    await Promise.allSettled([
      analyzeWithGroq(prompt).then(res => ({ response: res, time: Date.now() - startTime })),
      analyzeWithMistral(prompt).then(res => ({ response: res, time: Date.now() - startTime })),
      analyzeWithCohere(prompt).then(res => ({ response: res, time: Date.now() - startTime }))
    ]);

  console.log('\n✅ All LLM responses received!\n');

  const groq = groqResult.status === 'fulfilled' ? groqResult.value : { response: `Error: ${groqResult.reason}`, time: null };
  const mistral = mistralResult.status === 'fulfilled' ? mistralResult.value : { response: `Error: ${mistralResult.reason}`, time: null };
  const cohere = cohereResult.status === 'fulfilled' ? cohereResult.value : { response: `Error: ${cohereResult.reason}`, time: null };

  console.log('⏱️  Response Times:');
  console.log(`   Groq:    ${groq.time ? groq.time + 'ms' : 'Failed'} ${groq.time && groq.time < 5000 ? '🚀' : ''}`);
  console.log(`   Mistral: ${mistral.time ? mistral.time + 'ms' : 'Failed'}`);
  console.log(`   Cohere:  ${cohere.time ? cohere.time + 'ms' : 'Failed'}\n`);

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

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║              ✨ 3-LLM Analysis Complete! ✨               ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    return result.rows[0].id;
  } catch (error) {
    console.error('❌ Database error:', error.message);
    throw error;
  }
}

async function analyzeMultiple(count = 50, developerSeed = 200) {
  const developerName = process.env.DEVELOPER_NAME || 'Damla';

  console.log(`\n🎯 Batch analysis: ${count} errors with 3 LLMs (Groq, Mistral, Cohere)...`);
  console.log(`👤 Developer: ${developerName} (Seed: ${developerSeed})\n`);

  const categories = getAllCategories();
  const results = [];

  for (let i = 0; i < count; i++) {
    const categoryIndex = (developerSeed + i) % categories.length;
    const selectedCategory = categories[categoryIndex];

    try {
      const result = await analyzeError(selectedCategory, developerName, developerSeed + i);
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
  const command = args[0].toUpperCase();

  if (command === 'BATCH') {
    const count = parseInt(args[1]) || 50;
    const developerSeed = parseInt(args[2]) || 200;
    analyzeMultiple(count, developerSeed).catch(console.error);
  } else {
    const category = command;
    const developerName = args[1] || process.env.DEVELOPER_NAME || 'Damla';
    analyzeError(category, developerName)
      .then(() => pool.end())
      .catch(console.error);
  }
} else {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║       LLM Error Analysis - 3 LLMs (No OpenRouter)          ║
╚════════════════════════════════════════════════════════════╝

🤖 3 LLMs: Groq, Mistral, Cohere (No rate limits!)

Usage:
  node src/index-3llm.js BATCH [COUNT] [SEED]
  node src/index-3llm.js <CATEGORY> [DEVELOPER_NAME]

Examples:
  node src/index-3llm.js BATCH 50 200
  node src/index-3llm.js CODE_ERR "Damla"
  `);
  pool.end();
}
