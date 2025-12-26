# FRED API Key Kayıt Süreci Rehberi

## 📋 Genel Bakış

FRED (Federal Reserve Economic Data) API'si, ekonomik verilere programlı erişim sağlayan bir hizmettir. API key almak için belirli adımları takip etmeniz gerekmektedir.

## 🎯 API Key Alma Süreci

### 1. Adım: FRED Kullanıcı Hesabı Oluşturma

**URL:** https://fredaccount.stlouisfed.org/login

**İşlemler:**
1. FRED giriş sayfasına gidin
2. "Create New Account" sekmesine tıklayın
3. Kayıt formunu doldurun:

**Gerekli Bilgiler:**
- **Email Address*** (Zorunlu)
- **Password*** (Zorunlu - en az 8 karakter)
- **Confirm Password*** (Zorunlu - şifre tekrarı)
- **In what context do you use FRED?*** (Zorunlu dropdown seçimi)

**Kullanım Bağlamı Seçenekleri:**
- Business Professional
- Economics Student
- Academic Research
- Financial Analysis
- Government/Policy
- Other

**Opsiyonel Abonelikler:**
- Economic Research newsletter
- FRED newsletter
- FRED in the Classroom newsletter
- Federal Reserve Education newsletter
- FRASER newsletter

### 2. Adım: Hesabı Doğrulama
- Email adresinizi kontrol edin
- Gönderilen doğrulama email'ine tıklayın (eğer gerekliyse)
- Hesabınızı aktif hale getirin

### 3. Adım: API Key Talep Etme

**URL:** https://fredaccount.stlouisfed.org/apikeys

**İşlemler:**
1. FRED hesabınıza giriş yapın
2. API Keys sayfasına gidin
3. "Request New API Key" veya benzer bir seçeneğe tıklayın
4. Gerekli bilgileri doldurun:
   - Application name (uygulama adı)
   - Application description (uygulama açıklaması)
   - Contact information (iletişim bilgileri)

## 📋 API Key Özellikleri

### Teknik Detaylar:
- **Format:** 32 karakterli, küçük harfli alfasayısal string
- **Kullanım:** `api_key` parametresi ile HTTP isteklerine eklenir
- **Güvenlik:** Her uygulama için ayrı key kullanılması önerilir
- **Kullanıcı Bazlı:** Her kullanıcının kendi API key'ini kullanması gerekir

### Kullanım Örneği:
```
https://api.stlouisfed.org/fred/series/search?api_key=YOUR_API_KEY&search_text=unemployment
```

## 🔗 Önemli Linkler

- **Hesap Oluşturma:** https://fredaccount.stlouisfed.org/login
- **API Keys Yönetimi:** https://fredaccount.stlouisfed.org/apikeys
- **FRED Ana Sayfa:** https://fred.stlouisfed.org/
- **API Dokümantasyonu:** https://fred.stlouisfed.org/docs/api/fred/
- **API Key Rehberi:** https://fred.stlouisfed.org/docs/api/api_key.html
- **Kullanım Koşulları:** https://fred.stlouisfed.org/docs/api/terms_of_use.html

## ✅ Kayıt Sürecinin Faydaları

FRED hesabı oluşturduktan sonra elde edeceğiniz avantajlar:

1. **API Erişimi:** FRED API'sine tam erişim
2. **Email Güncellemeleri:** Yeni veri yayınları hakkında bildirimler
3. **Kişisel Listeler:** Veri serilerini favorilere ekleme
4. **Grafik ve Haritalar:** Özelleştirilmiş görselleştirmeler
5. **Dashboard'lar:** Kişisel kontrol panelleri oluşturma
6. **Veri İndirme:** Toplu veri indirme imkanı

## ⚠️ Önemli Notlar

### Güvenlik:
- API key'inizi kimseyle paylaşmayın
- Uygulamalarınızda environment variables kullanın
- Production'da hardcode etmeyin

### Kullanım Limitleri:
- API isteklerinde rate limiting uygulanır
- Aşırı kullanım durumunda geçici engelleme olabilir
- Detaylı limit bilgileri için dokümantasyonu kontrol edin

### Destek:
- Teknik destek: https://fred.stlouisfed.org/contactus/
- Dokümantasyon: https://fredhelp.stlouisfed.org/
- SSS: https://fredhelp.stlouisfed.org/

## 📝 Sonuç

FRED API key alma süreci 3 ana adımdan oluşur:
1. **Hesap Oluşturma** (fredaccount.stlouisfed.org)
2. **Email Doğrulama** (gerekliyse)
3. **API Key Talep Etme** (apikeys sayfası)

Tüm süreç ücretsizdir ve genellikle birkaç dakika içinde tamamlanabilir. API key'inizi aldıktan sonra FRED'in tüm ekonomik verilerine programlı erişim sağlayabilirsiniz.

---
**Tarih:** 10 Kasım 2025  
**Kaynak:** Federal Reserve Bank of St. Louis - FRED API Documentation