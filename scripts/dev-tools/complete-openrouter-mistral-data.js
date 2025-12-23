import pool from '../../src/database/db.js';
import { analyzeWithOpenRouterMistral } from '../../src/services/openrouter-mistral.js';
import dotenv from 'dotenv';

dotenv.config();

async function completeOpenRouterMistralData() {
  try {
    console.log('🔧 Completing OpenRouter Mistral responses...\n');

    // Get records without OpenRouter Mistral responses
    const result = await pool.query(`
      SELECT id, error_code, error_message, prompt_sent
      FROM llm_error_analysis
      WHERE openrouter_mistral_response IS NULL
      ORDER BY id
    `);

    const records = result.rows;
    console.log(`📊 Found ${records.length} records without OpenRouter Mistral responses\n`);

    if (records.length === 0) {
      console.log('✅ All records already have OpenRouter Mistral responses!');
      await pool.end();
      return;
    }

    let completed = 0;
    let failed = 0;
    let consecutiveErrors = 0;
    const delayBetweenRequests = 3000; // 3 seconds between requests

    for (const record of records) {
      console.log(`\n📝 Processing ID: ${record.id} - ${record.error_code}`);

      try {
        const start = Date.now();
        const response = await analyzeWithOpenRouterMistral(record.prompt_sent);
        const responseTime = Date.now() - start;

        await pool.query(`
          UPDATE llm_error_analysis
          SET openrouter_mistral_response = $1,
              openrouter_mistral_response_time = $2
          WHERE id = $3
        `, [response, responseTime, record.id]);

        completed++;
        consecutiveErrors = 0;
        console.log(`   ✅ Completed (${responseTime}ms) - ${completed}/${records.length}`);

        // Wait before next request
        if (completed < records.length) {
          console.log(`   ⏳ Waiting ${delayBetweenRequests/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
        }

      } catch (error) {
        failed++;
        consecutiveErrors++;
        console.error(`   ❌ Failed: ${error.message}`);

        // If rate limit or too many consecutive errors, stop
        if (error.message.includes('429') || error.message.includes('rate limit')) {
          console.log('\n⚠️  Rate limit hit!');

          if (consecutiveErrors >= 3) {
            console.log('⚠️  Too many consecutive rate limit errors, stopping...');
            break;
          }

          console.log('   Waiting 30 seconds before retry...');
          await new Promise(resolve => setTimeout(resolve, 30000));
          consecutiveErrors = 0; // Reset after long wait
        } else if (consecutiveErrors >= 10) {
          console.log('\n⚠️  Too many consecutive errors, stopping...');
          break;
        }
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Completed: ${completed}/${records.length}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Remaining: ${records.length - completed - failed}\n`);

    // Show current statistics
    const stats = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(openrouter_mistral_response) as with_mistral,
        COUNT(*) - COUNT(openrouter_mistral_response) as without_mistral
      FROM llm_error_analysis
    `);

    console.log('📋 Database statistics:');
    console.log(`   Total records: ${stats.rows[0].total}`);
    console.log(`   With Mistral: ${stats.rows[0].with_mistral}`);
    console.log(`   Without Mistral: ${stats.rows[0].without_mistral}\n`);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

completeOpenRouterMistralData();
