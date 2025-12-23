import pool from '../../src/database/db.js';

async function checkSchema() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'llm_error_analysis'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Table Schema: llm_error_analysis\n');
    console.log('Column Name                          | Data Type');
    console.log('-'.repeat(60));

    result.rows.forEach(row => {
      console.log(`${row.column_name.padEnd(35)} | ${row.data_type}`);
    });

    console.log('\n✅ Total columns:', result.rows.length, '\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
