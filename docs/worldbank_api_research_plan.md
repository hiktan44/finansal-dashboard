# World Bank API v2 Kalkınma Göstergeleri Toplama Araştırma Planı

## Görev Özeti
World Bank API v2 kullanarak Türkiye ve G20 ülkelerinin kalkınma göstergelerini toplama ve sonuçları JSON formatında kaydetme.

## Hedef Veriler
- **Türkiye**: GDP per capita, ithalat/ihracat, enflasyon (2020-2025)
- **G20 Ülkeleri**: Temel ekonomik göstergeler (2020-2025)

## Araştırma Adımları

### 1. World Bank API v2 Araştırması
- [x] 1.1 World Bank API v2 endpoint'lerini ve yapısını araştır
- [x] 1.2 Gerekli economic indicator kodlarını belirle:
  - GDP per capita: NY.GDP.PCAP.CD
  - İhracat: NE.EXP.GNFS.ZS
  - İthalat: NE.IMP.GNFS.ZS
  - Enflasyon: FP.CPI.TOTL.ZG
- [x] 1.3 G20 ülke kodlarını listele
- [x] 1.4 API rate limits ve veri formatlarını kontrol et

### 2. Türkiye Verilerini Toplama
- [ ] 2.1 Türkiye GDP per capita verisi (NY.GDP.PCAP.CD)
- [ ] 2.2 Türkiye ithalat/ihracat verileri
  - [ ] 2.2.1 İhracat (NE.EXP.GNFS.ZS veya TX.VAL.MRCH.CD.WT)
  - [ ] 2.2.2 İthalat (NE.IMP.GNFS.ZS veya TM.VAL.MRCH.CD.WT)
- [ ] 2.3 Türkiye enflasyon verisi (FP.CPI.TOTL.ZG)
- [ ] 2.4 Verileri 2020-2025 dönemine filtrele

### 3. G20 Ülkeleri Verilerini Toplama
- [ ] 3.1 G20 üye ülkelerini listele
- [ ] 3.2 Her ülke için temel ekonomik göstergeleri topla:
  - [ ] 3.2.1 GDP per capita (NY.GDP.PCAP.CD)
  - [ ] 3.2.2 İhracat (NE.EXP.GNFS.ZS)
  - [ ] 3.2.3 İthalat (NE.IMP.GNFS.ZS)
  - [ ] 3.2.4 Enflasyon (FP.CPI.TOTL.ZG)
- [ ] 3.3 Verileri 2020-2025 dönemine filtrele

### 4. Veri İşleme ve Kaydetme
- [ ] 4.1 Toplanan verileri JSON formatında birleştir
- [ ] 4.2 data/worldbank_indicators.json dosyasına kaydet
- [ ] 4.3 Veri yapısını organize et (ülke, yıl, indicator)
- [ ] 4.4 Eksik verileri işaretle

### 5. Veri Doğrulama ve Kalite Kontrol
- [ ] 5.1 Toplanan verilerin tutarlılığını kontrol et
- [ ] 5.2 Eksik yıl/ülke kombinasyonlarını belirle
- [ ] 5.3 Veri kaynaklarını kaydet

## Teknoloji Stack
- World Bank API v2
- Python (requests library için)
- JSON format

## Beklenen Çıktı
- data/worldbank_indicators.json dosyası
- Yapılandırılmış kalkınma göstergeleri verisi (2020-2025)

## Başarı Kriterleri
- Türkiye'nin tüm istenen göstergeleri toplanmış
- G20 ülkelerinin temel ekonomik göstergeleri toplanmış
- 2020-2025 dönemi verileri eksiksiz
- JSON formatında doğru yapıda kaydedilmiş