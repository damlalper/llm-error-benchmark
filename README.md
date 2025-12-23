# LLM Error Analysis Platform - 6 LLMs Edition 🚀

Yazılım geliştirme ve test süreçlerinde karşılaşılan farklı hata türlerinin (API, otomasyon, kodlama, veritabanı vb.) **6 farklı büyük dil modeli (LLM)** tarafından nasıl analiz edildiğini karşılaştırmalı olarak inceleyen platform.

## ✨ Özellikler

- **6 Ücretsiz LLM** ile gerçek zamanlı analiz
- **12 Farklı Hata Kategorisi** (API, Otomasyon, Tarayıcı, Kod, Yapılandırma, Veri, Veritabanı, Çevre, Ağ, Performans, Güvenlik, Sürüm)
- **PostgreSQL** veritabanında veri saklama
- **Yanıt Süresi Ölçümü** - Her LLM'in performansını karşılaştırma
- **Batch Analysis** - Toplu hata analizi
- Detaylı istatistik ve raporlama

## 🤖 Kullanılan LLM'ler (Hepsi Ücretsiz!)

| LLM | Model | Öne Çıkan Özellik | Ortalama Süre |
|-----|-------|-------------------|---------------|
| **Groq** | Llama 3.3 70B | Ultra hızlı yanıt 🚀 | ~5 saniye |
| **Mistral** | Mistral Latest | Kod uzmanı 💻 | ~6 saniye |
| **Cohere** | Command Nightly | Mantıksal akıl yürütme 🧠 | ~18 saniye |
| **OpenRouter** | Llama 3.2 3B | Hafif ve hızlı ⚡ | ~14 saniye |
| **OpenRouter** | Mistral 7B | Dengeli performans ⚖️ | ~15 saniye |
| **OpenRouter** | Hermes 405B | En güçlü model 💪 | ~96 saniye |

## 📋 Teknolojiler

- **Node.js** (ES6 Modules) - Runtime environment
- **PostgreSQL** - Veritabanı
- **Groq API** - Ultra hızlı Llama 3.3 70B
- **Mistral API** - Kod odaklı LLM
- **Cohere API** - Reasoning uzmanı
- **OpenRouter API** - Çoklu model erişimi (3 farklı model)

## 🚀 Kurulum

### 1. Gereksinimleri Yükleyin

- Node.js (v18 veya üzeri)
- PostgreSQL (v14 veya üzeri)

### 2. Projeyi Klonlayın

```bash
git clone <repo-url>
cd llm-error-db
```

### 3. Bağımlılıkları Yükleyin

```bash
npm install
```

### 4. Ortam Değişkenlerini Ayarlayın

`.env.example` dosyasını `.env` olarak kopyalayın:

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:

```env
# LLM API Keys (Hepsi ücretsiz!)
GROQ_API_KEY=your_groq_api_key
MISTRAL_API_KEY=your_mistral_api_key
COHERE_API_KEY=your_cohere_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=llm_error_db
DB_USER=postgres
DB_PASSWORD=your_password

# Application
DEVELOPER_NAME=Your Name
```

#### 🔑 API Key Alma Rehberi

**Groq API Key** (En hızlı!):
1. https://console.groq.com/
2. Ücretsiz hesap oluşturun
3. API Keys → Create API Key

**Mistral API Key**:
1. https://console.mistral.ai/
2. Hesap oluşturun
3. API Keys → Generate

**Cohere API Key**:
1. https://dashboard.cohere.com/
2. Sign up (ücretsiz)
3. API Keys → Create Key

**OpenRouter API Key** (3 model için):
1. https://openrouter.ai/
2. Sign up
3. Keys → Create Key

### 5. PostgreSQL Veritabanını Oluşturun

#### Otomatik Kurulum (Önerilen):
```bash
node scripts/setup/create-db-now.js
```

#### Manuel Kurulum:
```bash
psql -U postgres
CREATE DATABASE llm_error_db;
\q
```

### 6. Veritabanı Migration'ı Çalıştırın

```bash
node scripts/setup/upgrade-db-to-6.js
```

### 7. Test Edin

```bash
node scripts/setup/test-db.js
```

## 💻 Kullanım

### 6 LLM ile Tek Hata Analizi

