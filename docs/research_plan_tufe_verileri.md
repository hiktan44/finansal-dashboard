# TÜİK TÜFE Enflasyon Verileri Toplama Planı

## Görev: 2020 Ocak - 2025 Kasım Dönemi Aylık TÜFE Enflasyon Verileri

### Hedef Format
```json
{
  "dates": ["2020-01", "2020-02", ...],
  "values": [değer1, değer2, ...]
}
```

### Çıktı Dosyası
`data/tufe_verileri_2020_2025.json`

## Adım Adım İşlem Planı

### 1. TÜİK Web Sitesi Araştırması
- [x] 1.1. www.tuik.gov.tr ana sayfasını incele
- [x] 1.2. TÜFE verilerinin konumunu bul
- [x] 1.3. Tarihsel veri erişim sayfasını bul
- [x] 1.4. 2020-2025 dönemindeki mevcut veri kaynaklarını tespit et

### 2. Veri Kaynaklarını Tespit Etme
- [x] 2.1. Excel dosyalarını bul
- [x] 2.2. PDF raporlarını bul
- [x] 2.3. Doğrudan web sayfası verilerini kontrol et
- [x] 2.4. Veri indirme bağlantılarını listele

### 3. Veri İndirme ve Toplama
- [x] 3.1. Gerekli Excel/PDF dosyalarını indir
- [x] 3.2. Web sayfası verilerini extract et
- [x] 3.3. 2020 Ocak - 2025 Kasım dönemi verilerini filtrele

### 4. Veri İşleme ve Temizleme
- [x] 4.1. Excel dosyalarını parse et
- [x] 4.2. PDF dosyalarından veri çıkar
- [x] 4.3. Tarih formatlarını standartlaştır
- [x] 4.4. Eksik verileri tespit et ve işaretle
- [x] 4.5. Veri doğruluğunu kontrol et

### 5. Final Veri Oluşturma
- [x] 5.1. Verileri istenen formatta organize et
- [x] 5.2. JSON dosyasını oluştur
- [x] 5.3. Veri tamamlığını doğrula
- [x] 5.4. Son kontrolleri yap

### 6. Kalite Kontrolü
- [x] 6.1. Tarih aralığını doğrula (2020-01 - 2025-10)
- [x] 6.2. Veri sayısını kontrol et (70 ay verisi)
- [x] 6.3. JSON formatını doğrula
- [x] 6.4. Sample verileri manuel olarak kontrol et

## Notlar
- Tüm dosyalar `data/tufe_verileri/` dizininde saklanacak
- Orijinal kaynak dosyalar korunacak
- İşlem logları tutulacak