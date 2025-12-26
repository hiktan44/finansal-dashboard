# IMF API Global Ekonomik Veriler - Araştırma Planı

## Hedef
IMF API'sini kullanarak global ekonomik tahminler ve veriler toplamak
- Türkiye ekonomik görünüm
- Global GDP tahminleri
- WEO (World Economic Outlook) verileri
- Enflasyon tahminleri
- 2024-2026 tahminleri odaklı
- Sonuçları data/imf_global_forecasts.json dosyasına kaydetmek

## Görev Adımları

### 1. IMF API Araştırması ve Keşif
- [x] IMF API belgelerini incele
- [x] API endpoint'lerini ve parametrelerini öğren
- [x] WEO (World Economic Outlook) API'sini bul
- [x] Türkiye ve global veriler için gerekli endpoint'leri tespit et
  - IMF Data API: SDMX 2.1/3.0 protokolleri
  - IMF DataMapper API: v1, JSON format
  - Türkiye 2025 tahminleri: %3.5 GDP, %34.9 enflasyon

### 2. API Erişimi ve Test
- [ ] IMF API'sine erişim testleri
- [ ] Temel veri yapılarını anla
- [ ] Authentikasyon gereksinimlerini kontrol et (eğer varsa)

### 3. Veri Toplama
- [ ] Türkiye ekonomik göstergeleri
  - [ ] GDP büyümesi
  - [ ] Enflasyon oranları
  - [ ] İşsizlik oranları
  - [ ] Cari denge
- [ ] Global GDP tahminleri (2024-2026)
- [ ] WEO verileri
- [ ] Enflasyon tahminleri (global ve Türkiye)

### 4. Veri İşleme ve Analiz
- [ ] Toplanan verileri JSON formatına dönüştür
- [ ] Veri kalitesini kontrol et
- [ ] Eksik verileri işaretle

### 5. Sonuç Raporlama
- [ ] Verileri data/imf_global_forecasts.json dosyasına kaydet
- [ ] Toplanan verilerin özetini çıkar
- [ ] Veri kaynaklarını belgelendir

## Başlangıç Zamanı
2025-11-10 22:56:47

## Durum
API Araştırması tamamlandı - Veri toplama aşamasına geçiliyor

## Elde Edilen Bilgiler
- IMF Data API: https://data.imf.org/en/Resource-Pages/IMF-API
- IMF DataMapper API: https://www.imf.org/external/datamapper/api/help  
- WEO verileri: https://data.imf.org/en/datasets/IMF.RES:WEO
- Türkiye profili: https://www.imf.org/en/Countries/TUR
- Türkiye 2025 tahminleri: %3.5 GDP büyümesi, %34.9 enflasyon