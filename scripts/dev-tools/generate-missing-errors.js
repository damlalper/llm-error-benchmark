import { ERROR_CATEGORIES } from '../../src/data/errorCategories.js';
import pool from '../../src/database/db.js';

// Eksik hataları listele
async function findMissingErrors() {
  const result = await pool.query(`
    SELECT DISTINCT error_code
    FROM llm_error_analysis
  `);

  const createdErrorCodes = new Set(result.rows.map(r => r.error_code));

  const missingByCategory = {};
  let totalMissing = 0;

  Object.keys(ERROR_CATEGORIES).forEach(categoryKey => {
    const category = ERROR_CATEGORIES[categoryKey];
    const missing = category.errors.filter(err => !createdErrorCodes.has(err.code));

    if (missing.length > 0) {
      missingByCategory[categoryKey] = missing;
      totalMissing += missing.length;
    }
  });

  return { missingByCategory, totalMissing };
}

async function main() {
  const { missingByCategory, totalMissing } = await findMissingErrors();

  console.log(`\n📊 TOPLAM EKSİK HATA: ${totalMissing}\n`);
  console.log('═'.repeat(70));

  // Priority order: En az kapsanan kategoriler önce
  const priorityOrder = ['NET_ERR', 'CODE_ERR', 'ENV_ERR', 'PERF_ERR', 'SEC_ERR'];

  console.log('\n🎯 EKSİK HATALARI OLUŞTURMAK İÇIN KOMUTLAR:\n');
  console.log('# Öncelikli kategoriler (en az kapsananlar):\n');

  priorityOrder.forEach(categoryKey => {
    if (missingByCategory[categoryKey]) {
      const missing = missingByCategory[categoryKey];
      console.log(`\n# ${categoryKey} - ${missing.length} eksik hata:`);
      missing.forEach(err => {
        console.log(`node src/index-6llm.js ${categoryKey} "Damla"  # ${err.code}: ${err.name}`);
      });
    }
  });

  console.log('\n\n# Diğer kategoriler:\n');

  Object.keys(missingByCategory).forEach(categoryKey => {
    if (!priorityOrder.includes(categoryKey)) {
      const missing = missingByCategory[categoryKey];
      console.log(`\n# ${categoryKey} - ${missing.length} eksik hata:`);
      missing.forEach(err => {
        console.log(`node src/index-6llm.js ${categoryKey} "Damla"  # ${err.code}: ${err.name}`);
      });
    }
  });

  console.log('\n\n═'.repeat(70));
  console.log('\n💡 TOPLU OLUŞTURMA ÖNERİSİ:\n');
  console.log('Her kategoriden eksik hataları döngüyle oluştur:');
  console.log('\nBatch script oluşturmak için: node create-batch-script.js\n');

  await pool.end();
}

main();
