# İçerik Yapısı Planı - Türkiye Ekonomi Raporlama Platformu

## 1. Materyal Envanteri

### İçerik Dosyaları
- `data/pptx_analysis_result.json` (259 slide, 162 grafik/tablo, 12 bölüm)
- PPTX Bölümleri: Büyüme, Enflasyon, Bütçe, İşsizlik, Dış Borç, Dış Ticaret, Enerji, Para Arzı, Turizm, Döviz, CDS, KKM, Mevduat, Merkez Bankası, Swap, Faiz, Altın, vb.

### Görsel Varlıklar
- `imgs/` (9 finansal dashboard görseli - dekoratif kullanım)
- PPTX içi 162 grafik/tablo (content images - veriye bağlı)

### Mevcut Platform Verileri
- BIST hisseleri (1423 varlık)
- TÜİK makro veriler (TÜFE, ÜFE, İşsizlik, GSYİH)
- TCMB verileri (Döviz kurları, Rezervler)

## 2. Website Yapısı

**Tür:** MPA (Multi-Page Application)

**Gerekçe:** 
- 4 farklı sayfa, farklı kullanıcı ihtiyaçları
- 162 grafik/tablo (yüksek içerik yoğunluğu)
- 259 slide içerik (>3000 kelime)
- Farklı veri kaynakları (canlı + statik)
- Export/Print fonksiyonları (sayfa bazlı)

## 3. Sayfa Yapısı ve İçerik Haritası

### Sayfa 1: Ana Sayfa (`/`)
**Amaç:** Canlı piyasa verileri ve genel bakış

**İçerik Haritası:**

| Bölüm | Bileşen Deseni | Veri Dosyası | Çıkarılacak İçerik | Görsel Varlık (Sadece İçerik) |
|-------|----------------|--------------|-------------------|-------------------------------|
| Hero | Hero Pattern (400-600px) | Mevcut platform | Platform başlığı + alt başlık | - |
| BIST Özet | 4-sütun Kart Grid | Platform API | En aktif 12 hisse (fiyat, değişim) | - |
| TÜİK Göstergeler | 2-sütun Metrik Kartları | Platform API | TÜFE, ÜFE, İşsizlik, GSYİH | - |
| TCMB Kurları | 3-sütun Tablo | Platform API | USD/TRY, EUR/TRY, GBP/TRY (canlı) | - |
| Hızlı Erişim | 4-buton Grid | Statik | Raporlar, Analizler, Grafikler bağlantıları | - |

**Veri Türü:** Canlı (real-time API)
**Güncelleme:** Dakikalık (otomatik refresh)

---

### Sayfa 2: Ekonomik Raporlar (`/reports`)
**Amaç:** 162 grafik/tablo görüntüleme + export/print

**İçerik Haritası:**

| Bölüm | Bileşen Deseni | Veri Dosyası | Çıkarılacak İçerik | Görsel Varlık (Sadece İçerik) |
|-------|----------------|--------------|-------------------|-------------------------------|
| Filtre Sidebar | Sidebar Pattern (sol 320px) | `pptx_analysis_result.json` | 12 kategori + arama | - |
| Grafik Grid | Masonry Grid (3-col → 1-col mobile) | `pptx_analysis_result.json` slides array | 162 grafik: slide_number, title, chart.name | Embed grafik görselleri |
| Grafik Detay Modal | Modal Pattern | `pptx_analysis_result.json` | Chart.name, title, content | Tam ekran grafik |
| Export Araçları | Sticky Toolbar (üst 64px) | - | Export PDF, PNG, CSV, Excel butonları | - |

**Veri Yapısı:**
- Toplam: 162 grafik/tablo
- Kategoriler: Büyüme (8), Enflasyon (11), Bütçe (6), İşsizlik (4), Dış Borç (5), Dış Ticaret (10), vb.
- Her grafik: `{ slide_number, title, chart_type, chart_name }`

**Export Formatları:**
- PDF: Seçili grafikleri tek PDF
- PNG: Grafik tek tek indir
- CSV: Tablo verilerini export
- Excel: Tüm tablo verileri

---

### Sayfa 3: Güncel Analiz (`/analysis`)
**Amaç:** Statik ekonomi değerlendirmesi + PPTX içerik okuma

**İçerik Haritası:**

| Bölüm | Bileşen Deseni | Veri Dosyası | Çıkarılacak İçerik | Görsel Varlık (Sadece İçerik) |
|-------|----------------|--------------|-------------------|-------------------------------|
| Rapor Başlığı | Page Header (200px) | `pptx_analysis_result.json` slide 1 | Başlık, tarih, yazar | - |
| İçindekiler | 2-sütun Card Grid | `pptx_analysis_result.json` slide 3 | 2 bölüm, sayfa numaraları | - |
| Bölüm 1 | Content Pattern (8-col center) | slides 4-144 | 12 alt başlık + açıklamalar | İlgili grafikler |
| Bölüm 2 | Content Pattern (8-col center) | slides 145-259 | Öngörüler + tavsiyeler | İlgili tablolar |
| Okuma Progressi | Sticky Progress Bar (üst) | - | Scroll yüzdesi | - |
| Print Butonu | Sticky FAB (sağ alt) | - | Sayfayı PDF çıktı al | - |

**Veri Türü:** Statik (PPTX içeriği)
**Güncelleme:** Manuel (PPTX yenilendiğinde)

---

### Sayfa 4: Raporlar Arşivi (`/archive`)
**Amaç:** 259 slide tarama + kategori bazlı erişim

**İçerik Haritası:**

