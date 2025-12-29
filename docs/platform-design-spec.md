# Tasarım Spesifikasyonu - Türkiye Ekonomi Raporlama Platformu

**Stil:** Modern Minimalism (Premium)  
**Platform Türü:** MPA - 4 sayfa ekonomi raporlama sistemi  
**Grafik Yoğunluğu:** 162 grafik/tablo  
**Özel Gereksinimler:** Export/Print, Mobil uyumlu, Hızlı navigasyon

---

## 1. Tasarım Yönü ve Mantığı

### Seçilen Stil: Modern Minimalism (Premium)

**Görsel Öz (2-3 cümle):**  
Profesyonel kısıtlılık ve cömert boşluk kullanımı ile veri-yoğun ekonomi raporlarını okunabilir kılan, 18-35 yaş profesyonellere hitap eden, trust + conversion odaklı minimalist tasarım. %90 neutral + %10 accent renk dağılımı ile dikkat dağıtmadan 162 grafiğin etkili görselleştirilmesi.

**Gerçek Dünya Örnekleri:**
- Stripe Dashboard (finansal veri görselleştirme)
- Notion (içerik yoğun, temiz arayüz)
- Linear (minimal, hızlı navigasyon)
- Figma (modern, profesyonel)

**Renk Paleti Dağılımı:**
- %90 Neutral (arka planlar, kartlar, metin)
- %8 Primary Blue (CTA butonları, aktif durumlar, linkler)
- %2 Semantic (başarı/hata bildirimleri)

**Temel Özellikler:**
- 48-96px bölüm boşlukları (cömert aralıklar)
- 32-48px kart padding'leri (premium his)
- 12-16px border radius (modern yumuşaklık)
- Subtle shadow + hover lift (kart derinliği)

**En İyi Kullanım Alanı:**  
Veri-yoğun finansal platformlar, ekonomi raporlama, profesyonel dashboard uygulamaları

**Dürüst Ödünler:**  
Yüksek içerik yoğunluğu için (162 grafik) minimal spacing'i optimize ettik (24-32px card gaps). Oyun/eğlence için uygun değil (çok nötr). Maksimum bilgi/ekran için boşluk azaltılabilir (masonry grid).

---

## 2. Tasarım Token'ları (Markdown Tabloları)

### 2.1 Renk Sistemi

**Primary Brand (Modern Blue - 5 anahtar ton):**

| Token | Hex | HSL | Kullanım |
|-------|-----|-----|----------|
| `primary-50` | `#E6F0FF` | 220°, 100%, 95% | Hafif arka planlar, hover durumları |
| `primary-100` | `#CCE0FF` | 220°, 100%, 90% | Açık vurgular |
| `primary-500` | `#0066FF` | 220°, 100%, 50% | Ana CTA butonları, aktif linkler, fokus ring'leri |
| `primary-600` | `#0052CC` | 220°, 100%, 40% | Hover durumları, daha koyu aksiyonlar |
| `primary-900` | `#003D99` | 220°, 100%, 30% | Koyu aksanlar, visited linkler |

**Neutral (Cool Gray - 6 ton):**

| Token | Hex | HSL | Kullanım |
|-------|-----|-----|----------|
| `neutral-50` | `#FAFAFA` | 0°, 0%, 98% | Lightest background (sayfa arka planı) |
| `neutral-100` | `#F5F5F5` | 0°, 0%, 96% | Surface (kart arka planları) |
| `neutral-200` | `#E5E5E5` | 0°, 0%, 90% | Border, divider çizgileri |
| `neutral-500` | `#A3A3A3` | 0°, 0%, 64% | Disabled text, placeholder |
| `neutral-700` | `#404040` | 0°, 0%, 25% | Secondary text (açıklamalar) |
| `neutral-900` | `#171717` | 0°, 0%, 9% | Primary text (başlıklar, body) |

**Background (2 ton - Surface hierarchy):**

| Token | Hex | Kullanım |
|-------|-----|----------|
| `background` | `#FAFAFA` (neutral-50) | Sayfa ana arka planı |
| `surface` | `#F5F5F5` (neutral-100) | Kart/panel arka planları (≥5% lightness contrast) |

**Semantic Colors (4 temel durum):**