```bash
node src/index-6llm.js <KATEGORI> [DEVELOPER_NAME]

# Örnekler:
node src/index-6llm.js API_ERR
node src/index-6llm.js CODE_ERR "Alice"
node src/index-6llm.js SEC_ERR "Bob"
```

### Toplu Analiz (Batch)

```bash
node src/index-6llm.js BATCH [ADET]

# Örnek: 5 rastgele hata analizi
node src/index-6llm.js BATCH 5

# 10 hata analizi
node src/index-6llm.js BATCH 10
```

### 📊 Hata Kategorileri

| Kod | Kategori | Örnekler |
|-----|----------|----------|
| `API_ERR` | API Hataları | 400, 401, 403, 404, 500, 502, 503 |
| `AUTO_ERR` | Otomasyon Hataları | NoSuchElement, Timeout, StaleElement |
| `BROWSER_ERR` | Tarayıcı Hataları | BrowserCrash, TabCrashed |
| `CODE_ERR` | Kodlama Hataları | NullPointer, ArrayIndexOutOfBounds |
| `CONFIG_ERR` | Yapılandırma | MissingConfig, InvalidEnvironment |
| `DATA_ERR` | Veri Hataları | DataTypeMismatch, MandatoryFieldEmpty |
| `DB_ERR` | Veritabanı | SQLSyntax, ConnectionRefused, Deadlock |
| `ENV_ERR` | Çevresel Hatalar | ServerDown, DNSResolution, SSLHandshake |
| `NET_ERR` | Ağ Hataları | ConnectionReset, SocketTimeout |
| `PERF_ERR` | Performans | SlowResponse, HighMemoryUsage, CPUOverload |
| `SEC_ERR` | Güvenlik | AuthenticationFailure, TokenExpired |
| `VERSION_ERR` | Sürüm Uyumsuzluğu | IncompatibleDriver, UnsupportedBrowser |

## 📈 Analiz ve Raporlama

### Tüm Analizleri Listele

```bash
node src/analyze.js list
```

### Detaylı Analiz Görüntüle (6 LLM karşılaştırması)

```bash
node src/analyze.js detail <ID>

# Örnek:
node src/analyze.js detail 1
```

### LLM Yanıtlarını Karşılaştır

```bash
node src/analyze.js compare <ID>
```

### İstatistikleri Görüntüle

```bash
node src/analyze.js stats
```

### Kategoriye Göre Filtrele

```bash
node src/analyze.js category API_ERR
```

## 📁 Proje Yapısı

```
llm-error-db/
├── src/
│   ├── data/
│   │   └── errorCategories.js        # 12 kategori, 70+ hata
│   ├── database/
│   │   ├── db.js                     # PostgreSQL bağlantısı
│   │   ├── migrate.js                # Migration script
│   │   ├── repository.js             # CRUD operasyonları
│   │   ├── schema.sql                # İlk şema
│   │   ├── upgrade-to-5-llm.sql      # 5 LLM upgrade
│   │   └── upgrade-to-6-llm.sql      # 6 LLM upgrade
│   ├── services/
│   │   ├── groq.js                   # Groq (Llama 70B)
│   │   ├── mistral.js                # Mistral API
│   │   ├── cohere.js                 # Cohere Command
│   │   ├── openrouter.js             # OpenRouter Llama 3B
│   │   ├── openrouter-mistral.js     # OpenRouter Mistral 7B
│   │   └── openrouter2.js            # OpenRouter Hermes 405B
│   ├── analyze.js                    # Analiz ve raporlama
│   ├── index.js                      # 3 LLM versiyonu (eski)
│   ├── index-5llm.js                 # 5 LLM versiyonu
│   └── index-6llm.js                 # 6 LLM versiyonu ⭐
├── evaluation/                       # 🆕 Akademik LLM Değerlendirme Sistemi
│   ├── main.py                       # Ana değerlendirme script
│   ├── evaluator.py                  # Değerlendirme motoru
│   ├── scorer.py                     # Puanlama algoritması
│   ├── feature_extractor.py          # NLP özellik çıkarımı
│   ├── config.py                     # Konfigürasyon
│   ├── requirements.txt              # Python bağımlılıkları
│   ├── .env.example                  # Python env şablonu
│   └── README.md                     # Değerlendirme dokümantasyonu
├── queries/                          # 🆕 SQL Analiz Sorguları
│   └── analysis_queries.sql          # 8 farklı analiz sorgusu
├── scripts/
│   ├── setup/                        # Kurulum scriptleri
│   │   ├── create-db-now.js          # Otomatik DB kurulum
│   │   ├── setup-db.js               # Manuel DB kurulum
│   │   ├── upgrade-db.js             # DB upgrade
│   │   └── upgrade-db-to-6.js        # 6 LLM upgrade
│   └── dev-tools/                    # Geliştirici araçları
│       ├── check-schema.js           # Şema doğrulama
│       ├── export-data.js            # Veri export
│       ├── import-csv-robust.js      # Güvenli CSV import
│       ├── import-merged-data-smart.js # Akıllı veri birleştirme
│       └── ...                       # Diğer araçlar
├── .env.example                      # Ortam değişkenleri şablonu
├── .gitignore
├── package.json
├── prd.md                            # Proje gereksinimleri
├── hata-kategorileri.md              # Hata listesi
├── MERGE_DATABASES.md                # Veritabanı birleştirme rehberi
└── README.md
```

