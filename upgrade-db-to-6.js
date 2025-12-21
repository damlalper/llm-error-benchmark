import pool from './src/database/db.js';
import { readFileSync } from 'fs';

async function upgrade() {
  try {
    console.log('\n🔄 Upgrading to 6 LLMs...\n');

    const sql = readFileSync('src/database/upgrade-to-6-llm.sql', 'utf-8');
    await pool.query(sql);

    console.log('✅ Database upgraded to 6 LLMs!');
    console.log('\n📊 Supported LLMs:');
    console.log('   1. Groq (Llama 3.3 70B)');
    console.log('   2. Mistral (via Mistral API)');
    console.log('   3. Cohere (command-nightly)');
    console.log('   4. OpenRouter - Llama 3.2 3B');
    console.log('   5. OpenRouter - Mistral 7B');
    console.log('   6. OpenRouter - Hermes 405B\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

upgrade();
