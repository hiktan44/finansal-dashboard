# OECD Karşılaştırmalı Veri Toplama Planı

## Görev Özeti
OECD API'sını kullanarak G7 ülkeleri ve OECD verilerini toplama ve JSON formatında kaydetme.

## Hedef Veriler
1. G7 Ülkeleri GDP Büyüme Oranları
2. G7 TÜFE Enflasyon Oranları
3. G7 İşsizlik Oranları
4. OECD TÜFE (Year-on-Year)
5. OECD İşsizlik Oranı
6. G7 Refah Endeksi
7. OECD Dijitalleşme Endeksi
8. Europasous

## Veri Formatı
```json
{tarih: 'YYYY-MM', deger: number, kaynak: 'OECD', kategori: 'global_indicators'}
```

## G7 Ülkeleri Listesi
- Amerika Birleşik Devletleri (US)
- Birleşik Krallık (GB) 
- Almanya (DE)
- Fransa (FR)
- Japonya (JP)
- İtalya (IT)
- Kanada (CA)

## Planlanan Adımlar

### 1. Araştırma ve Keşif
- [ ] 1.1. OECD API'sını araştır ve mevcut endpoint'leri tespit et
- [ ] 1.2. Ücretsiz, kayıtsız erişim olan API'ları belirle
- [ ] 1.3. Gerekli veri kategorilerini ve kodlarını araştır

### 2. Veri Toplama
- [ ] 2.1. GDP büyüme verilerini topla
- [ ] 2.2. TÜFE enflasyon verilerini topla
- [ ] 2.3. İşsizlik oranı verilerini topla
- [ ] 2.4. Refah endeksi verilerini topla
- [ ] 2.5. Dijitalleşme endeksi verilerini topla
- [ ] 2.6. Europasous verilerini topla

### 3. Veri İşleme ve Kaydetme
- [ ] 3.1. Verileri JSON formatına dönüştür
- [ ] 3.2. data/oecd/ klasörüne kaydet
- [ ] 3.3. Veri kalitesini kontrol et

### 4. Doğrulama ve Raporlama
- [ ] 4.1. Veri doğruluğunu kontrol et
- [ ] 4.2. Toplanan kaynakları belgele
- [ ] 4.3. Sonuçları özetle

## Başarı Kriterleri
- Tüm istenen veri kategorileri toplanmalı
- Veriler doğru JSON formatında olmalı
- Kaynak bilgileri dahil edilmeli
- data/oecd/ klasörüne kaydedilmeli