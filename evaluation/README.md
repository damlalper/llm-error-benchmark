# 🎓 LLM Evaluation Algorithm

Akademik olarak kabul edilebilir, açıklanabilir ve deterministik bir LLM değerlendirme sistemi.

## 📋 Özellikler

- **6 farklı kriter** ile çok boyutlu değerlendirme
- **Ağırlıklı puanlama** sistemi
- **Tekrarlanabilir** sonuçlar (deterministik)
- **Açıklanabilir** metodoloji
- Harici AI servisi gerektirmez (tamamen lokal)

## 🎯 Değerlendirme Kriterleri

| Kriter | Ağırlık | Maksimum Puan |
|--------|---------|---------------|
| Teknik Doğruluk | 25% | 25 |
| Çözüm Kalitesi | 25% | 25 |
| Açıklama Netliği | 20% | 20 |
| Özlük-Kapsam Dengesi | 10% | 10 |
| Yanıt Hızı | 10% | 10 |
| Güvenilirlik | 10% | 10 |
| **TOPLAM** | **100%** | **100** |

## 📦 Kurulum

### 1. Python Sanal Ortamı Oluştur

```bash
cd evaluation
python -m venv venv
```

### 2. Sanal Ortamı Aktifle

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### 3. Bağımlılıkları Yükle

```bash
pip install -r requirements.txt
```

### 4. .env Dosyası Oluştur

```bash
copy .env.example .env
```

`.env` dosyasını düzenle ve PostgreSQL bilgilerini gir:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=llm_error_db
DB_USER=postgres
DB_PASSWORD=0258520
```

## 🚀 Kullanım

```bash
python main.py
```

## 📊 Çıktı

Değerlendirme sonuçları:

1. **Konsol çıktısı**: Detaylı sıralama ve skorlar
2. **JSON dosyası**: `evaluation_results.json` (programatik erişim için)

### Örnek Çıktı:

```
======================================================================
📊 LLM EVALUATION RESULTS
======================================================================

📅 Evaluation Date: 2025-12-22 23:45:00

🏆 OVERALL RANKING:

   🥇 MISTRAL                  82.34/100
   🥈 GROQ                     78.56/100
   🥉 COHERE                   75.12/100
   4. OPENROUTER_HERMES        50.23/100
   5. OPENROUTER_MISTRAL       48.67/100
   6. OPENROUTER_LLAMA         45.89/100

----------------------------------------------------------------------

🏆 BEST LLM:  MISTRAL (82.34/100)
💔 WORST LLM: OPENROUTER_LLAMA (45.89/100)
```

## 📐 Metodoloji

### 1. Teknik Doğruluk (25 puan)

- Hata kodunu bahsetme: +5
- Sebep açıklaması: +5
- Teknik terim kullanımı: +7
- Kod örnekleri: +8

### 2. Çözüm Kalitesi (25 puan)

- Çözüm önerisi: +5
- Adım adım talimat: +8
- Kod örnekleri: +8
- Alternatif yöntemler: +4

### 3. Açıklama Netliği (20 puan)

- Başlık kullanımı: +5
- Liste/madde işaretleri: +5
- Paragraf yapısı: +5
- Görsel işaretçiler (emoji): +5

### 4. Özlük-Kapsam (10 puan)

- Optimal (300-800 kelime): 10 puan
- Kabul edilebilir (200-1000 kelime): 7 puan
- Zayıf (100-1500 kelime): 4 puan
- Çok kısa/uzun: 1 puan

### 5. Yanıt Hızı (10 puan)

- Mükemmel (<5s): 10 puan
- İyi (5-15s): 7 puan
- Kabul edilebilir (15-30s): 4 puan
- Yavaş (>30s): 1 puan

### 6. Güvenilirlik (10 puan)

- Başarılı yanıt: 10 puan
- Hata mesajı: 0 puan

## 📚 Akademik Savunma

### Güçlü Yanlar:

1. **Şeffaflık**: Her kriter açıkça tanımlanmış
2. **Tekrarlanabilirlik**: Aynı veri → Aynı sonuç
3. **Çok Boyutluluk**: Tek bir metriğe bağlı değil
4. **Ağırlıklandırma**: Önemli kriterler daha fazla etki
5. **Objektiflik**: Sayısal metrikler, subjektif karar yok

### Metodolojik Gerekçeler:

- **NLP Bag-of-Words**: Basit ama etkili, literatürde kabul görmüş
- **Ağırlıklandırma Oranları**: Yazılım geliştirme iş akışına göre optimize edilmiş
- **Eşik Değerler**: Endüstri standartlarına uygun (response time, word count)

## 🔬 Genişletilebilirlik

Sistem kolayca genişletilebilir:

- Yeni kriterler eklenebilir
- Ağırlıklar ayarlanabilir
- Dil desteği genişletilebilir
- Kategori bazlı değerlendirme eklenebilir

## 📄 Dosya Yapısı

```
evaluation/
├── config.py              # Konfigürasyon ve sabitler
├── feature_extractor.py   # Özellik çıkarımı
├── scorer.py              # Puanlama fonksiyonları
├── evaluator.py           # Ana değerlendirme motoru
├── main.py                # Çalıştırılabilir script
├── requirements.txt       # Python bağımlılıkları
├── .env.example           # Örnek çevre değişkenleri
└── README.md              # Bu dosya
```

## 📊 Veri Akışı

```
[PostgreSQL DB]
     ↓
[Veri Çekme] → Her LLM için tüm yanıtlar
     ↓
[Feature Extraction] → Kelime sayısı, kod bloğu, vb.
     ↓
[Scoring] → Her kriter için puan hesaplama
     ↓
[Ağırlıklı Toplam] → Toplam skor = Σ(kriter × ağırlık)
     ↓
[Sıralama] → BEST ve WORST belirleme
     ↓
[Rapor] → Konsol + JSON çıktısı
```

## 🎯 Sonuç Yorumlama

- **80-100**: Mükemmel performans
- **60-79**: İyi performans
- **40-59**: Orta seviye performans
- **0-39**: Zayıf performans

## 📞 İletişim

Proje: LLM Error Benchmark
Branch: feature/llm-evaluation-algorithm