## 🗄️ Veritabanı Şeması

```sql
CREATE TABLE llm_error_analysis (
    id SERIAL PRIMARY KEY,
    developer_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    error_category TEXT NOT NULL,
    error_code TEXT NOT NULL,
    error_message TEXT NOT NULL,
    prompt_sent TEXT NOT NULL,

    -- 6 LLM Responses
    groq_response TEXT,
    mistral_response TEXT,
    cohere_response TEXT,
    openrouter_response TEXT,
    openrouter_hermes_response TEXT,

    -- Response Times (milliseconds)
    groq_response_time INTEGER,
    mistral_response_time INTEGER,
    cohere_response_time INTEGER,
    openrouter_response_time INTEGER,
    openrouter_hermes_response_time INTEGER,

    best_llm TEXT,
    notes TEXT
);
```

## 🎯 Örnek Kullanım Senaryosu

### 1. Hata Analizi Başlat (6 LLM)
```bash
node src/index-6llm.js CODE_ERR "Alice"
```

Çıktı:
```
╔════════════════════════════════════════════════════════════╗
║  🚀 6-LLM Error Analysis: CODE_ERR                         ║
╚════════════════════════════════════════════════════════════╝

🔍 Error: NullPointerException
📝 Message: Null referansa erişim denemesi

⏱️  Response Times:
   Groq (Llama 70B):        4.5s 🚀
   Mistral (API):           6.2s
   Cohere (Nightly):        18.3s
   OpenRouter (Llama 3B):   14.8s
   OpenRouter (Mistral 7B): 15.1s
   OpenRouter (Hermes 405B):92.4s 💪

💾 Analysis saved with ID: 1
```

### 2. Sonuçları Görüntüle
```bash
node src/analyze.js list
```

### 3. Detaylı Karşılaştırma
```bash
node src/analyze.js detail 1
```

### 4. Batch Analysis (10 hata)
```bash
node src/index-6llm.js BATCH 10
```

### 5. İstatistikleri İncele
```bash
node src/analyze.js stats
```

## 📊 NPM Scripts

```bash
npm start          # Ana uygulamayı çalıştır (3 LLM - eski)
npm run db:migrate # İlk migration
npm run analyze    # Analiz tool
```

## 🎓 Proje Hakkında

Bu proje **17 Aralık dersi haftalık teslimi** kapsamında geliştirilmiştir.

### Hedefler:
- ✅ Farklı LLM'lerin hata analiz yeteneklerini karşılaştırma
- ✅ Ücretsiz LLM API'lerini etkin kullanma
- ✅ Performans ve kalite metriklerini ölçme
- ✅ Gerçek dünya yazılım hatalarını analiz etme

### Başarılar:
- 🏆 6 farklı ücretsiz LLM entegrasyonu
- 🏆 12 kategori, 70+ farklı hata tipi
- 🏆 Otomatik yanıt süresi ölçümü
- 🏆 PostgreSQL ile veri persistence
- 🏆 Batch processing desteği
- 🏆 Akademik değerlendirme algoritması (6 kriter, ağırlıklı puanlama)
- 🏆 SQL analiz sorguları koleksiyonu
- 🏆 Veritabanı birleştirme araçları

