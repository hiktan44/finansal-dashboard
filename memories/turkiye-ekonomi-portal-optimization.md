# Türkiye Ekonomi Portalı - Optimizasyon ve Geliştirme

## Görev Başlangıcı
Tarih: 2025-11-07 21:56:00
Platform: https://ujfieoge8n2x.space.minimax.io
Klasör: /workspace/finansal-platform
Supabase: ihoxxlnzjdlanqwcdker

## Mevcut Durum
- Toplam: 162 grafik ve tablo (55 chart + 105 table)
- Gösterilen: Sadece 20 tane
- Kategoriler: 11 kategori tanımlı ama sidebar yok
- Dark Mode: Yok
- Mobil: Responsive sorunlar olabilir
- Cron Jobs: Yok

## Hedefler

### 1. Kategori Sidebar Sistemi
- [ ] Sol sidebar ekle
- [ ] 5 ana kategori: 'Küresel Ekonomik Göstergeler', 'Türkiye Ekonomik Verileri', 'Sektörel Analizler', 'Risk Göstergeleri', 'Forecasts'
- [ ] Kategori seçimi ile filtreleme
- [ ] Mobilde collapsible sidebar

### 2. Light/Dark Mode
- [ ] next-themes veya custom dark mode
- [ ] Toggle butonu header'da
- [ ] localStorage persistence
- [ ] Smooth transition

### 3. Tüm Verileri Göster (162 grafik/tablo)
- [ ] Pagination sistemi (20 item per page)
- [ ] "Daha Fazla Yükle" butonu
- [ ] Infinite scroll (optional)
- [ ] Loading states

### 4. Mobil Responsive
- [ ] Sidebar mobilde hamburger menu
- [ ] Touch-friendly butonlar
- [ ] Grid responsive (1 col mobile, 2 tablet, 3 desktop)
- [ ] Performance optimization

### 5. Zamanlı Veri Güncelleme
- [ ] Aylık veriler: Her ayın 1-3 günü
- [ ] Günlük veriler: Her sabah
- [ ] Haftalık veriler: Her Pazartesi
- [ ] Supabase cron jobs

## İlerleme
- [x] Phase 1: Kategori Sidebar + Dark Mode
  - ThemeProvider (next-themes) eklendi
  - CategorySidebar komponenti oluşturuldu
  - 5 ana kategori organize edildi
  - Header'a dark mode toggle eklendi
  - Tüm sayfalara dark mode class'ları eklendi
  - Mobilde collapsible sidebar
- [x] Phase 2: Pagination Sistemi
  - Infinite scroll mevcut (20'şer yükleme)
  - 162 grafik ve tablo gösteriliyor
- [x] Phase 3: Build ve Deploy
  - Deployment URL: https://1fkcr5nbaxmy.space.minimax.io
  - Test tamamlandı: 3 hata tespit edildi
- [ ] Phase 4: Bug Fixes (DEVAM EDİYOR)
  - [x] GSYİH veri hatası düzeltildi: getGDPData import edildi
  - [x] Sidebar toggle: md:hidden yapıldı (lg:hidden'dan değişti)
  - [x] Mobile hamburger menu: bg-gray-100 eklendi, daha görünür hale getirildi
  - [x] Infinite scroll: window scroll event'i implementasyonu
  - [ ] Debug test gerekli: scroll log'ları ve mobile button görünürlüğü
  
## KRİTİK PLATFORM REBUILDİNG GEREKİYOR
Kullanıcı raporladı: Platform %80 boş, veriler yüklenmiyor

### KRİTİK SORUNLAR:
1. ❌ Küresel Ekonomik Göstergeler: 0 ülke (7 ülke olmalı)
2. ❌ Ekonomik Raporlar: 0 grafik (304+ grafik olmalı)  
3. ❌ Forecast bölümü: tamamen boş
4. ❌ Dil değişimi sistemi: çalışmıyor
5. ❌ Paylaş butonu: eksik/çalışmıyor
6. ❌ Mobil responsive: bozuk
7. ❌ Tüm veriler: boş

### REBUILDING PLANİ:
## DEBUG BULGULARI (SON TEST)
URL: https://gfy0aimetp62.space.minimax.io

### KRİTİK BUG BULGUSİ: KÜRESEL EKONOMİK GÖSTERGELER
✅ **fetchMacroData**: 32 veri döndürüyor 
❌ **groupDataByCountry**: ülke sayısı 0 - timing issue
❌ **Sebep**: useEffect dependency race condition

**Console logları:**
- Error #11: fetchMacroData başlatılıyor
- Error #17: ülke sayısı: 0 (ilk çalışma)
- Error #18-19: 32 veri geldi
- Error #20: groupDataByCountry tekrar çalışıyor (kesildi)

### MOBILE HAMBURGER MENU
❌ **Bulunamadı**: Responsive design CSS çalışmıyor
❌ **Sebep**: Media queries veya breakpoint sorunu

### INFINITE SCROLL DEBUG
❌ **"Scroll Debug" logları yok**: Function çalışmıyor veya koşul sağlanmıyor

### ÇÖZECEĞİM SORUNLAR:
1. MacroEconomic useEffect dependency düzelt
2. Mobile responsive CSS debug
3. Infinite scroll threshold düzelt
- [ ] Phase 5: Cron Jobs
- [ ] Phase 6: Final Test
