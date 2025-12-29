# OECD Karşılaştırmalı Ekonomik Veri Toplama Araştırma Planı

## Görev Özeti
OECD REST API'sini kullanarak G7 ülkeleri ve ek ülkelerin (Avustralya, Kanada, Fransa, Almanya, İtalya, Japonya, Birleşik Krallık) TÜFE, işsizlik, GDP büyüme oranları için 2020-2025 yıllık verilerini toplayarak data/oecd_comparative_data.json dosyasına kaydetmek.

## Hedef Veriler
- **Ülkeler**: Avustralya, Kanada, Fransa, Almanya, İtalya, Japonya, Birleşik Krallık
- **Göstergeler**: TÜFE, İşsizlik, GDP Büyüme Oranı
- **Zaman Aralığı**: 2020-2025 (Yıllık)
- **Çıktı Dosyası**: data/oecd_comparative_data.json

## Araştırma Adımları

### 1. OECD API Dokümantasyonu Araştırması
- [x] 1.1. OECD REST API endpoint'lerini araştır
- [x] 1.2. Ekonomik göstergeler için gerekli parametreleri belirle
- [x] 1.3. Ülke kodlarını ve veri formatlarını tespit et
- [x] 1.4. Economic indicator kodlarını tespit et (CPI: A.N.CPI.PA._T.N.GY, Unemployment: .UNE_LF_M...Y._T.Y_GE15..M, GDP: Q.....B1GQ......G1.)

### 2. API Bağlantı Testi
- [ ] 2.1. OECD API'sine test bağlantısı yap
- [ ] 2.2. Gerekli veri setlerine erişim sağla
- [ ] 2.3. Rate limiting ve kimlik doğrulama gereksinimlerini kontrol et

### 3. Veri Toplama Implementation
- [ ] 3.1. TÜFE verilerini topla
- [ ] 3.2. İşsizlik verilerini topla
- [ ] 3.3. GDP büyüme oranı verilerini topla
- [ ] 3.4. Tüm verileri standartlaştır ve organize et

### 4. Veri Doğrulama ve Temizleme
- [ ] 4.1. Toplanan verilerin doğruluğunu kontrol et
- [ ] 4.2. Eksik verileri tespit et
- [ ] 4.3. Veri kalitesini değerlendir

### 5. JSON Dosyası Oluşturma
- [ ] 5.1. Verileri uygun JSON formatında organize et
- [ ] 5.2. data/oecd_comparative_data.json dosyasını oluştur
- [ ] 5.3. Dosyanın doğru şekilde kaydedildiğini doğrula

## Teknik Gereksinimler
- Python requests kütüphanesi kullanarak HTTP istekleri
- JSON veri işleme
- Error handling ve retry mekanizmaları
- Structured data output

## Başarı Kriterleri
- Tüm hedef ülkeler için 2020-2025 dönemi verilerinin toplanması
- 3 ekonomik gösterge için tam veri seti
- Hatasız JSON dosyası oluşturulması
- Veri bütünlüğünün sağlanması

## Notlar
- OECD API'si genellikle kimlik doğrulama gerektirir
- Rate limiting sınırları dikkate alınmalıdır
- Veri güncelliği kontrol edilmeli