## 🔬 Model Test Araçları

```bash
# Tüm modelleri test et
node test-models.js

# Sadece OpenRouter modellerini test et
node test-all-free-models.js

# Veritabanı bağlantısını test et
node test-db.js
```

## 🎓 Akademik LLM Değerlendirme Sistemi

Proje, LLM'lerin performansını **akademik standartlarda** ölçen bir değerlendirme sistemi içerir.

### Özellikler:
- **6 Ağırlıklı Kriter**: Teknik Doğruluk (25%), Çözüm Kalitesi (25%), Netlik (20%), Kısalık (10%), Hız (10%), Güvenilirlik (10%)
- **NLP Tabanlı Analiz**: Bag-of-words özellik çıkarımı
- **Deterministik Puanlama**: Açıklanabilir ve tekrarlanabilir sonuçlar
- **PostgreSQL Entegrasyonu**: Otomatik veri analizi

### Kurulum:

```bash
cd evaluation
pip install -r requirements.txt
cp .env.example .env
# .env dosyasını düzenleyin (DB bilgileri)
```

### Çalıştırma:

```bash
python evaluation/main.py
```

### Sonuçlar:

```
🏆 BEST LLM: COHERE (84.26/100)
🥈 RUNNER-UP: MISTRAL (83.77/100)
🥉 THIRD: GROQ (68.86/100)
💔 WORST: OPENROUTER_HERMES (14.68/100)
```

Detaylı metodoloji için: [evaluation/README.md](evaluation/README.md)

## 📊 SQL Analiz Sorguları

Projede hazır SQL analiz sorguları bulunur: [queries/analysis_queries.sql](queries/analysis_queries.sql)

### Örnek Sorgular:

**1. En İyi ve En Kötü LLM'leri Görüntüle:**
```sql
SELECT id, error_category, error_message AS description,
       best_llm, worst_llm
FROM llm_error_analysis
ORDER BY id;
```

**2. LLM Performans Özeti:**
```sql
-- Her LLM'in ortalama response time ve seçilme sayısı
-- Sorgu dosyasında hazır!
```

**3. Kategoriye Göre En İyi LLM:**
```sql
-- Hangi LLM hangi hata kategorisinde daha başarılı?
-- Sorgu dosyasında hazır!
```

**4. Detaylı Karşılaştırma:**
```sql
-- Tüm LLM'lerin response time'larını yan yana göster
-- Sorgu dosyasında hazır!
```

Tüm sorgular pgAdmin'de kullanıma hazır şekilde [queries/analysis_queries.sql](queries/analysis_queries.sql) dosyasında!

## 🔧 Geliştirici Araçları

### Veritabanı Yönetimi:
```bash
# Şema doğrulama
node scripts/dev-tools/check-schema.js

# Veri export (CSV)
node scripts/dev-tools/export-data.js

# Güvenli CSV import
node scripts/dev-tools/import-csv-robust.js
```

### Veri Birleştirme:
```bash
# Farklı geliştiricilerin verilerini birleştir
node scripts/dev-tools/import-merged-data-smart.js

# Detaylı rehber:
cat MERGE_DATABASES.md
```

## 🚧 Gelecek Geliştirmeler

- [ ] Web Dashboard (React)
- [x] Otomatik skorlama sistemi ✅ (Akademik değerlendirme algoritması tamamlandı)
- [ ] Excel/PDF rapor çıktısı
- [ ] REST API (FastAPI/Express)
- [ ] Gerçek zamanlı WebSocket desteği
- [ ] Kullanıcı yönetimi
- [x] SQL analiz sorguları ✅ (8 farklı sorgu hazır)
- [x] Veri birleştirme araçları ✅ (CSV import/export/merge)

## 📄 Lisans

MIT

## 📞 İletişim

Sorularınız için issue açabilirsiniz.

---

**Not:** Bu platform akademik ve eğitim amaçlıdır. LLM cevaplarının doğruluğu garanti edilmez, sonuçlar karşılaştırmalı analiz için kullanılmalıdır. Tüm LLM'ler ücretsiz tier kullanmaktadır ve rate limit'lere tabidir.

