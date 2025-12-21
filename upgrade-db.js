import pool from './src/database/db.js';
import { readFileSync } from 'fs';

async function upgradeDatabase() {
  try {
    console.log('\n🔄 Veritabanı 5 LLM için güncelleniyor...\n');

    const upgradeSql = readFileSync('src/database/upgrade-to-5-llm.sql', 'utf-8');

    await pool.query(upgradeSql);

    console.log('✅ Veritabanı başarıyla güncellendi!');
    console.log('📊 Artık 5 LLM destekleniyor:');
    console.log('   - Gemini 2.5 Flash');
    console.log('   - Groq (Llama 3.3 70B)');
    console.log('   - Mistral (Devstral 2)');
    console.log('   - Cohere (Command A)');
    console.log('   - OpenRouter (Qwen 2.5 72B)\n');

  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await pool.end();
  }
}

upgradeDatabase();
