// Error categories based on project requirements

export const ERROR_CATEGORIES = {
  API_ERR: {
    name: 'API Hataları',
    errors: [
      { code: '400', name: 'Bad Request', message: 'İstek formatı hatalı veya eksik parametreler mevcut' },
      { code: '401', name: 'Unauthorized', message: 'Kimlik doğrulama başarısız, geçersiz veya eksik token' },
      { code: '403', name: 'Forbidden', message: 'Yetkisiz erişim, kullanıcı bu kaynağa erişim iznine sahip değil' },
      { code: '404', name: 'Not Found', message: 'İstenen kaynak bulunamadı' },
      { code: '405', name: 'Method Not Allowed', message: 'HTTP metodu bu endpoint için desteklenmiyor' },
      { code: '500', name: 'Internal Server Error', message: 'Sunucu tarafında beklenmeyen bir hata oluştu' },
      { code: '502', name: 'Bad Gateway', message: 'Upstream sunucudan geçersiz yanıt alındı' },
      { code: '503', name: 'Service Unavailable', message: 'Servis geçici olarak kullanılamıyor, sunucu aşırı yüklü' },
      { code: '504', name: 'Gateway Timeout', message: 'Upstream sunucu zamanında yanıt vermedi' },
      { code: '429', name: 'Too Many Requests', message: 'Rate limit aşıldı, çok fazla istek gönderildi' }
    ]
  },

  AUTO_ERR: {
    name: 'Otomasyon Hataları',
    errors: [
      { code: 'NoSuchElementException', name: 'NoSuchElementException', message: 'Belirtilen element sayfada bulunamadı' },
      { code: 'TimeoutException', name: 'TimeoutException', message: 'Element belirtilen süre içinde görünmedi veya etkileşime hazır hale gelmedi' },
      { code: 'StaleElementReferenceException', name: 'StaleElementReferenceException', message: 'Element DOM\'dan kaldırılmış veya yenilenmiş, referans geçersiz' },
      { code: 'ElementClickInterceptedException', name: 'ElementClickInterceptedException', message: 'Başka bir element tıklamayı engelliyor, overlay veya modal olabilir' },
      { code: 'ElementNotInteractableException', name: 'ElementNotInteractableException', message: 'Element görünür ancak etkileşime kapalı durumda' },
      { code: 'SessionNotFoundException', name: 'SessionNotFoundException', message: 'WebDriver session\'ı sonlandırılmış veya bulunamıyor' },
      { code: 'InvalidSelectorException', name: 'InvalidSelectorException', message: 'CSS veya XPath selector formatı geçersiz' },
      { code: 'WebDriverException', name: 'WebDriverException', message: 'WebDriver ile iletişim kurulamadı veya genel driver hatası' }
    ]
  },

  BROWSER_ERR: {
    name: 'Tarayıcı Hataları',
    errors: [
      { code: 'BrowserNotReachableException', name: 'BrowserNotReachableException', message: 'Tarayıcı sürecine erişilemiyor, çökmüş olabilir' },
      { code: 'BrowserCrashDetected', name: 'BrowserCrashDetected', message: 'Tarayıcı beklenmedik şekilde çöktü' },
      { code: 'TabCrashedError', name: 'TabCrashedError', message: 'Aktif sekme çöktü, içerik render edilemiyor' },
      { code: 'WebGLNotSupported', name: 'WebGLNotSupported', message: 'Tarayıcı WebGL desteklemiyor veya devre dışı' },
      { code: 'UnsupportedBrowserFeature', name: 'UnsupportedBrowserFeature', message: 'Kullanılan özellik bu tarayıcı versiyonunda desteklenmiyor' }
    ]
  },

  CODE_ERR: {
    name: 'Kodlama Hataları',
    errors: [
      { code: 'NullPointerException', name: 'NullPointerException', message: 'Null referansa erişim denemesi, nesne başlatılmamış' },
      { code: 'ArrayIndexOutOfBoundsException', name: 'ArrayIndexOutOfBoundsException', message: 'Dizi sınırları dışında index erişimi' },
      { code: 'ClassCastException', name: 'ClassCastException', message: 'Geçersiz tip dönüşümü, uyumsuz sınıflar arası cast' },
      { code: 'IllegalArgumentException', name: 'IllegalArgumentException', message: 'Fonksiyona geçersiz veya beklenmeyen parametre değeri' },
      { code: 'IllegalStateException', name: 'IllegalStateException', message: 'Nesne geçersiz durumda, işlem bu state\'te yapılamaz' },
      { code: 'AssertionError', name: 'AssertionError', message: 'Test assertion başarısız, beklenen değer ile gerçek değer uyuşmuyor' },
      { code: 'ConcurrentModificationException', name: 'ConcurrentModificationException', message: 'Koleksiyon iterasyon sırasında değiştirildi' }
    ]
  },

  CONFIG_ERR: {
    name: 'Yapılandırma Hataları',
    errors: [
      { code: 'MissingConfigurationFile', name: 'MissingConfigurationFile', message: 'Gerekli yapılandırma dosyası bulunamadı' },
      { code: 'InvalidEnvironmentVariable', name: 'InvalidEnvironmentVariable', message: 'Ortam değişkeni eksik veya geçersiz formatta' },
      { code: 'IncorrectDriverVersion', name: 'IncorrectDriverVersion', message: 'WebDriver versiyonu tarayıcı versiyonu ile uyumsuz' },
      { code: 'MisconfiguredTestSetup', name: 'MisconfiguredTestSetup', message: 'Test yapılandırması hatalı, eksik parametreler mevcut' },
      { code: 'MissingDependencies', name: 'MissingDependencies', message: 'Gerekli bağımlılıklar yüklenmemiş veya bulunamıyor' }
    ]
  },

  DATA_ERR: {
    name: 'Veri Hataları',
    errors: [
      { code: 'TestDataMissing', name: 'TestDataMissing', message: 'Test verisi bulunamadı veya dosya okunamadı' },
      { code: 'DataTypeMismatch', name: 'DataTypeMismatch', message: 'Veri tipi uyuşmuyor, string beklenirken number geldi' },
      { code: 'ConstraintViolationOnInsert', name: 'ConstraintViolationOnInsert', message: 'Veritabanı kısıtlaması ihlal edildi, unique constraint hatası' },
      { code: 'MandatoryFieldEmpty', name: 'MandatoryFieldEmpty', message: 'Zorunlu alan boş bırakılamaz' },
      { code: 'DuplicateDataDetected', name: 'DuplicateDataDetected', message: 'Aynı veri zaten mevcut, tekrarlanan kayıt' }
    ]
  },

  DB_ERR: {
    name: 'Veritabanı Hataları',
    errors: [
      { code: 'SQLSyntaxErrorException', name: 'SQLSyntaxErrorException', message: 'SQL sorgu sözdizimi hatası' },
      { code: 'SQLIntegrityConstraintViolationException', name: 'SQLIntegrityConstraintViolationException', message: 'Foreign key veya unique constraint ihlali' },
      { code: 'ConnectionRefused', name: 'ConnectionRefused', message: 'Veritabanı bağlantısı reddedildi, sunucu erişilemiyor' },
      { code: 'DeadlockDetected', name: 'DeadlockDetected', message: 'Veritabanı deadlock tespit edildi, transaction geri alındı' },
      { code: 'QueryTimeoutException', name: 'QueryTimeoutException', message: 'Sorgu maksimum süre içinde tamamlanamadı' },
      { code: 'DatabaseLockedError', name: 'DatabaseLockedError', message: 'Veritabanı kilitli, yazma işlemi yapılamıyor' },
      { code: 'PrimaryKeyViolation', name: 'PrimaryKeyViolation', message: 'Primary key constraint ihlali, aynı ID zaten var' }
    ]
  },

  ENV_ERR: {
    name: 'Çevresel Hatalar',
    errors: [
      { code: 'ServerDown', name: 'ServerDown', message: 'Test sunucusu yanıt vermiyor veya kapalı' },
      { code: 'EnvironmentNotReachable', name: 'EnvironmentNotReachable', message: 'Test ortamına erişilemiyor, network veya VPN problemi' },
      { code: 'DNSResolutionError', name: 'DNSResolutionError', message: 'DNS çözümlenemedi, domain bulunamadı' },
      { code: 'SSLHandshakeException', name: 'SSLHandshakeException', message: 'SSL sertifika doğrulama hatası' },
      { code: 'ConnectionTimeout', name: 'ConnectionTimeout', message: 'Bağlantı zaman aşımına uğradı' },
      { code: 'ResourceUnavailable', name: 'ResourceUnavailable', message: 'Gerekli kaynak kullanılamıyor veya meşgul' }
    ]
  },

  NET_ERR: {
    name: 'Ağ Hataları',
    errors: [
      { code: 'ConnectionReset', name: 'ConnectionReset', message: 'Bağlantı karşı tarafça sıfırlandı' },
      { code: 'SocketTimeoutException', name: 'SocketTimeoutException', message: 'Socket okuma/yazma zaman aşımı' },
      { code: 'HostUnreachable', name: 'HostUnreachable', message: 'Hedef host\'a erişilemiyor, routing problemi' },
      { code: 'NetworkInterfaceDown', name: 'NetworkInterfaceDown', message: 'Ağ arayüzü devre dışı veya bağlantı yok' },
      { code: 'PacketLossDetected', name: 'PacketLossDetected', message: 'Yüksek paket kaybı tespit edildi' },
      { code: 'TLSHandshakeFailure', name: 'TLSHandshakeFailure', message: 'TLS handshake başarısız, protokol uyumsuzluğu' }
    ]
  },

  PERF_ERR: {
    name: 'Performans Hataları',
    errors: [
      { code: 'SlowResponseDetected', name: 'SlowResponseDetected', message: 'Yanıt süresi kabul edilebilir limitin üzerinde' },
      { code: 'DatabaseTimeout', name: 'DatabaseTimeout', message: 'Veritabanı sorgusu çok uzun sürdü' },
      { code: 'APIResponseDelay', name: 'APIResponseDelay', message: 'API yanıt süresi SLA\'yı aşıyor' },
      { code: 'HighMemoryUsage', name: 'HighMemoryUsage', message: 'Bellek kullanımı kritik seviyede' },
      { code: 'CPUOverload', name: 'CPUOverload', message: 'CPU kullanımı %90\'ın üzerinde' },
      { code: 'DiskSpaceLow', name: 'DiskSpaceLow', message: 'Disk alanı yetersiz, kritik eşik aşıldı' }
    ]
  },

  SEC_ERR: {
    name: 'Güvenlik Hataları',
    errors: [
      { code: 'AuthenticationFailure', name: 'AuthenticationFailure', message: 'Kullanıcı kimlik doğrulaması başarısız' },
      { code: 'AuthorizationFailure', name: 'AuthorizationFailure', message: 'Kullanıcı bu işlem için yetkilendirilmemiş' },
      { code: 'TokenExpired', name: 'TokenExpired', message: 'Authentication token süresi dolmuş' },
      { code: 'TokenInvalid', name: 'TokenInvalid', message: 'Token formatı geçersiz veya imza doğrulanamadı' },
      { code: 'CrossSiteRequestForgery', name: 'CrossSiteRequestForgery', message: 'CSRF token eksik veya geçersiz' },
      { code: 'CrossSiteScriptingDetected', name: 'CrossSiteScriptingDetected', message: 'XSS saldırı girişimi tespit edildi' }
    ]
  },

  VERSION_ERR: {
    name: 'Sürüm Uyumsuzluğu Hataları',
    errors: [
      { code: 'IncompatibleDriverVersion', name: 'IncompatibleDriverVersion', message: 'Driver versiyonu browser versiyonu ile uyumsuz' },
      { code: 'UnsupportedBrowserVersion', name: 'UnsupportedBrowserVersion', message: 'Browser versiyonu desteklenmiyor, güncelleme gerekli' },
      { code: 'OutdatedFrameworkVersion', name: 'OutdatedFrameworkVersion', message: 'Test framework versiyonu eski, yeni API\'ler kullanılamıyor' },
      { code: 'DeprecatedAPI', name: 'DeprecatedAPI', message: 'Kullanılan API deprecated edilmiş, alternatif kullanılmalı' }
    ]
  }
};

