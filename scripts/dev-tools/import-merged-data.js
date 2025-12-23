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

async function importCSV(csvFile1, csvFile2) {
  try {
    console.log('📊 Importing merged data from CSV files...\n');

    // Read CSV files
    const csv1 = fs.readFileSync(csvFile1, 'utf8');
    const csv2 = fs.readFileSync(csvFile2, 'utf8');

    const lines1 = csv1.split('\n').filter(line => line.trim());
    const lines2 = csv2.split('\n').filter(line => line.trim());

    // Skip headers
    const headers = parseCSVLine(lines1[0]);
    const data1 = lines1.slice(1);
    const data2 = lines2.slice(1);

    console.log(`📁 File 1: ${data1.length} records`);
    console.log(`📁 File 2: ${data2.length} records`);
    console.log(`📊 Total: ${data1.length + data2.length} records\n`);

    // Clear existing data (optional - comment out if you want to keep old data)
    const clearChoice = process.argv[4];
    if (clearChoice === '--clear') {
      console.log('⚠️  Clearing existing data...');
      await pool.query('TRUNCATE llm_error_analysis RESTART IDENTITY');
      console.log('✅ Existing data cleared\n');
    }

    // Import data
    let imported = 0;
    const allData = [...data1, ...data2];

    for (const line of allData) {
      const values = parseCSVLine(line);

      // Skip header row if accidentally included
      if (values[0] === 'id') continue;

      await pool.query(`
        INSERT INTO llm_error_analysis (
          developer_name, created_at, error_category, error_code,
          error_message, prompt_sent,
          groq_response, mistral_response, cohere_response,
          openrouter_response, openrouter_hermes_response,
          groq_response_time, mistral_response_time, cohere_response_time,
          openrouter_response_time, openrouter_hermes_response_time,
          best_llm, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      `, [
        values[1],  // developer_name
        values[2],  // created_at
        values[3],  // error_category
        values[4],  // error_code
        values[5],  // error_message
        values[6],  // prompt_sent
        values[7],  // groq_response
        values[8],  // mistral_response
        values[9],  // cohere_response
        values[10], // openrouter_response
        values[11], // openrouter_hermes_response
        values[12] || null, // groq_response_time
        values[13] || null, // mistral_response_time
        values[14] || null, // cohere_response_time
        values[15] || null, // openrouter_response_time
        values[16] || null, // openrouter_hermes_response_time
        values[17] || null, // best_llm
        values[18] || null  // notes
      ]);

      imported++;
      if (imported % 50 === 0) {
        console.log(`✅ Imported ${imported}/${allData.length} records...`);
      }
    }

    console.log(`\n✅ Import completed!`);
    console.log(`📊 Total records imported: ${imported}\n`);

    // Show statistics
    const stats = await pool.query(`
      SELECT
        developer_name,
        COUNT(*) as count
      FROM llm_error_analysis
      GROUP BY developer_name
      ORDER BY count DESC
    `);

    console.log('📋 Data distribution:');
    stats.rows.forEach(row => {
      console.log(`   ${row.developer_name}: ${row.count} records`);
    });

    console.log('\n✅ Ready to run evaluation algorithm!');
    console.log('   cd evaluation && python main.py\n');

  } catch (error) {
    console.error('❌ Error importing data:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

// Check arguments
if (process.argv.length < 4) {
  console.log('Usage: node import-merged-data.js <csv_file1> <csv_file2> [--clear]');
  console.log('');
  console.log('Examples:');
  console.log('  node import-merged-data.js alice_data.csv bob_data.csv');
  console.log('  node import-merged-data.js alice_data.csv bob_data.csv --clear');
  console.log('');
  console.log('Options:');
  console.log('  --clear   Clear existing data before import');
  process.exit(1);
}

const csvFile1 = process.argv[2];
const csvFile2 = process.argv[3];

if (!fs.existsSync(csvFile1)) {
  console.error(`❌ File not found: ${csvFile1}`);
  process.exit(1);
}

if (!fs.existsSync(csvFile2)) {
  console.error(`❌ File not found: ${csvFile2}`);
  process.exit(1);
}

importCSV(csvFile1, csvFile2);