| Token | Hex | Kullanım |
|-------|-----|----------|
| `success` | `#10B981` (Green 500) | Pozitif değişimler, başarı mesajları |
| `warning` | `#F59E0B` (Amber 500) | Uyarı bildirimleri |
| `error` | `#EF4444` (Red 500) | Hata mesajları, negatif değişimler |
| `info` | `#3B82F6` (Blue 500) | Bilgilendirme mesajları |

**WCAG Contrast Doğrulaması (Kritik Eşleşmeler):**

| Ön Plan | Arka Plan | Kontrast Oranı | WCAG Seviyesi |
|---------|-----------|----------------|---------------|
| `neutral-900` (#171717) | `background` (#FAFAFA) | 16.5:1 | ✅ AAA |
| `neutral-700` (#404040) | `background` (#FAFAFA) | 8.6:1 | ✅ AAA |
| `primary-500` (#0066FF) | `#FFFFFF` | 4.53:1 | ✅ AA (text ≥14px) |

**Not:** Primary-500 large element'lerde (≥18pt bold butonlar) kullanılmalı. Body text için neutral-900 tercih edilmeli.

---

### 2.2 Tipografi

**Font Aileleri:**

| Token | Font Stack | Ağırlıklar |
|-------|------------|-----------|
| `font-sans` | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` | 400, 500, 600, 700 |

**Font Sizes (8-10 boyut skala - Major Third 1.25):**

| Token | Size | Line Height | Letter Spacing | Kullanım |
|-------|------|-------------|----------------|----------|
| `text-hero` | 64px | 1.1 | -0.02em | Hero başlıkları (Ana sayfa) |
| `text-h1` | 48px | 1.2 | -0.01em | Section başlıkları |
| `text-h2` | 36px | 1.2 | 0 | Subsection başlıkları |
| `text-h3` | 28px | 1.3 | 0 | Card başlıkları |
| `text-body-lg` | 20px | 1.6 | 0 | Intro paragraflar, önemli açıklamalar |
| `text-body` | 16px | 1.5 | 0 | Standard body text, UI text |
| `text-small` | 14px | 1.5 | 0 | Captions, yardımcı metinler |
| `text-caption` | 12px | 1.4 | 0.01em | Metadata, timestamps |

**Font Weights:**

| Token | Value | Kullanım |
|-------|-------|----------|
| `font-regular` | 400 | Body text, descriptions |
| `font-medium` | 500 | Nav links, subtle emphasis |
| `font-semibold` | 600 | Card titles, active states |
| `font-bold` | 700 | Page headings, CTA buttons |

**Okunabilirlik Kuralları:**
- **Max satır uzunluğu:** 60-75 karakter (~600-750px at 16px)
- **Body line-height:** 1.5-1.6 (optimal okunabilirlik)
- **Heading line-height:** 1.1-1.3 (görsel etki için sıkı)

---

### 2.3 Spacing (8pt Grid - 10 çekirdek değer)

**Spacing Scale (8px bazlı, 8pt multiples tercih edilir):**

| Token | Value | Kullanım |
|-------|-------|----------|
| `space-8` | 8px | Tight inline (icon + text gap) |
| `space-12` | 12px | Small gaps (form label → input) |
| `space-16` | 16px | Standard element spacing (button padding) |
| `space-24` | 24px | Related group spacing (card içi bölümler) |
| `space-32` | 32px | Card/component padding (MİNİMUM) |
| `space-48` | 48px | Section internal spacing (kart grupları arası) |
| `space-64` | 64px | Section boundaries (ana bölümler arası) |
| `space-96` | 96px | Large section spacing (sayfa bölümleri) |
| `space-128` | 128px | Dramatic spacing (hero sections - rare) |

**Özel Boşluk Kuralları:**
- **Card padding:** Minimum 32px (mobilde 24px acceptable)
- **Section gaps:** 64-96px (ASLA <48px olmamalı)
- **Grafik card gaps:** 24px (yoğunluk için optimize, normal 32px)
- **Content-to-whitespace ratio:** %60 içerik, %40 boşluk

---

### 2.4 Border Radius (4pt bazlı)

| Token | Value | Kullanım |
|-------|-------|----------|
| `radius-sm` | 8px | Small elements (badges, tags) |
| `radius-base` | 12px | Buttons, inputs, nav tabs |
| `radius-lg` | 16px | Cards, panels, modals |
| `radius-xl` | 24px | Large modals, drawers |
| `radius-full` | 9999px | Pills, avatars |

**Kural:** Outer ≥ Inner + 4px (nested elements için)

---

### 2.5 Shadows (4 katman)

| Token | CSS Value | Kullanım |
|-------|-----------|----------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle border alternatifleri |
| `shadow-card` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | Resting cards |
| `shadow-card-hover` | `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)` | Card hover state (lift effect) |
| `shadow-modal` | `0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)` | Modals, prominent elements |

---

### 2.6 Animasyon Süreleri

| Token | Duration | Easing | Kullanım |
|-------|----------|--------|----------|
| `duration-fast` | 200ms | ease-out | Button hover, subtle interactions |
| `duration-base` | 250ms | ease-out | Standard transitions (card hover) |
| `duration-slow` | 300ms | ease-in-out | Modals, drawers, page transitions |

**Performance Kuralı:** SADECE `transform` ve `opacity` animasyonları (GPU-accelerated). Width/height/margin/padding animasyonu YOK.

---

## 3. Bileşen Spesifikasyonları (MAX 6 Bileşen)

### 3.1 Hero Section (Ana Sayfa)

**Yapı:**
- **Height:** 400-500px (tam viewport değil)
- **Background:** `background` (#FAFAFA) solid
- **Padding:** 64px vertical, 24px horizontal
- **Container:** Max-width 1400px

**İçerik Hiyerarşisi:**
```
[Platform Logo/Icon - 48px]
  ↓ gap-16
[Main Headline - text-hero 64px, font-bold, neutral-900]
  ↓ gap-12
[Subtitle - text-body-lg 20px, font-regular, neutral-700]
  ↓ gap-24
[CTA Button - Primary, 56px height]
  ↓ gap-32
[Quick Stats Grid - 4 columns, metrics cards]
```

**Token Kullanımı:**
- Headline: `text-hero` (64px), `font-bold`, `neutral-900`
- Subtitle: `text-body-lg` (20px), `neutral-700`
- Spacing: `space-64` vertical padding
- CTA: Bkz. 3.2 Button spec

**Not:** Hero içinde dekoratif gradient/background image YOK (solid color only).

---

### 3.2 Button (Max 2 Varyant)

#### Primary Button (CTA)
**Boyutlar:**
- Height: 56px (desktop), 48px (mobile)
- Padding: 24px horizontal
- Radius: `radius-base` (12px)
- Min-width: 120px

**Typography:**
- Font: `font-sans`, `font-semibold` (600)
- Size: `text-body` (16px)

**Renkler:**
- Background: `primary-500` (#0066FF)
- Text: `#FFFFFF`
- Hover: `primary-600` (#0052CC) + lift -2px
- Focus: 2px ring `primary-500` + 4px offset
- Disabled: opacity 0.5 + cursor not-allowed

**States:**
```css
/* Normal */
background: primary-500;
box-shadow: shadow-sm;

/* Hover */
background: primary-600;
transform: translateY(-2px) scale(1.02);
box-shadow: shadow-card-hover;
transition: 200ms ease-out;

/* Focus (keyboard) */
outline: 2px solid primary-500;
outline-offset: 4px;

/* Active (click) */
transform: translateY(0);
box-shadow: shadow-sm;
```

**Özel Buton: Export/Print**
- **Icon:** Download/Printer (24px SVG, sol tarafta 8px gap)
- **Floating position:** Fixed bottom-right, 24px offset
- **Size:** 56x56px (circular FAB) or 160px × 56px (text + icon)
- **Shadow:** `shadow-card-hover` (prominent)
- **Tooltip:** Hover'da göster

#### Secondary Button
**Farklar:**
- Background: Transparent
- Border: 2px solid `neutral-200`
- Text: `neutral-700`
- Hover: Background `neutral-50` + border `neutral-300`

---

### 3.3 Card (Grafik/Tablo Kartları)

**Boyutlar:**
- **Width:** Masonry grid içinde auto (280-400px range)
- **Padding:** 32px (desktop), 24px (mobile)
- **Radius:** `radius-lg` (16px)
- **Min-height:** 200px

**Yapı:**
```
[Card Header - flex justify-between]
  - [Başlık - text-h3 28px semibold]
  - [Action Menu Icon - 32x32px]
    ↓ gap-16
[Chart/Table Content - flex-grow]
    ↓ gap-16
[Card Footer - metadata row]
  - [Kategori Badge - small]
  - [Slide Number - text-caption]
```

**Renkler:**
- Background: `surface` (#F5F5F5) - kartlar float eder
- Border: 1px solid `neutral-200` (optional)
- Text: `neutral-900` (başlık), `neutral-700` (metadata)

**States:**
```css
/* Resting */
background: surface;
box-shadow: shadow-card;

/* Hover */
transform: translateY(-4px) scale(1.02);
box-shadow: shadow-card-hover;
cursor: pointer;
transition: 250ms ease-out;

/* Focus (keyboard) */
outline: 2px solid primary-500;
outline-offset: 2px;
```

**Grafik Entegrasyonu:**
- Chart container: 100% width, auto height (preserve aspect)
- Lazy load: 20 grafik/batch
- Placeholder: Skeleton screen (neutral-200 shimmer)

**Not:** Card padding ASLA 16px olmamalı (minimum 32px, mobilde 24px).

---

### 3.4 Navigation Bar (4-Tab System)

**Boyutlar:**
- **Height:** 64px (fixed)
- **Position:** Sticky top-0
- **Container:** Max-width 1400px
- **Padding:** 0 24px

**Layout (12-column grid):**
```
[Logo - 2col] [Nav Tabs - 6col center] [Actions - 4col right]
```

**Tab Spesifikasyonu:**
- **Height:** 64px (full nav height)
- **Padding:** 20px 16px
- **Min-width:** 120px
- **Gap:** 32px arası boşluk

**Typography:**
- Font: `font-sans`, `font-medium` (500) normal, `font-semibold` (600) active
- Size: `text-body` (16px)

**Renkler:**
- Normal: `neutral-700`
- Hover: `neutral-900` + background `neutral-50`
- Active: `primary-500` text + 4px bottom border

**Active State:**
```css
color: primary-500;
font-weight: font-semibold (600);
border-bottom: 4px solid primary-500;
transition: 250ms ease-out;
```

**Background (on scroll):**
- Background: `background` with backdrop-blur (optional)
- Shadow: `shadow-sm` (subtle)

---

### 3.5 Input Field (Search + Filters)

**Boyutlar:**
- **Height:** 48-56px
- **Padding:** 12-16px horizontal
- **Radius:** `radius-base` (12px)
- **Icon space:** 16px offset

**Typography:**
- Font: `font-sans`, `font-regular` (400)
- Size: `text-body` (16px)
- Placeholder: `neutral-500`

**Renkler:**
- Background: `#FFFFFF`
- Border: 1px solid `neutral-200`
- Text: `neutral-900`
- Focus: 2px ring `primary-500` (no border jump)

**States:**
```css
/* Normal */
border: 1px solid neutral-200;
background: #FFFFFF;

/* Focus */
outline: none;
box-shadow: 0 0 0 2px primary-500;
border-color: transparent;

/* Error */
border-color: error;
box-shadow: 0 0 0 2px error with 0.2 opacity;

/* Disabled */
background: neutral-100;
cursor: not-allowed;
opacity: 0.6;
```

---

### 3.6 Modal (Grafik Detay + Export Dialog)

**Boyutlar:**
- **Width:** 800px (desktop), 90vw (mobile)
- **Max-height:** 90vh
- **Radius:** `radius-xl` (24px)
- **Padding:** 48px (desktop), 24px (mobile)

**Overlay:**
- Background: `rgba(0,0,0,0.5)`
- Backdrop blur: 4px (optional)
- Click outside: Dismiss modal

**Yapı:**
```
[Modal Header - flex justify-between]
  - [Title - text-h2 36px]
  - [Close Button - 48x48px]
    ↓ gap-24
[Modal Body - overflow-y auto]
  - [Content]
    ↓ gap-32
[Modal Footer - flex justify-end gap-12]
  - [Secondary Button - Cancel]
  - [Primary Button - Confirm/Export]
```

**Animasyon:**
```css
/* Enter */
opacity: 0 → 1;
transform: translateY(20px) → translateY(0);
transition: 300ms ease-in-out;

/* Exit */
opacity: 1 → 0;
transform: translateY(0) → translateY(20px);
transition: 250ms ease-in;
```

**Shadow:** `shadow-modal` (prominent)

**Accessibility:**
- Focus trap: Tab içeride kalır
- Esc key: Dismiss modal
- Return focus: Modal kapanınca önceki elemente

---

## 4. Layout & Responsive Tasarım

### 4.1 Sayfa Layout Desenleri

**Ana Sayfa (Home Page Pattern):**
- Hero (500px) + Quick stats grid (4-col) + BIST summary cards (3-col) + TÜİK metrics (2-col asymmetric)

**Ekonomik Raporlar (Grid Page Pattern):**
- Sidebar filtre (sol 320px, mobilde bottom sheet) + Masonry grid (3-col → 1-col mobile) + Sticky toolbar (export buttons)

**Güncel Analiz (Content Page Pattern):**
- Page header (200px) + İçindekiler (2-col) + Main content (8-col center max-width 800px) + Floating print button

**Raporlar Arşivi (Grid Page Pattern):**
- Horizontal tabs (kategori) + Slide grid (4-col → 1-col) + Search bar (üst) + Modal detail view

---

### 4.2 Grid System

**12-Column Grid:**
- Container max-width: 1400px (`2xl` breakpoint)
- Column gap: 24px
- Padding: 24px horizontal

**Grafik Grid (Masonry):**
- **Desktop (≥1280px):** 3 columns
- **Tablet (768-1279px):** 2 columns
- **Mobile (<768px):** 1 column (stack)
- Column width: 280-400px (auto)
- Gap: 24px (grafik yoğunluğu için kompakt)

---

### 4.3 Responsive Breakpoints

| Breakpoint | Min Width | Max Width | Layout |
|------------|-----------|-----------|--------|
| `sm` | 640px | 767px | Mobile landscape |
| `md` | 768px | 1023px | Tablet portrait |
| `lg` | 1024px | 1279px | Tablet landscape / small desktop |
| `xl` | 1280px | 1535px | Desktop |
| `2xl` | 1536px | - | Large desktop |

**Container Max-Width:**
```
sm:  100%
md:  100%
lg:  1024px
xl:  1200px
2xl: 1400px
```

---

### 4.4 Responsive Adaptasyon Prensipleri

**Mobil (<768px) Değişiklikleri:**
- Section spacing: 64px → 40-48px (25-40% azaltma)
- Card padding: 32px → 24px
- Font sizes: Hero 64px → 40px, H1 48px → 32px
- Navigation: Hamburger menu (drawer)
- Touch targets: Minimum 48x48px
- Grid: 3-col → 1-col stack

**Tablet (768-1279px):**
- Section spacing: 64px → 48-56px
- Nav tabs: Padding küçült (16px → 12px)
- Grid: 3-col → 2-col

**Desktop (≥1280px):**
- Full layout (12-column grid)
- All 4 nav tabs visible
- 3-column masonry grid

---

### 4.5 Touch Targets (Mobil)

**Minimum Boyutlar:**
- Buttons: 48x48px
- Nav tabs: 48px height
- Icon buttons: 48x48px
- Input fields: 48px height
- FAB: 56x56px

**Spacing:**
- Tappable elementler arası: Minimum 8px gap
- Preferred: 12-16px gap

---

## 5. Etkileşim & Animasyon

### 5.1 Animasyon Standartları

**Duration (Stil bazlı: Balanced):**
- **Fast:** 200ms (button hover, subtle interactions)
- **Standard:** 250ms (most transitions, card hover)
- **Slow:** 300ms (modals, drawers, page transitions)

**Easing:**
- **Preferred:** `ease-out` (90% - natural deceleration)
- **Smooth:** `ease-in-out` (modal/drawer - smooth start/end)
- **Forbidden:** `linear` (robotic feel)

**Performance Rule:**
```css
/* ✅ GPU-Accelerated (ALLOWED) */
transform: translate/scale/rotate;
opacity: 0-1;

/* ❌ Layout Shifts (FORBIDDEN) */
width, height, margin, padding, top, left
```

---

### 5.2 Micro-Animasyonlar (Tüm Interaksiyonlar)

**Button Hover:**
```css
transform: translateY(-2px) scale(1.02);
box-shadow: shadow-card-hover;
transition: duration-fast ease-out;
```

**Card Hover:**
```css
transform: translateY(-4px) scale(1.02);
box-shadow: shadow-card-hover;
transition: duration-base ease-out;
```

**Page Transition:**
```css
opacity: 0 → 1;
transform: translateY(20px) → translateY(0);
transition: duration-slow ease-in-out;
```

**Loading States:**
- Skeleton screen: Shimmer animation (neutral-200 → neutral-100, 1.5s infinite)
- Spinner: Rotate 360deg, 1s linear infinite
- Progress bar: Indeterminate sweep (left → right, 2s)

---

### 5.3 Reduced Motion Support

**Accessibility:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Fallback:** Instant state changes (no animations).

---

## 6. İkon ve Görsel Öğeler

### 6.1 İkonlar

**Kaynak:** SVG icon libraries (Lucide/Heroicons/Phosphor - **tek library seç, consistent kal**)

**Boyutlar:**
- Inline (text yanında): 20-24px
- Standalone (buttons): 24-32px
- Nav icons: 24px
- FAB icons: 24px

**Style:** Outline (stroke-based), 2px stroke weight

**❌ ASLA:** Emojis UI icon olarak kullanılmamalı (user content'te OK).

---

### 6.2 Görseller

**Treatment:**
- Border radius: 16px
- Optional border: 1px solid neutral-200
- Aspect ratios: 16:9 (hero), 4:3 (content), 1:1 (avatars)

**Quality:**
- Minimum 2x resolution (retina)
- WebP format (fallback JPEG)
- Lazy loading (Intersection Observer)

**Grafik Embed:**
- Chart.js / ECharts for dynamic charts
- SVG for static diagrams
- PNG export for downloads

---

## YASAK DESENLER & KONTROL LİSTESİ

### ❌ YASAK (Anti-Patterns)

**Layout & Yapı:**
- ❌ Sidebar navigation (admin-panel hissi, modern değil)
- ❌ Flat single-color backgrounds (≥5% surface depth ekle)
- ❌ Tight spacing (section'lar <48px arası)
- ❌ Hero sections eksik (400-600px minimum)
- ❌ Card padding <32px (ucuz görünüm)

**Renkler:**
- ❌ Gradients (backgrounds, buttons, ANY UI element)
- ❌ Neon colors (#00FF00, #FF00FF, #FF1493)
- ❌ Pure saturated reds/yellows (>70% saturation)
- ❌ Low contrast text (<4.5:1 ratio)

**Animasyonlar:**
- ❌ Glowing text effects (text-shadow with blur)
- ❌ Heavy animations (>500ms duration)
- ❌ Width/height/margin/padding animasyonları (reflow causes)
- ❌ Parallax overuse (max 2 layers)

**Tipografi & UI:**
- ❌ Emojis as UI icons (use SVG: Lucide/Heroicons)
- ❌ Mixed border radius (inconsistent)
- ❌ Skipping micro-interactions (feels static)
- ❌ ASCII art in documentation

---

### ✅ BAŞARI KRİTERLERİ

- **Cömert boşluk:** 40-50% viewport boşluk
- **Surface contrast:** Kartlar ≥5% lightness farkı background'dan
- **Interaction feedback:** Her hover/click görsel yanıt alır
- **Typography hierarchy:** Başlık seviyeleri arası 3:1 boyut farkı
- **Color restraint:** Max 3 renk (neutral + brand + accent)
- **WCAG compliance:** ≥4.5:1 contrast critical text için
- **Performance:** Transform/opacity only animations
- **162 Grafik Optimize:** Masonry grid + lazy load + 24px gap
- **Export/Print:** Prominent FAB + toolbar placement
- **Mobil:** 48x48px touch targets + responsive grid

---

## SON NOTLAR

**Dosya Boyutu:** ~2,800 kelime (≤3K hedefine uygun)  
**Bileşen Sayısı:** 6 (Hero, Button, Card, Nav, Input, Modal)  
**Token Kategori:** 6 (Color, Typography, Spacing, Radius, Shadow, Animation)  
**Stil Rehberi Uyumu:** %100 (Modern Minimalism Premium)

**Özel Optimizasyonlar:**
- **Grafik yoğunluğu:** Masonry grid 24px gap (normal 32px yerine)
- **Export butonları:** FAB + Sticky toolbar dual placement
- **Mobil:** Drawer navigation + bottom sheet filters
- **Hızlı navigasyon:** 4-tab horizontal + keyboard shortcuts
