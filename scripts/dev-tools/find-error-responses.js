import pool from '../../src/database/db.js';

async function findErrorResponses() {
  try {
    console.log('🔍 Checking for error messages in responses...\n');

    // Check for specific problematic records you mentioned
    const specificCheck = await pool.query(`
      SELECT id, error_code,
        LEFT(groq_response, 100) as groq_preview,
        LEFT(cohere_response, 100) as cohere_preview
      FROM llm_error_analysis
      WHERE id IN (1, 2, 3, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115,
                   116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129,
                   130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143,
                   144, 145, 146, 147, 148, 149, 150)
      ORDER BY id
    `);

    console.log('📊 Checking specific records (1-3 and 104-150):\n');
    console.log('ID  | Error Code                  | Groq Preview                                    | Cohere Preview');
    console.log('-'.repeat(140));

    let groqErrors = 0;
    let cohereErrors = 0;

    specificCheck.rows.forEach(row => {
      const groqHasError = row.groq_preview && (
        row.groq_preview.includes('error') ||
        row.groq_preview.includes('Error') ||
        row.groq_preview.includes('failed') ||
        row.groq_preview.includes('invalid')
      );

      const cohereHasError = row.cohere_preview && (
        row.cohere_preview.includes('error') ||
        row.cohere_preview.includes('Error') ||
        row.cohere_preview.includes('failed') ||
        row.cohere_preview.includes('invalid')
      );

      if (groqHasError) groqErrors++;
      if (cohereHasError) cohereErrors++;

      const groqStatus = groqHasError ? '⚠️ ERROR' : '✅ OK';
      const cohereStatus = cohereHasError ? '⚠️ ERROR' : '✅ OK';

      if (groqHasError || cohereHasError) {
        console.log(`${row.id.toString().padEnd(4)}| ${row.error_code.padEnd(28)}| ${groqStatus.padEnd(10)} ${row.groq_preview?.substring(0, 30) || 'NULL'}... | ${cohereStatus.padEnd(10)} ${row.cohere_preview?.substring(0, 30) || 'NULL'}...`);
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log(`\nProblematic responses found:`);
    console.log(`  Groq errors: ${groqErrors}`);
    console.log(`  Cohere errors: ${cohereErrors}`);

    // Now check all records for error patterns
    console.log('\n\n🔍 Checking ALL records for error patterns...\n');

    const allErrorsCheck = await pool.query(`
      SELECT id, error_code,
        CASE
          WHEN groq_response IS NULL THEN 'NULL'
          WHEN groq_response LIKE '%Request failed%' THEN 'API_ERROR'
          WHEN groq_response LIKE '%rate limit%' THEN 'RATE_LIMIT'
          WHEN groq_response LIKE '%429%' THEN 'RATE_LIMIT'
          WHEN groq_response LIKE '%error%' THEN 'ERROR'
          ELSE 'OK'
        END as groq_status,
        CASE
          WHEN cohere_response IS NULL THEN 'NULL'
          WHEN cohere_response LIKE '%Request failed%' THEN 'API_ERROR'
          WHEN cohere_response LIKE '%rate limit%' THEN 'RATE_LIMIT'
          WHEN cohere_response LIKE '%429%' THEN 'RATE_LIMIT'
          WHEN cohere_response LIKE '%error%' THEN 'ERROR'
          ELSE 'OK'
        END as cohere_status,
        CASE
          WHEN mistral_response IS NULL THEN 'NULL'
          WHEN mistral_response LIKE '%Request failed%' THEN 'API_ERROR'
          WHEN mistral_response LIKE '%rate limit%' THEN 'RATE_LIMIT'
          WHEN mistral_response LIKE '%429%' THEN 'RATE_LIMIT'
          WHEN mistral_response LIKE '%error%' THEN 'ERROR'
          ELSE 'OK'
        END as mistral_status
      FROM llm_error_analysis
      WHERE
        groq_response IS NULL OR groq_response LIKE '%error%' OR groq_response LIKE '%Request failed%' OR
        cohere_response IS NULL OR cohere_response LIKE '%error%' OR cohere_response LIKE '%Request failed%' OR
        mistral_response IS NULL OR mistral_response LIKE '%error%' OR mistral_response LIKE '%Request failed%'
      ORDER BY id
    `);

    if (allErrorsCheck.rows.length > 0) {
      console.log('ID  | Error Code                  | Groq       | Mistral    | Cohere');
      console.log('-'.repeat(90));

      allErrorsCheck.rows.forEach(row => {
        console.log(`${row.id.toString().padEnd(4)}| ${row.error_code.padEnd(28)}| ${row.groq_status.padEnd(11)}| ${row.mistral_status.padEnd(11)}| ${row.cohere_status}`);
      });

      console.log(`\n📊 Total records with issues: ${allErrorsCheck.rows.length}`);
    } else {
      console.log('✅ No error patterns found in any responses!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

findErrorResponses();