| Bölüm | Bileşen Deseni | Veri Dosyası | Çıkarılacak İçerik | Görsel Varlık (Sadece İçerik) |
|-------|----------------|--------------|-------------------|-------------------------------|
| Kategori Tabs | Horizontal Tabs (üst) | `pptx_analysis_result.json` | 12 kategori + "Tümü" | - |
| Slide Grid | 4-sütun Card Grid → 1-col mobile | `pptx_analysis_result.json` slides array | 259 slide: number, title, preview | Thumbnail preview |
| Slide Detay Modal | Modal Pattern | `pptx_analysis_result.json` | Full content, charts, tables | Tam içerik |
| Arama + Filtre | Search Bar + Dropdown | - | Slide numarası, başlık, içerik ara | - |
| Export Seçili | Sticky Toolbar | - | Seçili slide'ları PDF olarak indir | - |

**Veri Yapısı:**
- Toplam: 259 slide
- Filtreleme: Kategori, grafik varlığı, tablo varlığı
- Her slide: `{ slide_number, title, content[], charts[], tables[] }`

**Export Özellikleri:**
- Tek slide → PDF/PNG
- Çoklu seçim → Birleşik PDF
- Kategori bazlı → Tüm kategori PDF

---

## 4. İçerik Analizi

### Bilgi Yoğunluğu
**Yüksek (High)**
- 259 slide (>5000 kelime)
- 162 grafik/tablo
- 12 kategoride 30+ gösterge

### İçerik Dengesi
- **Grafikler:** 162 adet (~45%)
- **Tablolar:** Grafikler içinde
- **Metin:** 259 slide içerik (~40%)
- **Canlı Veri:** BIST + TÜİK + TCMB (~15%)

**İçerik Türü:** Veri-ağırlıklı (Data-driven)

---

## 5. Özel Tasarım Gereksinimleri

### Grafik Yoğunluğu (162 Grafik)
**Masonry Grid Kullanımı:**
- Column Width: 320px (desktop), 280px (tablet), 100% (mobile)
- Gap: 24px (düşük yoğunluk için kompakt)
- Preserve aspect ratio: true
- Lazy loading: 20 grafik/batch

**Görselleştirme Stratejisi:**
- Grafikler: Chart.js / ECharts embed
- Tablolar: Responsive HTML table
- Thumbnail: 280x200px preview (lazy load)
- Full view: Modal içinde tam boyut

### Export/Print Fonksiyonları
**Export Buton Konumları:**
- Ana Sayfa: Floating Action Button (sağ alt)
- Ekonomik Raporlar: Sticky Toolbar (üst)
- Güncel Analiz: Print button (sağ alt)
- Raporlar Arşivi: Sticky Toolbar (üst)

**Export Kütüphaneleri:**
- PDF: jsPDF + html2canvas
- PNG: html2canvas
- CSV: Papa Parse
- Excel: xlsx library

### Mobil Uyumluluk
**Responsive Breakpoints:**
- Desktop: 1280px+ (3-4 col grid)
- Tablet: 768-1279px (2 col grid)
- Mobile: <768px (1 col stack)

**Mobil Optimizasyonlar:**
- Touch hedefler: Minimum 48x48px
- Grafik taps: Modal açılım
- Swipe gestures: Slide/grafik geçişi
- Bottom sheet: Filtre + export seçenekleri

### Hızlı Navigasyon
**4 Sekmeli Sistem:**
- Fixed Header Navigation (64px)
- Horizontal Tabs: Ana Sayfa, Ekonomik Raporlar, Güncel Analiz, Raporlar
- Active state: Bold + 4px alt çizgi (primary color)
- Keyboard shortcuts: Alt+1/2/3/4

**Hızlı Erişim Özellikleri:**
- Quick search: Global arama (Ctrl+K)
- Breadcrumbs: Sayfa içi konum
- Jump to section: Anchor linkler
- Back to top: Floating button (scroll >500px)

---

## 6. Veri Akışı ve Entegrasyon

### Canlı Veri (Ana Sayfa)
**Kaynak:** Mevcut Platform API
- BIST hisseleri: WebSocket/REST API
- TÜİK verileri: REST API
- TCMB döviz: REST API
**Güncelleme:** 1 dakika interval

### Statik İçerik (Raporlar)
**Kaynak:** `pptx_analysis_result.json`
- Parse edilmiş PPTX içeriği
- Grafik metadata
- Tablo verileri
**Güncelleme:** Manuel PPTX yüklemesi

### Hibrit Veri (Güncel Analiz)
**Kaynak:** PPTX içeriği + Canlı veriler
- Statik metin: PPTX
- Güncel rakamlar: Platform API
**Güncelleme:** Dinamik data binding

---

## 7. Performans Optimizasyonu

### Grafik Lazy Loading
- Initial load: 20 grafik
- Scroll trigger: +20 grafik
- Placeholder: Skeleton screen
- Progressive enhancement: WebP → JPEG

### Code Splitting
- Route-based: Her sayfa ayrı chunk
- Component-based: Modal, Chart lazy import
- Vendor: Chart.js, jsPDF ayrı bundle
- Critical CSS: Inline first-paint

### Caching Stratejisi
- Service Worker: Offline support
- IndexedDB: Grafik metadata cache
- LocalStorage: Kullanıcı tercihleri
- CDN: Statik grafikler

---

## SON NOTLAR

**❌ Bu Dosyada YOK (Design Spec'te olacak):**
- Renk şemaları
- Tipografi seçimleri
- Spacing değerleri
- Hover efektleri
- Animasyon süreleri
- Border radius
- Shadow styles

**✅ Bu Dosyada VAR:**
- İçerik yapısı ve organizasyon
- Veri kaynakları ve path'ler
- Bileşen pattern isimleri (Hero, Grid, Modal)
- Export formatları ve araçları
- Responsive stratejisi (breakpoint mantığı)
- Sayfa amaçları ve kullanıcı akışları
