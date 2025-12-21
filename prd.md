# 📘 Product Requirements Document (PRD)

## Proje Adı

**LLM Error Analysis Platform**

## 1. Amaç ve Kapsam

Bu projenin amacı, yazılım geliştirme ve test süreçlerinde karşılaşılan farklı hata türlerinin (API, otomasyon, kodlama, veritabanı vb.) büyük dil modelleri (LLM) tarafından nasıl analiz edildiğini karşılaştırmalı olarak incelemektir.

Platform; **aynı hata girdisini** birden fazla LLM’e (Gemini, Groq, Mistral) göndererek:

* Hata açıklama kalitesini,
* Çözüm önerilerinin doğruluğunu,
* Yaklaşım farklılıklarını

analiz etmeyi hedefler.

Bu proje, **17 Aralık dersi haftalık teslimi** kapsamında verilen hata kategorileri temel alınarak geliştirilmiştir.

---

## 2. Hedef Kullanıcı Profili

* Yazılım geliştiriciler (Developers)
* Test / QA mühendisleri
* Otomasyon ve backend geliştirme ile ilgilenen öğrenciler
* Akademik karşılaştırma çalışması yapan araştırmacılar

---

## 3. Sistem Genel Mimarisi

1. PostgreSQL üzerinde merkezi bir hata veritabanı
2. Önceden tanımlı hata kategorilerinden üretilen hata kayıtları
3. Aynı prompt’un:

   * Gemini
   * Groq
   * Mistral
     LLM’lerine gönderilmesi
4. LLM cevaplarının veritabanında saklanması
5. Manuel veya otomatik analiz ile en iyi LLM’in belirlenmesi

---

## 4. Kullanılan Büyük Dil Modelleri (LLM)

| Model            | Sağlayıcı  | Kullanım Nedeni                 |
| ---------------- | ---------- | ------------------------------- |
| Gemini           | Google     | Gelişmiş reasoning, Pro erişim  |
| Groq (LLaMA 3.x) | Groq       | Ultra hızlı cevap, ücretsiz API |
| Mistral          | Mistral AI | Açık kaynak, güçlü hata analizi |

Claude modeli ücretli olduğu için projeye dahil edilmemiştir.

---

## 5. Hata Kategorileri (Ders Teslimine Uygun)

### 5.1 API_ERR – API Hataları

* 400 Bad Request
* 401 Unauthorized
* 403 Forbidden
* 404 Not Found
* 405 Method Not Allowed
* 500 Internal Server Error
* 502 Bad Gateway
* 503 Service Unavailable
* 504 Gateway Timeout
* 429 Too Many Requests

### 5.2 AUTO_ERR – Otomasyon Hataları

* NoSuchElementException
* TimeoutException
* StaleElementReferenceException
* ElementClickInterceptedException
* ElementNotInteractableException
* SessionNotFoundException
* InvalidSelectorException
* WebDriverException

### 5.3 BROWSER_ERR – Tarayıcı Hataları

* BrowserNotReachableException
* BrowserCrashDetected
* TabCrashedError
* WebGLNotSupported
* UnsupportedBrowserFeature

### 5.4 CODE_ERR – Kodlama Hataları

* NullPointerException
* ArrayIndexOutOfBoundsException
* ClassCastException
* IllegalArgumentException
* IllegalStateException
* AssertionError
* ConcurrentModificationException

### 5.5 CONFIG_ERR – Yapılandırma Hataları

* MissingConfigurationFile
* InvalidEnvironmentVariable
* IncorrectDriverVersion
* MisconfiguredTestSetup
* MissingDependencies

### 5.6 DATA_ERR – Veri Hataları

* TestDataMissing
* DataTypeMismatch
* ConstraintViolationOnInsert
* MandatoryFieldEmpty
* DuplicateDataDetected

### 5.7 DB_ERR – Veritabanı Hataları

* SQLSyntaxErrorException
* SQLIntegrityConstraintViolationException
* ConnectionRefused
* DeadlockDetected
* QueryTimeoutException
* DatabaseLockedError
* PrimaryKeyViolation

### 5.8 ENV_ERR – Çevresel Hatalar

* ServerDown
* EnvironmentNotReachable
* DNSResolutionError
* SSLHandshakeException
* ConnectionTimeout
* ResourceUnavailable

### 5.9 NET_ERR – Ağ Hataları

* ConnectionReset
* SocketTimeoutException
* HostUnreachable
* NetworkInterfaceDown
* PacketLossDetected
* TLSHandshakeFailure

### 5.10 PERF_ERR – Performans Hataları

* SlowResponseDetected
* DatabaseTimeout
* APIResponseDelay
* HighMemoryUsage
* CPUOverload
* DiskSpaceLow

### 5.11 SEC_ERR – Güvenlik Hataları

* AuthenticationFailure
* AuthorizationFailure
* TokenExpired
* TokenInvalid
* CrossSiteRequestForgery
* CrossSiteScriptingDetected

### 5.12 VERSION_ERR – Sürüm Uyumsuzluğu

* IncompatibleDriverVersion
* UnsupportedBrowserVersion
* OutdatedFrameworkVersion
* DeprecatedAPI

---

## 6. Veritabanı Tasarımı (PostgreSQL)

### 6.1 Ana Tablo: `llm_error_analysis`

| Alan Adı         | Tip         | Açıklama                                   |
| ---------------- | ----------- | ------------------------------------------ |
| id               | SERIAL (PK) | Otomatik artan ID                          |
| developer_name   | TEXT        | Hata kaydını oluşturan geliştirici         |
| created_at       | TIMESTAMP   | Kayıt zamanı                               |
| error_category   | TEXT        | API_ERR, CODE_ERR vb.                      |
| error_code       | TEXT        | 401 Unauthorized, NullPointerException vb. |
| error_message    | TEXT        | Detaylı hata mesajı                        |
| prompt_sent      | TEXT        | LLM’lere gönderilen ortak prompt           |
| gemini_response  | TEXT        | Gemini yanıtı                              |
| groq_response    | TEXT        | Groq yanıtı                                |
| mistral_response | TEXT        | Mistral yanıtı                             |
| best_llm         | TEXT        | En başarılı model (manuel/otomatik)        |
| notes            | TEXT        | Gözlem ve yorumlar                         |

---

## 7. Temel Kullanım Senaryosu

1. Sistem, tanımlı hata kategorilerinden bir hata seçer
2. Hata için standart bir analiz prompt’u oluşturulur
3. Aynı prompt Gemini, Groq ve Mistral modellerine gönderilir
4. Gelen cevaplar PostgreSQL veritabanına kaydedilir
5. Geliştirici cevapları karşılaştırır
6. En başarılı LLM `best_llm` alanında işaretlenir

---

## 8. Başarı Kriterleri

* Tüm hata kategorilerinin kapsanması
* Aynı hataya üç farklı LLM cevabı alınması
* Verilerin PostgreSQL üzerinde saklanması
* Karşılaştırmalı analiz yapılabilmesi

---

## 9. Genişletilebilirlik (Future Work)

* Otomatik skorlandırma algoritması
* FastAPI ile REST servis
* Basit web arayüzü (dashboard)
* LLM cevap sürelerinin ölçülmesi

---

## 10. Sonuç

Bu proje, büyük dil modellerinin yazılım hatalarına yaklaşımını karşılaştırmalı olarak inceleyen, akademik ve pratik değeri olan bir deney platformu sunmaktadır. Ders kapsamında verilen hata taksonomisi birebir uygulanmış ve gerçek dünya senaryolarına uygun bir mimari kurulmuştur.  