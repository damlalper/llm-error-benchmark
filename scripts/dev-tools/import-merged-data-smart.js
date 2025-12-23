import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

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

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

async function importCSVSmart(csvFiles, clearData = false) {
  try {
    console.log('📊 Smart CSV Import - Column name based\n');

    if (clearData) {
      console.log('⚠️  Clearing existing data...');
      await pool.query('TRUNCATE llm_error_analysis RESTART IDENTITY');
      console.log('✅ Existing data cleared\n');
    }

    let totalImported = 0;

    for (let fileIndex = 0; fileIndex < csvFiles.length; fileIndex++) {
      const csvFile = csvFiles[fileIndex];
      console.log(`\n📁 Processing file ${fileIndex + 1}/${csvFiles.length}: ${csvFile}`);

      const csvContent = fs.readFileSync(csvFile, 'utf8');
      const lines = csvContent.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        console.log('⚠️  File is empty or has only headers, skipping...');
        continue;
      }

      // Parse headers
      const headers = parseCSVLine(lines[0]);
      console.log(`   Columns found: ${headers.length}`);
      console.log(`   Records: ${lines.length - 1}`);

      // Create column index map
      const columnMap = {};
      headers.forEach((header, index) => {
        columnMap[header.toLowerCase().trim()] = index;
      });

      // Import each row
      let fileImported = 0;
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);

        // Skip if not enough columns
        if (values.length < headers.length - 5) {
          console.log(`   ⚠️  Row ${i} skipped (incomplete)`);
          continue;
        }

        // Helper to get value by column name
        const getVal = (colName) => {
          const idx = columnMap[colName.toLowerCase()];
          return idx !== undefined ? (values[idx] || null) : null;
        };

        try {
          // Note: Only importing columns that exist in YOUR database
          // Gemini columns are skipped (you have them, friend doesn't)
          // openrouter_mistral columns are skipped (friend has them, you don't)

          await pool.query(`
            INSERT INTO llm_error_analysis (
              developer_name, created_at, error_category, error_code,
              error_message, prompt_sent,
              groq_response, mistral_response, cohere_response,
              openrouter_response, openrouter_mistral_response, openrouter_hermes_response,
              groq_response_time, mistral_response_time, cohere_response_time,
              openrouter_response_time, openrouter_mistral_response_time, openrouter_hermes_response_time,
              best_llm, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
          `, [
            getVal('developer_name'),
            getVal('created_at'),
            getVal('error_category'),
            getVal('error_code'),
            getVal('error_message'),
            getVal('prompt_sent'),
            getVal('groq_response'),
            getVal('mistral_response'),
            getVal('cohere_response'),
            // Handle both naming conventions for OpenRouter Llama
            getVal('openrouter_response') || getVal('openrouter_llama_response'),
            getVal('openrouter_mistral_response'),
            getVal('openrouter_hermes_response'),
            getVal('groq_response_time') ? parseInt(getVal('groq_response_time')) : null,
            getVal('mistral_response_time') ? parseInt(getVal('mistral_response_time')) : null,
            getVal('cohere_response_time') ? parseInt(getVal('cohere_response_time')) : null,
            (getVal('openrouter_response_time') || getVal('openrouter_llama_response_time')) ?
              parseInt(getVal('openrouter_response_time') || getVal('openrouter_llama_response_time')) : null,
            getVal('openrouter_mistral_response_time') ? parseInt(getVal('openrouter_mistral_response_time')) : null,
            getVal('openrouter_hermes_response_time') ? parseInt(getVal('openrouter_hermes_response_time')) : null,
            getVal('best_llm'),
            getVal('notes')
          ]);

          fileImported++;
          totalImported++;

          if (fileImported % 50 === 0) {
            console.log(`   ✅ Imported ${fileImported} records from this file...`);
          }
        } catch (error) {
          console.error(`   ❌ Error importing row ${i}:`, error.message);
        }
      }

      console.log(`   ✅ File complete: ${fileImported} records imported`);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Total imported: ${totalImported} records\n`);

    // Show statistics
    const stats = await pool.query(`
      SELECT
        developer_name,
        COUNT(*) as count
      FROM llm_error_analysis
      GROUP BY developer_name
      ORDER BY count DESC
    `);

    console.log('📋 Data distribution by developer:');
    stats.rows.forEach(row => {
      console.log(`   ${row.developer_name}: ${row.count} records`);
    });

    const total = await pool.query('SELECT COUNT(*) FROM llm_error_analysis');
    console.log(`\n📊 Total records in database: ${total.rows[0].count}`);

    console.log('\n✅ Ready to run evaluation!');
    console.log('   cd evaluation && python main.py\n');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

// Parse arguments
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help') {
  console.log('Smart CSV Import - Works with any column order!');
  console.log('');
  console.log('Usage: node import-merged-data-smart.js <csv1> <csv2> [...csvN] [--clear]');
  console.log('');
  console.log('Examples:');
  console.log('  node import-merged-data-smart.js alice.csv bob.csv');
  console.log('  node import-merged-data-smart.js alice.csv bob.csv charlie.csv --clear');
  console.log('');
  console.log('Options:');
  console.log('  --clear   Clear existing data before import');
  console.log('');
  console.log('Features:');
  console.log('  ✅ Column name based (not index based)');
  console.log('  ✅ Works with different column orders');
  console.log('  ✅ Handles multiple CSV files');
  console.log('  ✅ Safe for different DB structures');
  process.exit(0);
}

const clearData = args.includes('--clear');
const csvFiles = args.filter(arg => arg !== '--clear');

// Validate files
for (const file of csvFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ File not found: ${file}`);
    process.exit(1);
  }
}

importCSVSmart(csvFiles, clearData);
