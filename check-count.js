import pool from './src/database/db.js';

async function checkCount() {
  const result = await pool.query('SELECT COUNT(*) FROM llm_error_analysis');
  console.log(`\n📊 Toplam veri: ${result.rows[0].count}\n`);
  await pool.end();
}

checkCount();
