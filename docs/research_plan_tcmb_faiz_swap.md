# TCMB Faiz Oranları ve Swap Verileri Toplama Planı

## Görev Özeti
Türkiye Cumhuriyet Merkez Bankası'ndan ticari kredi faiz oranları (2007-2025) ve yurt içi swap işlemleri verilerini toplamak ve işlemek.

## Hedefler
- [x] 1. TCMB web sitesini keşfetmek ve veri portallarını tespit etmek (TAMAMLANDI)
- [x] 2. Ticari kredi faiz oranları verilerini bulmak (2007-2025) (TAMAMLANDI - EVDS: TP.KTF17.USD, TP.KTF17.EUR)
- [x] 3. Yurt içi swap işlemleri verilerini bulmak (TAMAMLANDI - PDF indirildi, ilk 10 sayfa okundu)
- [ ] 4. Excel/PDF dosyalarını tespit etmek ve indirmek
- [ ] 5. İndirilen dosyaları parse etmek
- [ ] 6. Verileri standart JSON formatında kaydetmek: `{"credit_rates": {tarih: değer}, "swap_amounts": {tarih: değer}}`
- [ ] 7. Kalite kontrol ve doğrulama

## Veri Kaynakları
- Ana kaynak: www.tcmb.gov.tr
- Faiz oranları: İstatistik > Faiz Oranları
- Swap verileri: İstatistik > Para Piyasası İşlemleri

## Teknik Detaylar
- Çıktı dizini: `data/tcmb_verileri/`
- JSON dosyası: `tcmb_faiz_swap_2025.json`
- Dosya formatları: Excel (.xlsx, .xls), PDF

## Başlangıç Zamanı
2025-11-09 17:50:12