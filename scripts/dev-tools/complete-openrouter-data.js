import pool from '../../src/database/db.js';
import { analyzeWithOpenRouter } from '../../src/services/openrouter.js';
import { analyzeWithOpenRouter2 } from '../../src/services/openrouter2.js';
import dotenv from 'dotenv';

dotenv.config();

async function completeOpenRouterData() {
  try {
    console.log('🔄 Completing OpenRouter data for recent records...\n');

    // Get records without OpenRouter responses (ID >= 154)
    const result = await pool.query(`
      SELECT id, error_code, error_message, prompt_sent
      FROM llm_error_analysis
      WHERE id >= 154
        AND (openrouter_response IS NULL OR openrouter_hermes_response IS NULL)
      ORDER BY id
    `);

    const records = result.rows;
    console.log(`📊 Found ${records.length} records to complete\n`);

    if (records.length === 0) {
      console.log('✅ All records already have OpenRouter responses!');
      await pool.end();
      return;
    }

    let completed = 0;
    const delayBetweenRequests = 5000; // 5 seconds between requests

    for (const record of records) {
      console.log(`\n📝 Processing ID: ${record.id} - ${record.error_code}`);
      console.log(`   Prompt: ${record.prompt_sent.substring(0, 100)}...`);

      try {
        // Call OpenRouter Llama 3B
        console.log('   🤖 OpenRouter (Llama 3B)...');
        const openrouterStart = Date.now();
        const openrouterResponse = await analyzeWithOpenRouter(record.prompt_sent);
        const openrouterTime = Date.now() - openrouterStart;
        console.log(`   ✅ OpenRouter: ${openrouterTime}ms`);

        // Wait before next call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Call OpenRouter Hermes 405B
        console.log('   🤖 OpenRouter (Hermes 405B)...');
        const hermesStart = Date.now();
        const hermesResponse = await analyzeWithOpenRouter2(record.prompt_sent);
        const hermesTime = Date.now() - hermesStart;
        console.log(`   ✅ OpenRouter Hermes: ${hermesTime}ms`);

        // Update database
        await pool.query(`
          UPDATE llm_error_analysis
          SET
            openrouter_response = $1,
            openrouter_response_time = $2,
            openrouter_hermes_response = $3,
            openrouter_hermes_response_time = $4
          WHERE id = $5
        `, [openrouterResponse, openrouterTime, hermesResponse, hermesTime, record.id]);

        completed++;
        console.log(`   💾 Updated ID ${record.id} (${completed}/${records.length})`);

        // Wait before next record
        if (completed < records.length) {
          console.log(`   ⏳ Waiting ${delayBetweenRequests/1000}s before next request...`);
          await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
        }

      } catch (error) {
        console.error(`   ❌ Error for ID ${record.id}:`, error.message);

        // If rate limit, wait longer
        if (error.message.includes('429') || error.message.includes('rate limit')) {
          console.log('   ⚠️  Rate limit hit, waiting 30 seconds...');
          await new Promise(resolve => setTimeout(resolve, 30000));
        } else {
          // For other errors, continue with next record
          console.log('   ⏭️  Skipping this record, continuing with next...');
        }
      }
    }

    console.log(`\n✅ Completed ${completed}/${records.length} records`);
    console.log('\n📊 Final status:');

    const finalCheck = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(openrouter_response) as with_openrouter,
        COUNT(openrouter_hermes_response) as with_hermes
      FROM llm_error_analysis
      WHERE id >= 154
    `);

    console.log(`   Total records (ID >= 154): ${finalCheck.rows[0].total}`);
    console.log(`   With OpenRouter: ${finalCheck.rows[0].with_openrouter}`);
    console.log(`   With Hermes: ${finalCheck.rows[0].with_hermes}`);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  } finally {
    await pool.end();
  }
}

completeOpenRouterData();
