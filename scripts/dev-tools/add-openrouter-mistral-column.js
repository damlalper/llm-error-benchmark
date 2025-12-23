import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function addOpenRouterMistralColumn() {
  try {
    console.log('🔧 Adding openrouter_mistral columns...\n');

    // Check if columns already exist
    const checkQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'llm_error_analysis'
        AND column_name IN ('openrouter_mistral_response', 'openrouter_mistral_response_time')
    `;

    const existing = await pool.query(checkQuery);

    if (existing.rows.length === 2) {
      console.log('✅ Columns already exist, nothing to do!');
      await pool.end();
      return;
    }

    // Add columns
    await pool.query(`
      ALTER TABLE llm_error_analysis
      ADD COLUMN IF NOT EXISTS openrouter_mistral_response TEXT,
      ADD COLUMN IF NOT EXISTS openrouter_mistral_response_time INTEGER
    `);

    console.log('✅ Columns added successfully!');
    console.log('   - openrouter_mistral_response');
    console.log('   - openrouter_mistral_response_time\n');

    // Verify
    const verify = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'llm_error_analysis'
        AND column_name LIKE '%openrouter%'
      ORDER BY ordinal_position
    `);

    console.log('📊 All OpenRouter columns:');
    verify.rows.forEach(row => {
      console.log(`   - ${row.column_name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addOpenRouterMistralColumn();
