import pool from '../../src/database/db.js';

async function addColumns() {
  try {
    console.log('🔧 Adding evaluation columns...\n');

    await pool.query(`
      ALTER TABLE llm_error_analysis
      ADD COLUMN IF NOT EXISTS worst_llm TEXT,
      ADD COLUMN IF NOT EXISTS description TEXT
    `);

    console.log('✅ Columns added:');
    console.log('   - worst_llm (TEXT)');
    console.log('   - description (TEXT)\n');

    // Verify
    const result = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'llm_error_analysis'
        AND column_name IN ('worst_llm', 'description')
    `);

    console.log('📋 Verification:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.column_name}`);
    });

    console.log('\n✅ Done!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addColumns();
