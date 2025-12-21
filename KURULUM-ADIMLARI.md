# Veritabanı Kurulum Adımları

PostgreSQL şifresi gerekiyor. Lütfen aşağıdaki adımları takip edin:

## Adım 1: PostgreSQL Şifresini Bulun

### Yöntem 1: pgAdmin ile test edin
1. Başlat menüsünden "pgAdmin" yazın ve açın
2. Sol panelde "Servers" → "PostgreSQL 14" üzerine çift tıklayın
3. Şifre soracak - farklı şifreler deneyin:
   - Boş (Enter'a basın)
   - postgres
   - admin
   - root
   - Kurulum sırasında belirlediğiniz şifre

### Yöntem 2: Komut satırında test edin
Terminaldefarklı şifreler deneyin:

```bash
# Şifre 1: postgres
psql -U postgres -W
# Şifre girin: postgres

# Şifre 2: boş
psql -U postgres
```

## Adım 2: Doğru Şifreyi Bulunca

1. `.env` dosyasını açın
2. `DB_PASSWORD=` satırındaki şifreyi güncelleyin
3. Kaydedin

## Adım 3: Veritabanını Oluşturun

Doğru şifreyi `.env` dosyasına yazdıktan sonra:

```bash
node create-db-now.js
```

---

## Alternatif: Manuel Kurulum

Eğer yukarıdaki yöntemler çalışmazsa, PostgreSQL'e direkt bağlanıp manuel oluşturun:

1. PostgreSQL'e bağlanın (pgAdmin veya komut satırı):
```sql
CREATE DATABASE llm_error_db;
```

2. Tabloları oluşturun:
```bash
psql -U postgres -d llm_error_db -f src\database\schema.sql
```

---

## Şifre Sıfırlama (Son Çare)

Eğer şifrenizi unuttuysanız:

1. `C:\Program Files\PostgreSQL\14\data\pg_hba.conf` dosyasını açın
2. Şu satırı bulun:
   ```
   host    all             all             127.0.0.1/32            scram-sha-256
   ```
3. `scram-sha-256` yerine `trust` yazın
4. PostgreSQL servisini yeniden başlatın
5. Şifresiz bağlanıp yeni şifre belirleyin:
   ```sql
   ALTER USER postgres PASSWORD 'yeni_sifreniz';
   ```
6. pg_hba.conf'u eski haline getirin ve servisi yeniden başlatın

---

## Yardıma İhtiyacınız Varsa

Bana şunu söyleyin:
- pgAdmin açılıyor mu?
- Komut satırında `psql --version` ne döndürüyor?
- Hangi şifreleri denediniz?
