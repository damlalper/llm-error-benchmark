import pool from '../../src/database/db.js';
import { ERROR_CATEGORIES } from '../../src/data/errorCategories.js';

async function findMissingErrors() {
  try {
    // Get all errors from database
    const result = await pool.query(`
      SELECT DISTINCT error_code
      FROM llm_error_analysis
    `);

    const createdErrorCodes = new Set(result.rows.map(r => r.error_code));

    console.log('\n📊 OLUŞTURULAN HATALAR:', createdErrorCodes.size);
    console.log('═'.repeat(60));

    // Check each category
    let totalErrors = 0;
    let createdErrors = 0;
    let missingErrors = 0;

    console.log('\n❌ EKSİK HATALAR (Kategori Bazında):\n');

    Object.keys(ERROR_CATEGORIES).forEach(categoryKey => {
      const category = ERROR_CATEGORIES[categoryKey];
      const categoryErrors = category.errors;

      totalErrors += categoryErrors.length;

      const missing = categoryErrors.filter(err => !createdErrorCodes.has(err.code));
      const created = categoryErrors.filter(err => createdErrorCodes.has(err.code));

      createdErrors += created.length;
      missingErrors += missing.length;

      console.log(`\n${categoryKey} (${category.name}):`);
      console.log(`  ✅ Oluşturulan: ${created.length}/${categoryErrors.length}`);
      console.log(`  ❌ Eksik: ${missing.length}`);

      if (missing.length > 0) {
        console.log(`  📋 Eksik hatalar:`);
        missing.forEach(err => {
          console.log(`     - ${err.code}: ${err.name}`);
        });
      }
    });

    console.log('\n═'.repeat(60));
    console.log('\n📈 GENEL ÖZET:');
    console.log(`  Toplam hata türü: ${totalErrors}`);
    console.log(`  ✅ Oluşturulan: ${createdErrors} (%${Math.round(createdErrors/totalErrors*100)})`);
    console.log(`  ❌ Eksik: ${missingErrors} (%${Math.round(missingErrors/totalErrors*100)})`);

    // Categories with least coverage
    console.log('\n⚠️  EN AZ KAPSANAN KATEGORİLER:\n');

    const coverage = Object.keys(ERROR_CATEGORIES).map(categoryKey => {
      const category = ERROR_CATEGORIES[categoryKey];
      const categoryErrors = category.errors;
      const created = categoryErrors.filter(err => createdErrorCodes.has(err.code));
      const percentage = Math.round(created.length / categoryErrors.length * 100);

      return {
        key: categoryKey,
        name: category.name,
        percentage,
        created: created.length,
        total: categoryErrors.length
      };
    });

    coverage
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 5)
      .forEach(cat => {
        console.log(`  ${cat.key.padEnd(15)} : %${cat.percentage.toString().padStart(3)} (${cat.created}/${cat.total})`);
      });

  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await pool.end();
  }
}

findMissingErrors();
