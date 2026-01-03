// Kullanıcı Tercihleri için Type Definitions

export type ThemeMode = 'light' | 'dark'
export type Language = 'tr' | 'en'
export type WidgetSize = 'small' | 'medium' | 'large'
export type ChartType = 'line' | 'bar' | 'area' | 'pie'

// Grafik Tercihleri
export interface ChartPreferences {
  defaultChartType: ChartType
  showGrid: boolean
  enableZoom: boolean
  enableAnimations: boolean
  colorScheme: 'default' | 'green-red' | 'blue-orange' | 'purple-yellow'
}

// Widget Tercihleri
export interface WidgetPreferences {
  id: string
  visible: boolean
  size: WidgetSize
  order: number
  favorite: boolean
}

// Ses Tercihleri
export interface AudioPreferences {
  globalMute: boolean
  volume: number // 0-100
  autoPlay: boolean
  sectionMutes: {
    [key: string]: boolean
  }
  activeVoiceId: string
}

// Tema ve Görsel Ayarlar
export interface VisualPreferences {
  theme: ThemeMode
  language: Language
  pageScale: number // 90-110
  animationSpeed: 'slow' | 'normal' | 'fast'
  reducedMotion: boolean
}

// Dashboard Layout Tercihleri
export interface LayoutPreferences {
  compactMode: boolean
  sidebarCollapsed: boolean
  showTooltips: boolean
  quickAccessItems: string[]
}

// Filtre ve Veri Tercihleri
export interface DataPreferences {
  autoRefreshEnabled: boolean
  refreshInterval: number // dakika cinsinden
  defaultDateRange: number // gün cinsinden
  showChangePercentages: boolean
  decimalPlaces: number
}

// Ana Kullanıcı Tercihleri Interface
export interface UserPreferences {
  userId?: string
  chart: ChartPreferences
  widgets: WidgetPreferences[]
  audio: AudioPreferences
  visual: VisualPreferences
  layout: LayoutPreferences
  data: DataPreferences
  lastUpdated: string
  version: number
}

// Default Preferences
export const DEFAULT_PREFERENCES: UserPreferences = {
  chart: {
    defaultChartType: 'line',
    showGrid: true,
    enableZoom: true,
    enableAnimations: true,
    colorScheme: 'default'
  },
  widgets: [
    { id: 'market-indices', visible: true, size: 'large', order: 1, favorite: true },
    { id: 'tech-giants', visible: true, size: 'large', order: 2, favorite: true },
    { id: 'sector-performance', visible: true, size: 'medium', order: 3, favorite: false },
    { id: 'commodities', visible: true, size: 'medium', order: 4, favorite: false },
    { id: 'market-summary', visible: true, size: 'medium', order: 5, favorite: false }
  ],
  audio: {
    globalMute: false,
    volume: 70,
    autoPlay: false,
    sectionMutes: {},
    activeVoiceId: 'analist_erkek'
  },
  visual: {
    theme: 'dark',
    language: 'tr',
    pageScale: 100,
    animationSpeed: 'normal',
    reducedMotion: false
  },
  layout: {
    compactMode: false,
    sidebarCollapsed: false,
    showTooltips: true,
    quickAccessItems: ['market-indices', 'tech-giants']
  },
  data: {
    autoRefreshEnabled: true,
    refreshInterval: 5,
    defaultDateRange: 30,
    showChangePercentages: true,
    decimalPlaces: 2
  },
  lastUpdated: new Date().toISOString(),
  version: 1
}

// Preference Synchronization Status
export interface SyncStatus {
  isSyncing: boolean
  lastSyncTime: Date | null
  syncError: string | null
  hasPendingChanges: boolean
}
