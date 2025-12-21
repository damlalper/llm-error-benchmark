# Hızlı Kurulum - Manuel Yöntem

PostgreSQL 14'e şifresiz girebiliyorsunuz, o zaman manuel oluşturalım.

## Adım 1: PostgreSQL 14'e Girin

### Yöntem A: pgAdmin ile
1. pgAdmin'i açın
2. Servers → PostgreSQL 14'e çift tıklayın
3. Query Tool açın (Tools → Query Tool)

### Yöntem B: Komut Satırı ile
```bash
psql -U postgres
```

## Adım 2: Aşağıdaki SQL Komutlarını Çalıştırın

SQL komutlarını tek tek veya hepsini birden kopyala-yapıştır yapın:

```sql
-- Veritabanını oluştur
CREATE DATABASE llm_error_db;

-- Yeni veritabanına bağlan
\c llm_error_db

-- Tabloyu oluştur
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
);

-- İndeksleri oluştur
CREATE INDEX idx_error_category ON llm_error_analysis(error_category);
CREATE INDEX idx_created_at ON llm_error_analysis(created_at);
CREATE INDEX idx_best_llm ON llm_error_analysis(best_llm);

-- Kısıtlamaları ekle
ALTER TABLE llm_error_analysis
ADD CONSTRAINT check_error_category
CHECK (error_category IN (
    'API_ERR', 'AUTO_ERR', 'BROWSER_ERR', 'CODE_ERR',
    'CONFIG_ERR', 'DATA_ERR', 'DB_ERR', 'ENV_ERR',
    'NET_ERR', 'PERF_ERR', 'SEC_ERR', 'VERSION_ERR'
));

ALTER TABLE llm_error_analysis
ADD CONSTRAINT check_best_llm
CHECK (best_llm IS NULL OR best_llm IN ('gemini', 'groq', 'mistral'));

-- Kontrol et
SELECT table_name FROM information_schema.tables WHERE table_name = 'llm_error_analysis';
```

Eğer son komut bir satır döndürürse başarılı demektir!

## Adım 3: .env Dosyasını Güncelle

PostgreSQL 14'e şifresiz girdiğiniz için .env dosyasında şifreyi boş bırakın veya şunu deneyin:

`.env` dosyasını açın ve şunu değiştirin:
```
DB_PASSWORD=
```

## Adım 4: Node.js Uygulamasını Test Et

```bash
node test-db.js
```

Eğer "✅ Database connection successful!" görürseniz tamamdır!

---

## Sorun Çıkarsa

Eğer `node test-db.js` şifre hatası verirse, .env dosyasında farklı değerler deneyin:

1. Boş şifre için:
```
DB_PASSWORD=
```

2. PostgreSQL 14 port'u kullanın (muhtemelen 5432'den farklıdır):
```
DB_PORT=5433
```

3. Veya PostgreSQL 14'ün port numarasını bulun:
```sql
SHOW port;
```
