import pool from './src/database/db.js';

async function analyzeData() {
  try {
    // Total count
    const countResult = await pool.query('SELECT COUNT(*) FROM llm_error_analysis');
    console.log('\n📊 TOPLAM VERİ SAYISI:', countResult.rows[0].count);
    console.log('═'.repeat(60));

    // Group by category
    const categoryResult = await pool.query(`
      SELECT
        error_category,
        COUNT(*) as count,
        array_agg(DISTINCT error_code) as error_codes
      FROM llm_error_analysis
      GROUP BY error_category
      ORDER BY error_category
    `);

    console.log('\n📁 KATEGORİLERE GÖRE DAĞILIM:\n');
    categoryResult.rows.forEach(row => {
      console.log(`${row.error_category.padEnd(15)} : ${row.count} veri`);
      console.log(`   Hatalar: ${row.error_codes.join(', ')}`);
      console.log('');
    });

    // All possible categories
    const allCategories = [
      'API_ERR', 'AUTO_ERR', 'BROWSER_ERR', 'CODE_ERR',
      'CONFIG_ERR', 'DATA_ERR', 'DB_ERR', 'ENV_ERR',
      'NET_ERR', 'PERF_ERR', 'SEC_ERR', 'VERSION_ERR'
    ];

    const existingCategories = categoryResult.rows.map(r => r.error_category);
    const missingCategories = allCategories.filter(cat => !existingCategories.includes(cat));

    console.log('═'.repeat(60));
    console.log('\n❌ HENÜZ OLUŞTURULMAYAN KATEGORİLER:\n');
    if (missingCategories.length === 0) {
      console.log('   ✅ Tüm kategoriler en az 1 kez oluşturulmuş!');
    } else {
      missingCategories.forEach(cat => {
        console.log(`   - ${cat}`);
      });
    }

    // Show all unique errors created
    const errorResult = await pool.query(`
      SELECT DISTINCT error_category, error_code, error_message
      FROM llm_error_analysis
      ORDER BY error_category, error_code
    `);

    console.log('\n═'.repeat(60));
    console.log('\n📝 OLUŞTURULAN BENZERSIZ HATALAR (' + errorResult.rows.length + ' adet):\n');

    let currentCategory = '';
    errorResult.rows.forEach(row => {
      if (row.error_category !== currentCategory) {
        currentCategory = row.error_category;
        console.log(`\n${currentCategory}:`);
      }
      console.log(`   - ${row.error_code}: ${row.error_message}`);
    });

  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await pool.end();
  }
}

analyzeData();
