import {
  getAllAnalyses,
  getAnalysisById,
  getAnalysesByCategory,
  getStatsByBestLlm,
  getStatsByCategory,
  updateBestLlm
} from './database/repository.js';
import pool from './database/db.js';

async function displayAllAnalyses() {
  try {
    const analyses = await getAllAnalyses();

    if (analyses.length === 0) {
      console.log('\n📭 No analyses found in database.\n');
      return;
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║               All Error Analyses                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    analyses.forEach(analysis => {
      console.log(`ID: ${analysis.id}`);
      console.log(`Developer: ${analysis.developer_name}`);
      console.log(`Date: ${new Date(analysis.created_at).toLocaleString()}`);
      console.log(`Category: ${analysis.error_category}`);
      console.log(`Error: ${analysis.error_code}`);
      console.log(`Best LLM: ${analysis.best_llm || 'Not evaluated yet'}`);
      console.log('─'.repeat(60));
    });

    console.log(`\nTotal: ${analyses.length} analyses\n`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function displayAnalysisDetail(id) {
  try {
    const analysis = await getAnalysisById(id);

    if (!analysis) {
      console.log(`\n❌ No analysis found with ID: ${id}\n`);
      return;
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║             Detailed Error Analysis                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log(`📋 ID: ${analysis.id}`);
    console.log(`👤 Developer: ${analysis.developer_name}`);
    console.log(`📅 Date: ${new Date(analysis.created_at).toLocaleString()}`);
    console.log(`🏷️  Category: ${analysis.error_category}`);
    console.log(`⚠️  Error Code: ${analysis.error_code}`);
    console.log(`💬 Error Message: ${analysis.error_message}\n`);

    console.log('─'.repeat(60));
    console.log('📤 PROMPT SENT TO LLMs:');
    console.log('─'.repeat(60));
    console.log(analysis.prompt_sent);
    console.log('\n');

    console.log('─'.repeat(60));
    console.log('🤖 GEMINI RESPONSE:');
    console.log('─'.repeat(60));
    console.log(analysis.gemini_response);
    console.log('\n');

    console.log('─'.repeat(60));
    console.log('⚡ GROQ RESPONSE:');
    console.log('─'.repeat(60));
    console.log(analysis.groq_response);
    console.log('\n');

    console.log('─'.repeat(60));
    console.log('🌟 MISTRAL RESPONSE:');
    console.log('─'.repeat(60));
    console.log(analysis.mistral_response);
    console.log('\n');

    console.log('─'.repeat(60));
    console.log(`🏆 Best LLM: ${analysis.best_llm || 'Not evaluated yet'}`);
    if (analysis.notes) {
      console.log(`📝 Notes: ${analysis.notes}`);
    }
    console.log('─'.repeat(60));
    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function displayStatistics() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                 Statistics                                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Stats by category
    const categoryStats = await getStatsByCategory();
    console.log('📊 Analyses by Category:');
    console.log('─'.repeat(60));
    categoryStats.forEach(stat => {
      console.log(`${stat.error_category.padEnd(20)} : ${stat.count} analyses`);
    });

    // Stats by best LLM
    const llmStats = await getStatsByBestLlm();
    if (llmStats.length > 0) {
      console.log('\n🏆 Best LLM Performance:');
      console.log('─'.repeat(60));
      llmStats.forEach(stat => {
        console.log(`${stat.best_llm.padEnd(20)} : ${stat.count} wins`);
      });
    } else {
      console.log('\n⚠️  No LLM evaluations yet. Use updateBestLlm() to mark winners.');
    }

    console.log('\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function compareLLMResponses(id) {
  try {
    const analysis = await getAnalysisById(id);

    if (!analysis) {
      console.log(`\n❌ No analysis found with ID: ${id}\n`);
      return;
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║            LLM Response Comparison                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log(`Error: ${analysis.error_code} (${analysis.error_category})\n`);

    const responses = {
      'Gemini': analysis.gemini_response,
      'Groq': analysis.groq_response,
      'Mistral': analysis.mistral_response
    };

    for (const [llm, response] of Object.entries(responses)) {
      console.log('═'.repeat(60));
      console.log(`${llm.toUpperCase()} (${response.length} characters)`);
      console.log('═'.repeat(60));
      console.log(response.substring(0, 500) + (response.length > 500 ? '...' : ''));
      console.log('\n');
    }

    console.log('─'.repeat(60));
    console.log('💡 To mark the best LLM, run:');
    console.log(`   updateBestLlm(${id}, 'gemini|groq|mistral')`);
    console.log('─'.repeat(60));
    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Main execution
const args = process.argv.slice(2);
const command = args[0];

(async () => {
  try {
    switch (command) {
      case 'list':
        await displayAllAnalyses();
        break;

      case 'detail':
        const id = parseInt(args[1]);
        if (!id) {
          console.log('\n❌ Please provide an ID: node src/analyze.js detail <ID>\n');
        } else {
          await displayAnalysisDetail(id);
        }
        break;

      case 'stats':
        await displayStatistics();
        break;

      case 'compare':
        const compareId = parseInt(args[1]);
        if (!compareId) {
          console.log('\n❌ Please provide an ID: node src/analyze.js compare <ID>\n');
        } else {
          await compareLLMResponses(compareId);
        }
        break;

      case 'category':
        const category = args[1];
        if (!category) {
          console.log('\n❌ Please provide a category: node src/analyze.js category <CATEGORY>\n');
        } else {
          const analyses = await getAnalysesByCategory(category.toUpperCase());
          console.log(`\n📊 Found ${analyses.length} analyses for ${category.toUpperCase()}\n`);
          analyses.forEach(a => {
            console.log(`ID: ${a.id} | ${a.error_code} | ${new Date(a.created_at).toLocaleDateString()}`);
          });
          console.log('\n');
        }
        break;

      default:
        console.log(`
╔════════════════════════════════════════════════════════════╗
║          LLM Error Analysis - Viewer                       ║
╚════════════════════════════════════════════════════════════╝

Commands:
  list              - List all analyses
  detail <ID>       - Show detailed analysis with all LLM responses
  compare <ID>      - Compare LLM responses side-by-side
  stats             - Show statistics
  category <CAT>    - Show analyses by category

Examples:
  node src/analyze.js list
  node src/analyze.js detail 1
  node src/analyze.js compare 1
  node src/analyze.js stats
  node src/analyze.js category API_ERR
        `);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
})();

export { displayAllAnalyses, displayAnalysisDetail, displayStatistics, compareLLMResponses };
