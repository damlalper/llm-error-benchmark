# Veritabanlarını Birleştirme Rehberi 🔄

İki farklı PostgreSQL veritabanındaki verileri tek bir veritabanında birleştirmek için adım adım rehber.

## 📋 Senaryo

- **Alice**: Kendi bilgisayarında 150 veri üretmiş (SEED=0)
- **Bob**: Kendi bilgisayarında 150 veri üretmiş (SEED=1000)
- **Hedef**: Her iki veriyi tek bir veritabanında birleştirip evaluation algoritmasını çalıştırmak

## 🚀 Yöntem: CSV Export/Import (Önerilen)

### Adım 1: Her iki kişi kendi verisini export etsin

**Alice (kendi bilgisayarında):**
```bash
node scripts/dev-tools/export-data.js
```

Çıktı: `llm_data_export_Alice_1703456789.csv` (150 kayıt)

**Bob (kendi bilgisayarında):**
```bash
node scripts/dev-tools/export-data.js
```

Çıktı: `llm_data_export_Bob_1703456890.csv` (150 kayıt)

### Adım 2: CSV dosyalarını paylaşın

- Alice ve Bob CSV dosyalarını birbirlerine gönderir (WhatsApp, email, USB, vs.)
- Alice CSV'leri tek bir klasöre koyar (veya Bob yapabilir, fark etmez)

### Adım 3: Verileri birleştirip import edin

**Alice (veya Bob) ortak veritabanında:**

```bash
# Önce mevcut veriyi temizle (opsiyonel)
node scripts/dev-tools/import-merged-data.js alice_export.csv bob_export.csv --clear

# VEYA mevcut verinin üzerine ekle
node scripts/dev-tools/import-merged-data.js alice_export.csv bob_export.csv
```

Çıktı:
```
📊 Importing merged data from CSV files...

📁 File 1: 150 records
📁 File 2: 150 records
📊 Total: 300 records

⚠️  Clearing existing data...
✅ Existing data cleared

✅ Imported 50/300 records...
✅ Imported 100/300 records...
✅ Imported 150/300 records...
✅ Imported 200/300 records...
✅ Imported 250/300 records...
✅ Imported 300/300 records...

✅ Import completed!
📊 Total records imported: 300

📋 Data distribution:
   Alice: 150 records
   Bob: 150 records

✅ Ready to run evaluation algorithm!
   cd evaluation && python main.py
```

### Adım 4: Evaluation algoritmasını çalıştırın

```bash
cd evaluation
python main.py
```

Artık 300 veri noktası üzerinde analiz yapılacak!

## 🎯 Alternatif Yöntem: pg_dump/pg_restore (Gelişmiş)

### Adım 1: Alice kendi verisini dump etsin

```bash
pg_dump -U postgres -h localhost -d llm_error_db -t llm_error_analysis --data-only -f alice_data.sql
```

### Adım 2: Bob kendi verisini dump etsin

```bash
pg_dump -U postgres -h localhost -d llm_error_db -t llm_error_analysis --data-only -f bob_data.sql
```

### Adım 3: Ortak veritabanına import

```bash
# Alice'in verisi
psql -U postgres -d llm_error_db -f alice_data.sql

# Bob'un verisi
psql -U postgres -d llm_error_db -f bob_data.sql
```

**Not**: Bu yöntemde ID çakışması olabilir, dikkat edilmeli!

## 🔍 Veri Kontrolü

Birleştirmeden sonra kontrol etmek için:

```bash
node scripts/dev-tools/check-count.js
```

veya SQL ile:

```sql
-- Toplam veri sayısı
SELECT COUNT(*) FROM llm_error_analysis;

-- Geliştirici bazında dağılım
SELECT developer_name, COUNT(*)
FROM llm_error_analysis
GROUP BY developer_name;

-- Hata kategorisi kapsama oranı
SELECT error_category, COUNT(*)
FROM llm_error_analysis
GROUP BY error_category
ORDER BY COUNT(*) DESC;
```

## 📊 Beklenen Sonuç

```
Total records: 300
Developer distribution:
  - Alice: 150 records
  - Bob: 150 records

Error coverage:
  - Total unique errors: ~140-150 (bazı hatalar çakışabilir)
  - Category coverage: 100% (12/12)
```

## ⚠️ Önemli Notlar

1. **ID Sıfırlama**: `--clear` parametresi kullanıldığında ID'ler 1'den başlar
2. **Çakışma Önleme**: SEED sistemi sayesinde her iki kişi farklı hatalar üretmiş olmalı
3. **Veri Doğrulama**: Import sonrası mutlaka kayıt sayısını kontrol edin
4. **Yedekleme**: Import öncesi mevcut veriyi yedekleyin

## 🎓 Evaluation Çalıştırma

Birleştirme tamamlandıktan sonra:

```bash
cd evaluation

# Eğer ilk kez çalıştırıyorsanız
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# .env dosyasını düzenle

# Evaluation'ı çalıştır
python main.py
```

Sonuç dosyaları:
- `evaluation_report.txt` - Detaylı rapor
- `evaluation_results.json` - JSON formatında sonuçlar

## 🤝 İşbirliği Senaryosu

**En pratik yol:**

1. Alice projeyi GitHub'a push eder
2. Bob projeyi clone eder
3. İkisi de kendi verisini üretir (farklı SEED)
4. İkisi de CSV export eder
5. CSV'leri WhatsApp/Discord'dan paylaşırlar
6. Biri import script'ini çalıştırır
7. Birleşmiş veriyle evaluation yapılır
8. Sonuçlar rapor edilir

**Toplam süre**: 5-10 dakika

## 📁 Dosya Yapısı

```
llm-error-db/
├── scripts/
│   └── dev-tools/
│       ├── export-data.js           # Veriyi CSV'ye export et
│       ├── import-merged-data.js    # İki CSV'yi birleştirip import et
│       └── check-count.js           # Veri sayısını kontrol et
├── alice_export.csv                 # Alice'in verisi (geçici)
├── bob_export.csv                   # Bob'un verisi (geçici)
└── MERGE_DATABASES.md              # Bu dosya
```

## 🎉 Başarı Durumu

Import başarılı olduğunda:
```
✅ 300 kayıt import edildi
✅ 2 geliştirici verisi birleştirildi
✅ Evaluation algoritması çalıştırılabilir
✅ Akademik sunum için hazır
```

---

**Kolay gelsin!** 🚀
