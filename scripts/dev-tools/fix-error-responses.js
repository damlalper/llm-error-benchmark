import pool from '../../src/database/db.js';
import { analyzeWithGroq } from '../../src/services/groq.js';
import { analyzeWithMistral } from '../../src/services/mistral.js';
import { analyzeWithCohere } from '../../src/services/cohere.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixErrorResponses() {
  try {
    console.log('🔧 Fixing error responses...\n');

    // Get all problematic records
    const result = await pool.query(`
      SELECT id, error_code, prompt_sent,
        CASE
          WHEN groq_response IS NULL THEN 'NULL'
          WHEN groq_response LIKE '%Request failed%' THEN 'API_ERROR'
          WHEN groq_response LIKE '%error%' THEN 'ERROR'
          ELSE 'OK'
        END as groq_status,
        CASE
          WHEN cohere_response IS NULL THEN 'NULL'
          WHEN cohere_response LIKE '%Request failed%' THEN 'API_ERROR'
          WHEN cohere_response LIKE '%error%' THEN 'ERROR'
          ELSE 'OK'
        END as cohere_status,
        CASE
          WHEN mistral_response IS NULL THEN 'NULL'
          WHEN mistral_response LIKE '%Request failed%' THEN 'API_ERROR'
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

    const records = result.rows;
    console.log(`📊 Found ${records.length} records to fix\n`);

    if (records.length === 0) {
      console.log('✅ No error responses found!');
      await pool.end();
      return;
    }

    let fixed = 0;
    let failed = 0;
    const delayBetweenRequests = 3000; // 3 seconds

    for (const record of records) {
      console.log(`\n📝 Processing ID: ${record.id} - ${record.error_code}`);
      console.log(`   Groq: ${record.groq_status}, Mistral: ${record.mistral_status}, Cohere: ${record.cohere_status}`);

      let needsGroq = record.groq_status !== 'OK';
      let needsMistral = record.mistral_status !== 'OK';
      let needsCohere = record.cohere_status !== 'OK';

      try {
        let groqResponse = null, groqTime = null;
        let mistralResponse = null, mistralTime = null;
        let cohereResponse = null, cohereTime = null;

        // Fix Groq if needed
        if (needsGroq) {
          console.log('   🤖 Fixing Groq...');
          const start = Date.now();
          try {
            groqResponse = await analyzeWithGroq(record.prompt_sent);
            groqTime = Date.now() - start;
            console.log(`   ✅ Groq fixed (${groqTime}ms)`);
          } catch (error) {
            console.log(`   ❌ Groq failed: ${error.message}`);
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Fix Mistral if needed
        if (needsMistral) {
          console.log('   🤖 Fixing Mistral...');
          const start = Date.now();
          try {
            mistralResponse = await analyzeWithMistral(record.prompt_sent);
            mistralTime = Date.now() - start;
            console.log(`   ✅ Mistral fixed (${mistralTime}ms)`);
          } catch (error) {
            console.log(`   ❌ Mistral failed: ${error.message}`);
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Fix Cohere if needed
        if (needsCohere) {
          console.log('   🤖 Fixing Cohere...');
          const start = Date.now();
          try {
            cohereResponse = await analyzeWithCohere(record.prompt_sent);
            cohereTime = Date.now() - start;
            console.log(`   ✅ Cohere fixed (${cohereTime}ms)`);
          } catch (error) {
            console.log(`   ❌ Cohere failed: ${error.message}`);
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Update database with fixes
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (groqResponse) {
          updates.push(`groq_response = $${paramCount++}`);
          updates.push(`groq_response_time = $${paramCount++}`);
          values.push(groqResponse, groqTime);
        }

        if (mistralResponse) {
          updates.push(`mistral_response = $${paramCount++}`);
          updates.push(`mistral_response_time = $${paramCount++}`);
          values.push(mistralResponse, mistralTime);
        }

        if (cohereResponse) {
          updates.push(`cohere_response = $${paramCount++}`);
          updates.push(`cohere_response_time = $${paramCount++}`);
          values.push(cohereResponse, cohereTime);
        }

        if (updates.length > 0) {
          values.push(record.id);
          await pool.query(
            `UPDATE llm_error_analysis SET ${updates.join(', ')} WHERE id = $${paramCount}`,
            values
          );
          fixed++;
          console.log(`   💾 Updated ID ${record.id}`);
        }

        // Wait before next record
        if (fixed < records.length) {
          console.log(`   ⏳ Waiting ${delayBetweenRequests/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
        }

      } catch (error) {
        console.error(`   ❌ Fatal error for ID ${record.id}:`, error.message);
        failed++;

        // If rate limit, wait longer
        if (error.message.includes('429') || error.message.includes('rate limit')) {
          console.log('   ⚠️  Rate limit hit, waiting 30 seconds...');
          await new Promise(resolve => setTimeout(resolve, 30000));
        }
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`\n✅ Fixed ${fixed}/${records.length} records`);
    console.log(`❌ Failed: ${failed}`);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  } finally {
    await pool.end();
  }
}

fixErrorResponses();
