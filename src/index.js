import { getRandomError, getAllCategories, generatePrompt } from './data/errorCategories.js';
import { analyzeWithGemini } from './services/gemini.js';
import { analyzeWithGroq } from './services/groq.js';
import { analyzeWithMistral } from './services/mistral.js';
import { insertAnalysis } from './database/repository.js';
import dotenv from 'dotenv';

dotenv.config();

async function analyzeError(category, developerName = 'Developer') {
  console.log('\n========================================');
  console.log(`📊 Starting Error Analysis for ${category}`);
  console.log('========================================\n');

  // Get random error from category
  const error = getRandomError(category);
  console.log(`🔍 Selected Error: ${error.name}`);
  console.log(`📝 Message: ${error.message}\n`);

  // Generate prompt
  const prompt = generatePrompt(error);
  console.log('📤 Prompt generated\n');

  // Analyze with all three LLMs in parallel
  console.log('🚀 Sending to LLMs...\n');

  const [geminiResponse, groqResponse, mistralResponse] = await Promise.all([
    analyzeWithGemini(prompt),
    analyzeWithGroq(prompt),
    analyzeWithMistral(prompt)
  ]);

  console.log('\n✅ All LLM responses received!\n');

  // Save to database
  try {
    const record = await insertAnalysis({
      developerName,
      errorCategory: error.category,
      errorCode: error.code,
      errorMessage: error.message,
      promptSent: prompt,
      geminiResponse,
      groqResponse,
      mistralResponse,
      bestLlm: null, // Will be updated manually later
      notes: null
    });

    console.log(`💾 Analysis saved to database with ID: ${record.id}\n`);
    console.log('========================================');
    console.log('✨ Analysis Complete!');
    console.log('========================================\n');

    return record;
  } catch (error) {
    console.error('❌ Failed to save analysis:', error.message);
    throw error;
  }
}

async function analyzeMultipleErrors(count = 3) {
  console.log(`\n🎯 Starting batch analysis of ${count} random errors...\n`);

  const categories = getAllCategories();
  const results = [];

  for (let i = 0; i < count; i++) {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    try {
      const result = await analyzeError(randomCategory, process.env.DEVELOPER_NAME || 'Developer');
      results.push(result);

      // Wait a bit between requests to avoid rate limiting
      if (i < count - 1) {
        console.log('⏳ Waiting 2 seconds before next analysis...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ Failed to analyze error ${i + 1}:`, error.message);
    }
  }

  console.log(`\n🎉 Batch analysis complete! Analyzed ${results.length} errors.`);
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
    analyzeError(category, developerName).catch(console.error);
  }
} else {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║          LLM Error Analysis Platform                       ║
╚════════════════════════════════════════════════════════════╝

Usage:
  node src/index.js <CATEGORY> [DEVELOPER_NAME]
  node src/index.js BATCH [COUNT]

Available Categories:
  - API_ERR        (API Errors)
  - AUTO_ERR       (Automation Errors)
  - BROWSER_ERR    (Browser Errors)
  - CODE_ERR       (Coding Errors)
  - CONFIG_ERR     (Configuration Errors)
  - DATA_ERR       (Data Errors)
  - DB_ERR         (Database Errors)
  - ENV_ERR        (Environment Errors)
  - NET_ERR        (Network Errors)
  - PERF_ERR       (Performance Errors)
  - SEC_ERR        (Security Errors)
  - VERSION_ERR    (Version Incompatibility Errors)

Examples:
  node src/index.js API_ERR "John Doe"
  node src/index.js CODE_ERR
  node src/index.js BATCH 5

Environment Variables Required:
  - GEMINI_API_KEY
  - GROQ_API_KEY
  - MISTRAL_API_KEY
  - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
  `);
}

export { analyzeError, analyzeMultipleErrors };
