import pool from '../../src/database/db.js';

async function findNullResponses() {
  try {
    console.log('🔍 Checking for NULL responses...\n');

    const result = await pool.query(`
      SELECT
        id,
        error_category,
        error_code,
        CASE WHEN groq_response IS NULL THEN 'NULL' ELSE 'OK' END as groq,
        CASE WHEN mistral_response IS NULL THEN 'NULL' ELSE 'OK' END as mistral,
        CASE WHEN cohere_response IS NULL THEN 'NULL' ELSE 'OK' END as cohere,
        CASE WHEN openrouter_response IS NULL THEN 'NULL' ELSE 'OK' END as openrouter,
        CASE WHEN openrouter_hermes_response IS NULL THEN 'NULL' ELSE 'OK' END as openrouter_hermes
      FROM llm_error_analysis
      WHERE
        groq_response IS NULL OR
        mistral_response IS NULL OR
        cohere_response IS NULL OR
        openrouter_response IS NULL OR
        openrouter_hermes_response IS NULL
      ORDER BY id
    `);

    if (result.rows.length === 0) {
      console.log('✅ No NULL responses found! All records are complete.\n');
      await pool.end();
      return;
    }

    console.log(`📊 Found ${result.rows.length} records with NULL responses:\n`);
    console.log('ID  | Category      | Error Code                  | Groq | Mistral | Cohere | OR-Llama | OR-Hermes');
    console.log('-'.repeat(110));

    result.rows.forEach(row => {
      console.log(
        `${row.id.toString().padEnd(4)}| ${row.error_category.padEnd(14)}| ${row.error_code.padEnd(28)}| ${row.groq.padEnd(5)}| ${row.mistral.padEnd(8)}| ${row.cohere.padEnd(7)}| ${row.openrouter.padEnd(9)}| ${row.openrouter_hermes}`
      );
    });

    // Summary
    const summary = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(groq_response) as groq_ok,
        COUNT(mistral_response) as mistral_ok,
        COUNT(cohere_response) as cohere_ok,
        COUNT(openrouter_response) as openrouter_ok,
        COUNT(openrouter_hermes_response) as openrouter_hermes_ok
      FROM llm_error_analysis
    `);

    const s = summary.rows[0];
    console.log('\n' + '='.repeat(60));
    console.log('📈 SUMMARY:\n');
    console.log(`Total records:        ${s.total}`);
    console.log(`Groq OK:              ${s.groq_ok} (${s.total - s.groq_ok} NULL)`);
    console.log(`Mistral OK:           ${s.mistral_ok} (${s.total - s.mistral_ok} NULL)`);
    console.log(`Cohere OK:            ${s.cohere_ok} (${s.total - s.cohere_ok} NULL)`);
    console.log(`OpenRouter Llama OK:  ${s.openrouter_ok} (${s.total - s.openrouter_ok} NULL)`);
    console.log(`OpenRouter Hermes OK: ${s.openrouter_hermes_ok} (${s.total - s.openrouter_hermes_ok} NULL)`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

findNullResponses();
