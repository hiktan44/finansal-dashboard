# TÜİK Tablo ve Link Analizi Raporu

## 📊 Analiz Özeti

Bu rapor, `pptx_analysis_result.json` dosyasında bulunan 259 slayt içerisinden TÜİK ile ilgili tabloların ve kaynak linklerinin tespit edilmesi sonucu hazırlanmıştır.

## 🎯 Temel İstatistikler

| Kategori | Adet | Açıklama |
|----------|------|----------|
| **Toplam Slayt** | 259 | Analiz edilen toplam slayt sayısı |
| **TÜİK Tablosu** | 20 | TÜİK verilerini içeren tablolar |
| **Boş Tablo** | 2 | Content Placeholder içeren boş tablolar |
| **TÜİK Linki** | 21 | www.tuik.gov.tr linklerinin bulunduğu slaytlar |

## 📋 Tespit Edilen TÜİK Tabloları

### 1. Enflasyon Verileri (4 Tablo)
- **Slayt 11-12:** TÜFE Manşet Enflasyon Oranı Tablosu (Önceki ve Revize)
- **Slayt 13:** Üretici Fiyat Endeksi (ÜFE) 
- **Slayt 164-165:** TÜFE Manşet Enflasyon (Tekrar)

**Kaynak:** www.tuik.gov.tr (3 Temmuz 2025, 22 Eylül 2023)

### 2. İşsizlik Verileri (3 Tablo)
- **Slayt 24:** 2005-2013 Aylık İşsizlik Oranları
- **Slayt 25:** 2014-2023 Aylık İşsizlik Oranları  
- **Slayt 26:** 2024-2033 Aylık İşsizlik Oranları

**Kaynak:** www.tuik.gov.tr (10 Şubat 2021, 12 Haziran 2024, 2 Temmuz 2025)

### 3. Dış Ticaret Verileri (5 Tablo)
- **Slayt 36:** 2024-2025 İhracat-İthalat (Özel Ticaret Sistemi)
- **Slayt 38:** 2024-2025 İhracat-İthalat (Genel Ticaret Sistemi)
- **Slayt 39:** Sektörlere Göre İhracatın Dağılımı
- **Slayt 40:** İthalatın Sınıflandırılması (6 Şubat 2025)
- **Slayt 41:** İthalatın Sınıflandırılması (30 Haziran 2025)

**Kaynak:** www.tuik.gov.tr (30 Haziran 2025, 2 Temmuz 2025, 6 Şubat 2025)

### 4. Enerji ve Üretim (3 Tablo)
- **Slayt 46:** Türkiye Enerji İthalatı (2023-2031)
- **Slayt 132:** Sanayi Üretim Endeksi Tablosu
- **Slayt 134:** Hizmet Sektörü Ciro Endeksi

**Kaynak:** www.tuik.gov.tr (16 Haziran 2025, 13 Haziran 2025)

### 5. Konut Satışları (3 Tablo)
- **Slayt 183:** Türkiye Genelinde Toplam Konut Satışları
- **Slayt 184:** Birinci El ve İkinci El Toplam Konut Satışları
- **Slayt 185:** İpoteksiz ve Diğer Konut Satışları

**Kaynak:** www.tuik.gov.tr (20 Haziran 2025)

### 6. Bütçe Verileri (1 Tablo)
- **Slayt 21:** 2000-2024 Bütçe Açığının Milli Gelire Oranı

**Kaynak:** www.tuik.gov.tr (24 Mart 2025)

## 🚫 Boş Tablolar (Content Placeholder)

| Slayt | Tablo Adı | Durum |
|-------|-----------|-------|
| 15 | Content Placeholder 3 | Boş Tablo |
| 16 | Content Placeholder 3 | Boş Tablo |

## 🔗 TÜİK Kaynak Linkleri

Tespit edilen 21 TÜİK linki farklı tarihlere ait verileri içermektedir:

### Tarih Dağılımı:
- **2021:** 1 link (10 Şubat 2021)
- **2023:** 1 link (22 Eylül 2023) 
- **2024:** 1 link (12 Haziran 2024)
- **2025:** 18 link (Ocak-Temmuz 2025 arası)

### En Sık Kullanılan Kaynak Tarihleri:
- 3 Temmuz 2025 (3 link)
- 30 Haziran 2025 (4 link)
- 16 Haziran 2025 (3 link)
- 20 Haziran 2025 (3 link)

## 📁 Çıktı Dosyaları

1. **`tuik_analysis_result.json`** - Detaylı analiz sonuçları
   - Tüm TÜİK tablolarının listesi
   - Boş tabloların listesi
   - TÜİK linklerinin detayları
   - Özet istatistikler

2. **`tuik_table_finder.py`** - Analiz için kullanılan Python scripti

## 🔍 Metodoloji

1. **JSON Parse:** pptx_analysis_result.json dosyası parse edildi
2. **Tablo Tarama:** Her slaytın 'tables' array'i incelendi
3. **Link Analizi:** Content alanlarında 'www.tuik.gov.tr' arandı
4. **Boş Tablo Tespiti:** 'Content Placeholder' içeren tablolar belirlendi
5. **Veri Temizleme:** Tekrarlar ayıklandı ve sonuçlar JSON formatında kaydedildi

## ✅ Sonuç

Toplam 259 slayt içerisinden:
- **20 adet** TÜİK verilerini içeren tablo tespit edildi
- **2 adet** boş tablo (Content Placeholder) tespit edildi  
- **21 adet** TÜİK kaynak linki bulundu
- Tüm sonuçlar JSON formatında yapılandırıldı

Analiz başarıyla tamamlanmıştır.