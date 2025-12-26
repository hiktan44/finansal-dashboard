# TÜİK Dış Ticaret Verileri Araştırma Planı

## Hedef
2024-2025 dönemi için TÜİK dış ticaret verilerini toplamak, analiz etmek ve belirtilen JSON formatında sunmak.

## Veri Gereksinimleri
- 2024-2025 dönemi ihracat-ithalat rakamları (genel ticaret sistemi)
- Sektörel dağılım verileri
- Ürün sınıflandırması verileri
- Aylık ve yıllık bazda detaylı veriler

## Çalışma Adımları

### 1. TÜİK Web Sitesi Araştırması
- [x] 1.1 TÜİK ana sayfasını inceleme
- [x] 1.2 Dış ticaret verileri bölümünü bulma
- [x] 1.3 2024-2025 dönemi verilerine erişim

### 2. Veri Kaynaklarının Belirlenmesi
- [x] 2.1 İhracat verileri kaynaklarını bulma
- [x] 2.2 İthalat verileri kaynaklarını bulma
- [x] 2.3 Sektörel dağılım verilerini bulma
- [x] 2.4 Excel/PDF dosya linklerini tespit etme

### 3. Veri Toplama
- [x] 3.1 Excel dosyalarını indirme (kısmi - bültenlerden veri çıkarıldı)
- [x] 3.2 PDF dosyalarını indirme (metaveri ve yöntem dokümanları)
- [x] 3.3 Web sayfalarından tabular veri çıkarma (2024-12, 2025-02, 2025-03, 2024-08, 2024-09, 2024-10, 2025-05, 2025-07, 2025-08)

### 4. Veri İşleme ve Temizleme
- [x] 4.1 Excel dosyalarını parse etme (bülten verileri)
- [x] 4.2 PDF dosyalarından veri çıkarma (metaveri ve yöntem dokümanları)
- [x] 4.3 Veri formatlarını birleştirme
- [x] 4.4 Eksik ve tutarsız verileri temizleme

### 5. Sektörel Analiz
- [x] 5.1 Sektörel dağılım verilerini işleme
- [x] 5.2 Ürün sınıflandırmasını analiz etme
- [x] 5.3 Trend analizi yapma

### 6. JSON Formatına Dönüştürme
- [x] 6.1 {"exports": {tarih: değer}} formatını oluşturma
- [x] 6.2 {"imports": {tarih: değer}} formatını oluşturma
- [x] 6.3 {"sectors": {sektör: değer}} formatını oluşturma
- [x] 6.4 Final JSON dosyasını kaydetme

### 7. Kalite Kontrol
- [x] 7.1 Veri doğruluğunu kontrol etme
- [x] 7.2 JSON formatının doğruluğunu kontrol etme
- [x] 7.3 Kaynak linklerini ekleme

## Hedef Çıktı Dosyası
`data/dis_ticaret_2024_2025.json` - Belirtilen formatta JSON verisi

## Notlar
- Tüm dosyalar `data/dis_ticaret/` dizinine kaydedilecek
- Veri kaynakları `sources_add` ile takip edilecek
- 2025 verileri için en güncel mevcut veri alınacak