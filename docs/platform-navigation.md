# Navigation Spesifikasyonu - Türkiye Ekonomi Raporlama Platformu

## 1. Navigation Mimarisi

### Yapı: 4 Sekmeli Fixed Header Navigation (MPA)

**Navigation Tipi:** Horizontal Tabs
**Sebep:** Modern Minimalism Premium rehberi - "Horizontal navigation (modern) not sidebar (admin-panel feel)"

**Sayfa Sayısı:** 4 ana sayfa
- Ana Sayfa (/)
- Ekonomik Raporlar (/reports)
- Güncel Analiz (/analysis)
- Raporlar Arşivi (/archive)

---

## 2. Header Navigation Spesifikasyonu

### Boyutlar
- **Height:** 64px (sabit - Modern Minimalism Premium baseline)
- **Container Max-Width:** 1400px (2xl breakpoint)
- **Padding:** 0 24px (horizontal)
- **Position:** Sticky top-0 (scroll'da sabit kalır)

### Layout Yapısı (12-column grid)
```
[Logo - 2 col] [Nav Links - 6 col center] [Actions - 4 col right]
```

**Logo Bölümü (Sol - 2 col):**
- Logo height: 32px
- Logo + text kombine
- Tıklanabilir (home'a dönüş)

**Navigation Links (Merkez - 6 col):**
- 4 tab yatay dizilim
- Her tab: Min 120px genişlik
- Gap: 32px arası boşluk
- Merkez hizalı (justify-center)

**Action Buttons (Sağ - 4 col):**
- Search icon (48x48px touch target)
- Settings icon (48x48px)
- Mobile: Hamburger menu (48x48px)

---

## 3. Navigation Tab Spesifikasyonu

### Tab Yapısı (Her bir tab için)

**Boyutlar:**
- Height: 64px (full nav height)
- Padding: 20px 16px (vertical horizontal)
- Min-width: 120px
- Touch target: 48x48px minimum

**Typography:**
- Font size: 16px
- Font weight: 
  - Normal state: Medium 500
  - Active state: Semibold 600
- Letter spacing: 0
- Line height: 1.5

**Renkler (Token referansları):**
- Normal state: `--color-neutral-700` (secondary text)
- Hover state: `--color-neutral-900` (primary text)
- Active state: `--color-primary-500` (brand color)

**Active State İndikatörü:**
- Border bottom: 4px solid
- Color: `--color-primary-500`
- Position: Absolute bottom 0
- Transition: 250ms ease-out

**Hover State:**
- Background: `--color-neutral-50` (5% lightness contrast)
- Border radius: 8px (subtle)
- Transition: 200ms ease-out

---

## 4. Tab Etiketleri ve Rotalar

### Tab 1: Ana Sayfa
- **Label (TR):** "Ana Sayfa"
- **Label (EN):** "Home"
- **Route:** `/`
- **Icon:** Home (24px SVG - Lucide/Heroicons)
- **Description:** Canlı piyasa verileri

### Tab 2: Ekonomik Raporlar
- **Label (TR):** "Ekonomik Raporlar"
- **Label (EN):** "Economic Reports"
- **Route:** `/reports`
- **Icon:** BarChart3 (24px SVG)
- **Description:** 162 grafik/tablo görüntüleme

### Tab 3: Güncel Analiz
- **Label (TR):** "Güncel Analiz"
- **Label (EN):** "Current Analysis"
- **Route:** `/analysis`
- **Icon:** FileText (24px SVG)
- **Description:** Ekonomi değerlendirmesi

### Tab 4: Raporlar Arşivi
- **Label (TR):** "Raporlar Arşivi"
- **Label (EN):** "Reports Archive"
- **Route:** `/archive`
- **Icon:** Archive (24px SVG)
- **Description:** 259 slide tarama

---

## 5. Mobile Navigation (< 768px)

### Hamburger Menu Yapısı

**Trigger Button:**
- Size: 48x48px (touch target)
- Icon: Menu (24px)
- Position: Sağ üst
- Animasyon: Hamburger → X (300ms)

**Drawer Pattern:**
- Type: Slide-in from right
- Width: 280px
- Height: 100vh
- Background: `--color-background`
- Shadow: `--shadow-modal`
- Overlay: rgba(0,0,0,0.5)

**Mobile Menu İçeriği:**
```
[Logo + Close button]
─────────────────
[4 Navigation Links]
  - Ana Sayfa
  - Ekonomik Raporlar
  - Güncel Analiz
  - Raporlar Arşivi
─────────────────
[Search]
[Settings]
```

**Mobile Tab Boyutları:**
- Height: 56px
- Padding: 16px 24px
- Full-width
- Border-bottom: 1px solid neutral-200

**Mobile Active State:**
- Background: `--color-primary-50`
- Left border: 4px solid primary-500
- Icon + text color: primary-500

---

## 6. Keyboard Navigation

### Shortcut Tuşları
- **Alt + 1:** Ana Sayfa
- **Alt + 2:** Ekonomik Raporlar
- **Alt + 3:** Güncel Analiz
- **Alt + 4:** Raporlar Arşivi
- **Ctrl/Cmd + K:** Global arama
- **Esc:** Modal/drawer kapat

### Tab Navigation
- **Tab key:** Tabs arası hareket
- **Enter/Space:** Tab aktivasyonu
- **Arrow keys:** Tab'lar arası geçiş
- **Home/End:** İlk/son tab

**Focus State:**
- Border: 2px solid primary-500
- Outline: none (custom ring kullan)
- Ring: 2px primary-500 with 4px offset
- Border radius: 8px

---

## 7. Search Functionality

### Global Search Button
- **Position:** Header sağ (action buttons)
- **Size:** 48x48px
- **Icon:** Search (24px)
- **Trigger:** Click veya Ctrl+K

### Search Modal Pattern
**Boyutlar:**
- Width: 600px (desktop)
- Height: Auto (max 80vh)
- Position: Center screen
- Modal backdrop: rgba(0,0,0,0.5)

**Search Input:**
- Height: 56px
- Border radius: 12px
- Icon: Sol 16px offset
- Placeholder: "Grafik, tablo, slide ara..."
- Font size: 16px
- Autofocus: true

**Search Results:**
- Max 10 result per category
- Categories: Grafikler, Tablolar, Slide'lar, Sayfalar
- Result card height: 72px
- Keyboard navigation: Arrow keys
- Selection: Enter key

---

## 8. Breadcrumbs (Sayfa İçi Navigation)

### Kullanım Yerleri
- Güncel Analiz: Bölüm → Alt bölüm
- Raporlar Arşivi: Kategori → Slide detayı
- Ekonomik Raporlar: Kategori → Grafik detayı

### Breadcrumb Spesifikasyonu
**Position:** Page header altında (16px gap)
**Height:** 32px
**Typography:** 14px Regular

**Yapı:**
```
[Home Icon] > [Kategori] > [Mevcut Sayfa]
```

**Separator:**
- Icon: ChevronRight (16px)
- Color: neutral-400
- Margin: 0 8px

**Link States:**
- Normal: neutral-600 + underline on hover
- Current: neutral-900 + no underline
- Hover: neutral-900 + smooth transition 200ms

---

## 9. Hızlı Erişim Özellikleri

### Floating Action Buttons (FAB)

**Export/Print FAB:**
- **Position:** Fixed bottom-right
- **Size:** 56x56px
- **Offset:** 24px from edges
- **Icon:** Download/Print (24px)
- **Shadow:** `--shadow-card-hover`
- **Color:** primary-500 background, white icon
- **Hover:** Scale(1.05) + deeper shadow
- **Tooltip:** Hover'da göster (sol tarafta)

**Back to Top FAB:**
- **Position:** Fixed bottom-right (above export FAB if both exist)
- **Size:** 48x48px
- **Trigger:** Scroll > 500px
- **Icon:** ChevronUp (24px)
- **Animation:** Fade in/out 300ms
- **Behavior:** Smooth scroll to top

---

## 10. Page Transitions

### Route Değişimi Animasyonları

**Fade Transition (Default):**
- Duration: 250ms
- Easing: ease-out
- Opacity: 0 → 1

**Slide Transition (Modal):**
- Duration: 300ms
- Easing: ease-in-out
- Transform: translateY(20px) → translateY(0)

**Loading State:**
- Skeleton screens (ilk 300ms)
- Progress bar (üst nav altında, 2px height)
- Color: primary-500
- Animation: Indeterminate (left-to-right sweep)

---

## 11. Navigation States

### Loading State
- Tab disabled: opacity 0.5
- Cursor: not-allowed
- Spinner: 20px icon (neutral-400)

### Error State
- Toast notification (top-right)
- Auto-dismiss: 5 saniye
- Retry button

### Success State (Route değişimi)
- Instant feedback (200ms içinde)
- Active state güncelleme
- Scroll to top

---

## 12. Accessibility (A11y)

### ARIA Labels
```html
<nav aria-label="Ana navigasyon">
  <a href="/" aria-current="page">Ana Sayfa</a>
  <a href="/reports">Ekonomik Raporlar</a>
  <a href="/analysis">Güncel Analiz</a>
  <a href="/archive">Raporlar Arşivi</a>
</nav>
```

### Screen Reader Support
- Landmark roles: `<nav role="navigation">`
- Skip to content link (ilk tab stop)
- Active page announcement
- Keyboard shortcut hints

### Focus Management
- Focus trap: Modal/drawer içinde
- Focus return: Modal kapanınca önceki elemente dön
- Focus visible: Clear indicator (2px ring)

---

## 13. Responsive Navigation Breakpoints

### Desktop (1280px+)
- Full horizontal nav
- All 4 tabs visible
- Logo + Nav + Actions (3-section layout)

### Tablet (768px - 1279px)
- Horizontal nav korunur
- Tab padding küçültülür (12px)
- Font size: 15px

### Mobile (<768px)
- Hamburger menu
- Drawer navigation
- Logo + Hamburger + Search (2-section layout)
- Full-screen overlay

---

## 14. Performance Optimizasyonu

### Navigation Loading
- Critical CSS: Inline nav styles
- SVG icons: Sprite sheet
- Font preload: İlk render'da hazır
- No layout shift: Fixed height (64px)

### Route Prefetching
- Hover intent: 100ms hover → prefetch
- Visible links: Intersection Observer
- Priority: Current route +1 level

### Smooth Scrolling
- Behavior: smooth
- Duration: 500ms
- Easing: ease-in-out
- Disable: `prefers-reduced-motion`

---

## 15. Kod Örneği (Pseudo-code)

```tsx
<Header className="h-64 sticky top-0 bg-background shadow-sm z-50">
  <Container maxWidth="2xl">
    <Flex justify="between" items="center" h="64">
      
      {/* Logo */}
      <Link to="/" className="flex items-center gap-8">
        <Logo height="32" />
        <Text size="18" weight="600">Ekonomi Platformu</Text>
      </Link>

      {/* Desktop Nav */}
      <Nav className="hidden md:flex gap-32">
        <NavLink to="/" active={currentPath === '/'}>
          <Icon name="home" size="24" />
          Ana Sayfa
        </NavLink>
        <NavLink to="/reports">
          <Icon name="bar-chart" size="24" />
          Ekonomik Raporlar
        </NavLink>
        <NavLink to="/analysis">
          <Icon name="file-text" size="24" />
          Güncel Analiz
        </NavLink>
        <NavLink to="/archive">
          <Icon name="archive" size="24" />
          Raporlar Arşivi
        </NavLink>
      </Nav>

      {/* Actions */}
      <Flex gap="8">
        <IconButton icon="search" size="48" onClick={openSearch} />
        <IconButton icon="settings" size="48" onClick={openSettings} />
        <IconButton 
          icon="menu" 
          size="48" 
          className="md:hidden"
          onClick={toggleMobileMenu} 
        />
      </Flex>

    </Flex>
  </Container>
</Header>
```

---

## SON NOTLAR

**✅ Modern Minimalism Premium Uyumu:**
- Horizontal navigation (sidebar değil)
- 64px header height (rehber baseline)
- 48x48px touch targets (mobil uyumlu)
- 16px nav font size (rehber standart)
- 12px border radius (rehber: 12-16px)
- Subtle hover effects (200-250ms)
- SVG icon only (emoji yok)

**✅ Hızlı Navigasyon Özellikleri:**
- Keyboard shortcuts (Alt+1/2/3/4)
- Global search (Ctrl+K)
- Breadcrumbs (sayfa içi konum)
- Back to top FAB
- Route prefetching

**✅ Mobil Uyumluluk:**
- Hamburger drawer (<768px)
- 48x48px minimum touch targets
- Swipe gestures (drawer açma/kapama)
- Full-screen overlay
- Bottom sheet action menus
