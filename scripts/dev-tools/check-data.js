import pool from '../../src/database/db.js';

async function checkData() {
  try {
    // Count total records
    const countResult = await pool.query('SELECT COUNT(*) FROM llm_error_analysis');
    console.log('\n📊 Toplam Kayıt Sayısı:', countResult.rows[0].count);

    // Get latest 5 records
    const result = await pool.query(`
      SELECT
        id,
        developer_name,
        error_category,
        error_code,
        error_message,
        created_at,
        LENGTH(groq_response) as groq_len,
        LENGTH(mistral_response) as mistral_len,
        LENGTH(cohere_response) as cohere_len,
        LENGTH(openrouter_response) as openrouter_len,
        LENGTH(openrouter_hermes_response) as hermes_len,
        groq_response_time,
        mistral_response_time,
        cohere_response_time
      FROM llm_error_analysis
      ORDER BY id DESC
      LIMIT 5
    `);

    console.log('\n📝 Son 5 Kayıt:\n');
    result.rows.forEach(row => {
      console.log(`╔═══ ID: ${row.id} ═══════════════════════════════════════╗`);
      console.log(`║ Kategori: ${row.error_category}`);
      console.log(`║ Hata: ${row.error_code}`);
      console.log(`║ Mesaj: ${row.error_message}`);
      console.log(`║ Tarih: ${new Date(row.created_at).toLocaleString('tr-TR')}`);
      console.log(`╠═══ Cevap Uzunlukları (karakter) ═════════════════╣`);
      console.log(`║ Groq:            ${row.groq_len || 0} karakter`);
      console.log(`║ Mistral:         ${row.mistral_len || 0} karakter`);
      console.log(`║ Cohere:          ${row.cohere_len || 0} karakter`);
      console.log(`║ OpenRouter:      ${row.openrouter_len || 0} karakter`);
      console.log(`║ Hermes:          ${row.hermes_len || 0} karakter`);
      console.log(`╠═══ Yanıt Süreleri (ms) ══════════════════════════╣`);
      console.log(`║ Groq:            ${row.groq_response_time || 'N/A'} ms`);
      console.log(`║ Mistral:         ${row.mistral_response_time || 'N/A'} ms`);
      console.log(`║ Cohere:          ${row.cohere_response_time || 'N/A'} ms`);
      console.log(`╚══════════════════════════════════════════════════╝\n`);
    });

  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await pool.end();
  }
}

checkData();
