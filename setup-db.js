import pg from 'pg';
import readline from 'readline';

const { Client } = pg;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupDatabase() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         PostgreSQL Database Setup                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Get PostgreSQL credentials
    const dbUser = await question('PostgreSQL kullanıcı adı (varsayılan: postgres): ') || 'postgres';
    const dbPassword = await question('PostgreSQL şifresi: ');
    const dbHost = await question('PostgreSQL host (varsayılan: localhost): ') || 'localhost';
    const dbPort = await question('PostgreSQL port (varsayılan: 5432): ') || '5432';

    console.log('\n🔄 PostgreSQL\'e bağlanılıyor...\n');

    // Connect to PostgreSQL (to postgres database first)
    const client = new Client({
      host: dbHost,
      port: parseInt(dbPort),
      database: 'postgres', // Connect to default database first
      user: dbUser,
      password: dbPassword,
    });

    await client.connect();
    console.log('✅ PostgreSQL bağlantısı başarılı!\n');

    // Check if database already exists
    const checkDb = await client.query(
      "SELECT 1 FROM pg_database WHERE datname='llm_error_db'"
    );

    if (checkDb.rows.length > 0) {
      console.log('⚠️  "llm_error_db" veritabanı zaten mevcut.');
      const recreate = await question('Yeniden oluşturmak ister misiniz? (y/n): ');

      if (recreate.toLowerCase() === 'y') {
        console.log('🗑️  Eski veritabanı siliniyor...');
        await client.query('DROP DATABASE llm_error_db');
        console.log('✅ Eski veritabanı silindi.');
      } else {
        console.log('📊 Mevcut veritabanı kullanılacak.');
        await client.end();
        rl.close();
        return { dbUser, dbPassword, dbHost, dbPort };
      }
    }

    // Create database
    console.log('🔨 "llm_error_db" veritabanı oluşturuluyor...');
    await client.query('CREATE DATABASE llm_error_db');
    console.log('✅ Veritabanı başarıyla oluşturuldu!\n');

    await client.end();

    // Now connect to the new database to create tables
    console.log('📋 Tablolar oluşturuluyor...\n');

    const newClient = new Client({
      host: dbHost,
      port: parseInt(dbPort),
      database: 'llm_error_db',
      user: dbUser,
      password: dbPassword,
    });

    await newClient.connect();

    // Create table
    await newClient.query(`
      CREATE TABLE IF NOT EXISTS llm_error_analysis (
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
    await newClient.query('CREATE INDEX IF NOT EXISTS idx_error_category ON llm_error_analysis(error_category)');
    await newClient.query('CREATE INDEX IF NOT EXISTS idx_created_at ON llm_error_analysis(created_at)');
    await newClient.query('CREATE INDEX IF NOT EXISTS idx_best_llm ON llm_error_analysis(best_llm)');

    console.log('✅ İndeksler oluşturuldu.');

    // Add constraints
    await newClient.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'check_error_category'
        ) THEN
          ALTER TABLE llm_error_analysis
          ADD CONSTRAINT check_error_category
          CHECK (error_category IN (
            'API_ERR', 'AUTO_ERR', 'BROWSER_ERR', 'CODE_ERR',
            'CONFIG_ERR', 'DATA_ERR', 'DB_ERR', 'ENV_ERR',
            'NET_ERR', 'PERF_ERR', 'SEC_ERR', 'VERSION_ERR'
          ));
        END IF;
      END $$;
    `);

    await newClient.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'check_best_llm'
        ) THEN
          ALTER TABLE llm_error_analysis
          ADD CONSTRAINT check_best_llm
          CHECK (best_llm IS NULL OR best_llm IN ('gemini', 'groq', 'mistral'));
        END IF;
      END $$;
    `);

    console.log('✅ Kısıtlamalar (constraints) eklendi.\n');

    await newClient.end();

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║              ✨ Kurulum Tamamlandı! ✨                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('📝 Şimdi .env dosyanızı oluşturun:\n');
    console.log('DB_HOST=' + dbHost);
    console.log('DB_PORT=' + dbPort);
    console.log('DB_NAME=llm_error_db');
    console.log('DB_USER=' + dbUser);
    console.log('DB_PASSWORD=' + dbPassword);
    console.log('\nDEVELOPER_NAME=İsminiz');
    console.log('\nGEMINI_API_KEY=');
    console.log('GROQ_API_KEY=');
    console.log('MISTRAL_API_KEY=');

    rl.close();
    return { dbUser, dbPassword, dbHost, dbPort };

  } catch (error) {
    console.error('\n❌ Hata oluştu:', error.message);
    console.error('\n💡 Kontrol edin:');
    console.error('  1. PostgreSQL servisi çalışıyor mu?');
    console.error('  2. Kullanıcı adı ve şifre doğru mu?');
    console.error('  3. PostgreSQL kurulu mu? (psql --version)\n');
    rl.close();
    process.exit(1);
  }
}

setupDatabase();
