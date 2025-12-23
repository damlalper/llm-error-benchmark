import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function exportToCSV() {
  try {
    console.log('📊 Exporting data to CSV...\n');

    const result = await pool.query(`
      SELECT
        id, developer_name, created_at, error_category, error_code,
        error_message, prompt_sent,
        groq_response, mistral_response, cohere_response,
        openrouter_response, openrouter_hermes_response,
        groq_response_time, mistral_response_time, cohere_response_time,
        openrouter_response_time, openrouter_hermes_response_time,
        best_llm, notes
      FROM llm_error_analysis
      ORDER BY id
    `);

    console.log(`✅ Found ${result.rows.length} records\n`);

    // CSV header
    const headers = Object.keys(result.rows[0]).join(',');

    // CSV rows - escape commas and quotes in text fields
    const rows = result.rows.map(row => {
      return Object.values(row).map(val => {
        if (val === null) return '';
        if (typeof val === 'string') {
          // Escape quotes and wrap in quotes if contains comma or newline
          const escaped = val.replace(/"/g, '""');
          if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
            return `"${escaped}"`;
          }
          return escaped;
        }
        return val;
      }).join(',');
    }).join('\n');

    const csv = `${headers}\n${rows}`;

    const filename = `llm_data_export_${process.env.DEVELOPER_NAME || 'unknown'}_${Date.now()}.csv`;
    fs.writeFileSync(filename, csv, 'utf8');

    console.log(`💾 Exported to: ${filename}`);
    console.log(`📈 Total records: ${result.rows.length}\n`);
    console.log('📋 Next steps:');
    console.log('1. Arkadaşınızdan da aynı scripti çalıştırmasını isteyin');
    console.log('2. İki CSV dosyasını import-merged-data.js ile birleştirin\n');

  } catch (error) {
    console.error('❌ Error exporting data:', error.message);
  } finally {
    await pool.end();
  }
}

exportToCSV();
