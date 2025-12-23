import pg from 'pg';
const { Client } = pg;

async function createDatabase() {
  console.log('\n🔄 PostgreSQL\'e bağlanılıyor...\n');

  // First connect to postgres default database
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '0258520',
  });

  try {
    await client.connect();
    console.log('✅ PostgreSQL\'e bağlandı!\n');

    // Check if database exists
    const checkDb = await client.query(
      "SELECT 1 FROM pg_database WHERE datname='llm_error_db'"
    );

    if (checkDb.rows.length > 0) {
      console.log('⚠️  Veritabanı zaten mevcut, silip yeniden oluşturuyorum...\n');

      // Terminate existing connections
      await client.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = 'llm_error_db'
        AND pid <> pg_backend_pid()
      `);

      await client.query('DROP DATABASE llm_error_db');
      console.log('✅ Eski veritabanı silindi.\n');
    }

    // Create database
    console.log('🔨 llm_error_db veritabanı oluşturuluyor...\n');
    await client.query('CREATE DATABASE llm_error_db');
    console.log('✅ Veritabanı oluşturuldu!\n');

    await client.end();

    // Now connect to new database and create table
    console.log('📋 Tablolar oluşturuluyor...\n');

    const dbClient = new Client({
      host: 'localhost',
      port: 5432,
      database: 'llm_error_db',
      user: 'postgres',
      password: '0258520',
    });

    await dbClient.connect();

    // Create table
    await dbClient.query(`
      CREATE TABLE llm_error_analysis (
        id SERIAL PRIMARY KEY,
        developer_name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        error_category TEXT NOT NULL,
        error_code TEXT NOT NULL,
        error_message TEXT NOT NULL,
        prompt_sent TEXT NOT NULL,
        gemini_response TEXT,
        groq_response TEXT,
        mistral_response TEXT,
        best_llm TEXT,
        notes TEXT
      )
    `);
    console.log('✅ Tablo "llm_error_analysis" oluşturuldu.');

    // Create indexes
    await dbClient.query('CREATE INDEX idx_error_category ON llm_error_analysis(error_category)');
    await dbClient.query('CREATE INDEX idx_created_at ON llm_error_analysis(created_at)');
    await dbClient.query('CREATE INDEX idx_best_llm ON llm_error_analysis(best_llm)');
    console.log('✅ İndeksler oluşturuldu.');

    // Add constraints
    await dbClient.query(`
      ALTER TABLE llm_error_analysis
      ADD CONSTRAINT check_error_category
      CHECK (error_category IN (
        'API_ERR', 'AUTO_ERR', 'BROWSER_ERR', 'CODE_ERR',
        'CONFIG_ERR', 'DATA_ERR', 'DB_ERR', 'ENV_ERR',
        'NET_ERR', 'PERF_ERR', 'SEC_ERR', 'VERSION_ERR'
      ))
    `);

    await dbClient.query(`
      ALTER TABLE llm_error_analysis
      ADD CONSTRAINT check_best_llm
      CHECK (best_llm IS NULL OR best_llm IN ('gemini', 'groq', 'mistral'))
    `);
    console.log('✅ Kısıtlamalar (constraints) eklendi.\n');

    await dbClient.end();

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║              ✨ KURULUM TAMAMLANDI! ✨                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log('📊 Veritabanı: llm_error_db');
    console.log('📋 Tablo: llm_error_analysis');
    console.log('✅ .env dosyası hazır\n');
    console.log('Şimdi test edin: node test-db.js\n');

  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.error('\nDetay:', error);
  }
}

createDatabase();
