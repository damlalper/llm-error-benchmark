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

// Robust CSV parser that handles multiline quoted fields
function parseCSV(csvContent) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < csvContent.length) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote inside quoted field
        currentField += '"';
        i += 2;
        continue;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
        continue;
      }
    }

    if (!inQuotes) {
      if (char === ',') {
        // End of field
        currentRow.push(currentField);
        currentField = '';
        i++;
        continue;
      }

      if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        // End of row
        currentRow.push(currentField);
        if (currentRow.length > 1 || currentRow[0] !== '') {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
        i += (char === '\r' ? 2 : 1);
        continue;
      }
    }

    // Regular character (or newline inside quotes)
    currentField += char;
    i++;
  }

  // Handle last field/row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.length > 1 || currentRow[0] !== '') {
      rows.push(currentRow);
    }
  }

  return rows;
}

async function importCSV(csvFile) {
  try {
    console.log('📊 Robust CSV Import\n');
    console.log(`📁 Reading: ${csvFile}`);

    const csvContent = fs.readFileSync(csvFile, 'utf8');
    const rows = parseCSV(csvContent);

    if (rows.length < 2) {
      console.log('⚠️  File is empty or has only headers');
      return;
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);

    console.log(`   Columns: ${headers.length}`);
    console.log(`   Records: ${dataRows.length}\n`);

    // Create column index map
    const columnMap = {};
    headers.forEach((header, index) => {
      columnMap[header.toLowerCase().trim()] = index;
    });

    // Import each row
    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < dataRows.length; i++) {
      const values = dataRows[i];

      if (values.length < headers.length - 5) {
        console.log(`   ⚠️  Row ${i + 1} skipped (too few columns: ${values.length})`);
        skipped++;
        continue;
      }

      const getVal = (colName) => {
        const idx = columnMap[colName.toLowerCase()];
        return idx !== undefined ? (values[idx] || null) : null;
      };

      try {
        // Skip created_at field to use default CURRENT_TIMESTAMP
        await pool.query(`
          INSERT INTO llm_error_analysis (
            developer_name, error_category, error_code,
            error_message, prompt_sent,
            groq_response, mistral_response, cohere_response,
            openrouter_response, openrouter_mistral_response, openrouter_hermes_response,
            groq_response_time, mistral_response_time, cohere_response_time,
            openrouter_response_time, openrouter_mistral_response_time, openrouter_hermes_response_time,
            best_llm, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        `, [
          getVal('developer_name'),
          getVal('error_category'),
          getVal('error_code'),
          getVal('error_message'),
          getVal('prompt_sent'),
          getVal('groq_response'),
          getVal('mistral_response'),
          getVal('cohere_response'),
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

        imported++;

        if (imported % 25 === 0) {
          console.log(`   ✅ Imported ${imported}/${dataRows.length}...`);
        }
      } catch (error) {
        console.error(`   ❌ Error importing row ${i + 1}:`, error.message);
        skipped++;
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Imported: ${imported}`);
    console.log(`⚠️  Skipped: ${skipped}`);
    console.log(`📊 Total: ${dataRows.length}\n`);

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
    console.log(`\n📊 Total records in database: ${total.rows[0].count}\n`);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

const csvFile = process.argv[2];

if (!csvFile) {
  console.log('Usage: node import-csv-robust.js <csv-file>');
  console.log('Example: node import-csv-robust.js data.csv');
  process.exit(1);
}

if (!fs.existsSync(csvFile)) {
  console.error(`❌ File not found: ${csvFile}`);
  process.exit(1);
}

importCSV(csvFile);