// Helper function to get random error from a category
// Now supports seed parameter to ensure reproducible randomness
export function getRandomError(category, seed = null) {
  if (!ERROR_CATEGORIES[category]) {
    throw new Error(`Invalid category: ${category}`);
  }

  const errors = ERROR_CATEGORIES[category].errors;

  // If seed is provided, use it for deterministic selection
  let randomIndex;
  if (seed !== null) {
    // Simple seeded random: use seed to create deterministic index
    randomIndex = seed % errors.length;
  } else {
    // Normal random selection
    randomIndex = Math.floor(Math.random() * errors.length);
  }

  return {
    category,
    categoryName: ERROR_CATEGORIES[category].name,
    ...errors[randomIndex]
  };
}

// Helper function to get all categories
export function getAllCategories() {
  return Object.keys(ERROR_CATEGORIES);
}

// Helper function to get specific error by code
export function getErrorByCode(category, errorCode) {
  if (!ERROR_CATEGORIES[category]) {
    throw new Error(`Invalid category: ${category}`);
  }

  const errors = ERROR_CATEGORIES[category].errors;
  const error = errors.find(err => err.code === errorCode);

  if (!error) {
    throw new Error(`Error code '${errorCode}' not found in category '${category}'`);
  }

  return {
    category,
    categoryName: ERROR_CATEGORIES[category].name,
    ...error
  };
}

// Helper function to generate prompt for LLM
export function generatePrompt(error) {
  return `Aşağıdaki yazılım hatasını analiz edin ve detaylı bir çözüm önerisi sunun:

Hata Kategorisi: ${error.categoryName} (${error.category})
Hata Kodu: ${error.code}
Hata Adı: ${error.name}
Hata Mesajı: ${error.message}

Lütfen aşağıdaki başlıklar altında analiz yapın:

1. Hatanın Nedeni: Bu hatanın oluşma sebepleri nelerdir?
2. Hata Senaryosu: Hangi durumlarda bu hata ile karşılaşılır?
3. Çözüm Önerileri: Bu hatayı nasıl çözebiliriz? (Adım adım)
4. Önleme Yöntemleri: Gelecekte bu hatanın oluşmasını nasıl engelleriz?
5. Best Practices: İlgili konuda en iyi uygulamalar nelerdir?`;
}
