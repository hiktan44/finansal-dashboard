import React, { useState, useRef } from 'react'
import { 
  Settings, X, Download, Upload, RotateCcw, Save, Check, 
  AlertCircle, Palette, Volume2, Layout, BarChart3, Database,
  Eye, EyeOff, Moon, Sun, Globe, Sliders, ChevronDown, ChevronRight
} from 'lucide-react'
import { usePreferencesContext } from '../context/UserPreferencesContext'
import { ChartType, WidgetSize, ThemeMode } from '../types/preferences'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const {
    preferences,
    syncStatus,
    updateChartPreferences,
    updateAudioPreferences,
    updateVisualPreferences,
    updateLayoutPreferences,
    updateDataPreferences,
    updateWidgetPreferences,
    savePreferences,
    resetPreferences,
    exportPreferences,
    importPreferences
  } = usePreferencesContext()

  const [activeTab, setActiveTab] = useState<'visual' | 'chart' | 'audio' | 'widgets' | 'data' | 'layout'>('visual')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    visual: true,
    chart: false,
    audio: false,
    widgets: false,
    data: false,
    layout: false
  })

  if (!isOpen) return null

  const handleSave = async () => {
    setSaveStatus('saving')
    try {
      const success = await savePreferences()
      setSaveStatus(success ? 'saved' : 'error')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }

  const handleReset = () => {
    resetPreferences()
    setShowResetConfirm(false)
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        await importPreferences(file)
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch (error) {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 2000)
      }
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const tabs = [
    { id: 'visual', label: 'Görsel', icon: <Palette className="h-4 w-4" /> },
    { id: 'chart', label: 'Grafikler', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'audio', label: 'Ses', icon: <Volume2 className="h-4 w-4" /> },
    { id: 'widgets', label: 'Widget\'lar', icon: <Layout className="h-4 w-4" /> },
    { id: 'data', label: 'Veri', icon: <Database className="h-4 w-4" /> },
    { id: 'layout', label: 'Düzen', icon: <Sliders className="h-4 w-4" /> }
  ] as const

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Ayarlar</h2>
              <p className="text-blue-100 text-sm">Tercihlerinizi özelleştirin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Sync Status */}
        {syncStatus.hasPendingChanges && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-yellow-400 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Kaydedilmemiş değişiklikler var</span>
            </div>
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
            >
              {saveStatus === 'saving' ? 'Kaydediliyor...' : 'Şimdi Kaydet'}
            </button>
          </div>
        )}

        <div className="flex h-[calc(90vh-200px)]">
          {/* Sidebar Tabs */}
          <div className="w-48 bg-gray-900/50 border-r border-gray-700 p-4">
            <div className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {tab.icon}
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Visual Settings */}
            {activeTab === 'visual' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-white text-lg font-semibold mb-4 flex items-center space-x-2">
                    <Palette className="h-5 w-5" />
                    <span>Görsel Ayarlar</span>
                  </h3>

                  {/* Theme */}
                  <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
                    <label className="text-gray-300 text-sm font-medium mb-3 block">Tema</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => updateVisualPreferences({ theme: 'dark' })}
                        className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                          preferences.visual.theme === 'dark'
                            ? 'bg-blue-500 border-blue-400 text-white'
                            : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <Moon className="h-4 w-4" />
                        <span>Koyu</span>
                      </button>
                      <button
                        onClick={() => updateVisualPreferences({ theme: 'light' })}
                        className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                          preferences.visual.theme === 'light'
                            ? 'bg-blue-500 border-blue-400 text-white'
                            : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <Sun className="h-4 w-4" />
                        <span>Açık</span>
                      </button>
                    </div>
                  </div>

                  {/* Language */}
                  <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
                    <label className="text-gray-300 text-sm font-medium mb-3 block flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>Dil</span>
                    </label>
                    <select
                      value={preferences.visual.language}
                      onChange={(e) => updateVisualPreferences({ language: e.target.value as 'tr' | 'en' })}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="tr">Türkçe</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  {/* Page Scale */}
                  <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
                    <label className="text-gray-300 text-sm font-medium mb-3 block">
                      Sayfa Ölçeği: %{preferences.visual.pageScale}
                    </label>
                    <input
                      type="range"
                      min="90"
                      max="110"
                      step="5"
                      value={preferences.visual.pageScale}
                      onChange={(e) => updateVisualPreferences({ pageScale: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>90%</span>
                      <span>100%</span>
                      <span>110%</span>
                    </div>
                  </div>

                  {/* Animation Speed */}
                  <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
                    <label className="text-gray-300 text-sm font-medium mb-3 block">Animasyon Hızı</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['slow', 'normal', 'fast'] as const).map(speed => (
                        <button
                          key={speed}
                          onClick={() => updateVisualPreferences({ animationSpeed: speed })}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            preferences.visual.animationSpeed === speed
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {speed === 'slow' ? 'Yavaş' : speed === 'normal' ? 'Normal' : 'Hızlı'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reduced Motion */}
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-gray-300 text-sm font-medium">Azaltılmış Hareket</span>
                      <input
                        type="checkbox"
                        checked={preferences.visual.reducedMotion}
                        onChange={(e) => updateVisualPreferences({ reducedMotion: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      />
                    </label>
                    <p className="text-gray-400 text-xs mt-2">Animasyonları ve geçişleri azaltır</p>
                  </div>
                </div>
              </div>
            )}

            {/* Chart Settings */}
            {activeTab === 'chart' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-white text-lg font-semibold mb-4 flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Grafik Ayarları</span>
                  </h3>

                  {/* Default Chart Type */}
                  <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
                    <label className="text-gray-300 text-sm font-medium mb-3 block">Varsayılan Grafik Türü</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['line', 'bar', 'area', 'pie'] as ChartType[]).map(type => (
                        <button
                          key={type}
                          onClick={() => updateChartPreferences({ defaultChartType: type })}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            preferences.chart.defaultChartType === type
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {type === 'line' ? 'Çizgi' : type === 'bar' ? 'Çubuk' : type === 'area' ? 'Alan' : 'Pasta'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Scheme */}
                  <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
                    <label className="text-gray-300 text-sm font-medium mb-3 block">Renk Şeması</label>
                    <select
                      value={preferences.chart.colorScheme}
                      onChange={(e) => updateChartPreferences({ colorScheme: e.target.value as any })}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="default">Varsayılan</option>
                      <option value="green-red">Yeşil-Kırmızı</option>
                      <option value="blue-orange">Mavi-Turuncu</option>
                      <option value="purple-yellow">Mor-Sarı</option>
                    </select>
                  </div>

                  {/* Chart Options */}
                  <div className="bg-gray-700/30 rounded-lg p-4 space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-gray-300 text-sm font-medium">Grid Çizgilerini Göster</span>
                      <input
                        type="checkbox"
                        checked={preferences.chart.showGrid}
                        onChange={(e) => updateChartPreferences({ showGrid: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-gray-300 text-sm font-medium">Zoom Etkin</span>
                      <input
                        type="checkbox"
                        checked={preferences.chart.enableZoom}
                        onChange={(e) => updateChartPreferences({ enableZoom: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-gray-300 text-sm font-medium">Animasyonları Etkinleştir</span>
                      <input
                        type="checkbox"
                        checked={preferences.chart.enableAnimations}
                        onChange={(e) => updateChartPreferences({ enableAnimations: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Audio Settings */}
            {activeTab === 'audio' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-white text-lg font-semibold mb-4 flex items-center space-x-2">
                    <Volume2 className="h-5 w-5" />
                    <span>Ses Ayarları</span>
                  </h3>

                  {/* Global Mute */}
                  <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-gray-300 text-sm font-medium block">Global Sessize Alma</span>
                        <span className="text-gray-400 text-xs">Tüm sesleri kapat</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.audio.globalMute}
                        onChange={(e) => updateAudioPreferences({ globalMute: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      />
                    </label>
                  </div>

                  {/* Volume */}
                  <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
                    <label className="text-gray-300 text-sm font-medium mb-3 block">
                      Ses Seviyesi: %{preferences.audio.volume}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={preferences.audio.volume}
                      onChange={(e) => updateAudioPreferences({ volume: parseInt(e.target.value) })}
                      disabled={preferences.audio.globalMute}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Auto Play */}
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-gray-300 text-sm font-medium block">Otomatik Oynatma</span>
                        <span className="text-gray-400 text-xs">Sayfa yüklendiğinde sesi otomatik başlat</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.audio.autoPlay}
                        onChange={(e) => updateAudioPreferences({ autoPlay: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Widget Settings */}
            {activeTab === 'widgets' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-white text-lg font-semibold mb-4 flex items-center space-x-2">
                    <Layout className="h-5 w-5" />
                    <span>Widget Ayarları</span>
                  </h3>

                  <div className="space-y-3">
                    {preferences.widgets.map((widget) => (
                      <div key={widget.id} className="bg-gray-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => updateWidgetPreferences(widget.id, { visible: !widget.visible })}
                              className={`p-1 rounded ${widget.visible ? 'text-green-400' : 'text-gray-500'}`}
                            >
                              {widget.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                            <span className="text-white font-medium capitalize">
                              {widget.id.replace(/-/g, ' ')}
                            </span>
                          </div>
                          <button
                            onClick={() => updateWidgetPreferences(widget.id, { favorite: !widget.favorite })}
                            className={`text-yellow-400 ${!widget.favorite && 'opacity-30'} hover:opacity-100`}
                          >
                            {widget.favorite ? '★' : '☆'}
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          {(['small', 'medium', 'large'] as WidgetSize[]).map(size => (
                            <button
                              key={size}
                              onClick={() => updateWidgetPreferences(widget.id, { size })}
                              disabled={!widget.visible}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                widget.size === size
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {size === 'small' ? 'Küçük' : size === 'medium' ? 'Orta' : 'Büyük'}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Data Settings */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-white text-lg font-semibold mb-4 flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>Veri Ayarları</span>
                  </h3>

                  {/* Auto Refresh */}
                  <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
                    <label className="flex items-center justify-between cursor-pointer mb-3">
                      <div>
                        <span className="text-gray-300 text-sm font-medium block">Otomatik Yenileme</span>
                        <span className="text-gray-400 text-xs">Verileri otomatik güncelle</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.data.autoRefreshEnabled}
                        onChange={(e) => updateDataPreferences({ autoRefreshEnabled: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      />
                    </label>

                    {preferences.data.autoRefreshEnabled && (
                      <div>
                        <label className="text-gray-300 text-sm font-medium mb-2 block">
                          Yenileme Aralığı: {preferences.data.refreshInterval} dakika
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="60"
                          step="1"
                          value={preferences.data.refreshInterval}
                          onChange={(e) => updateDataPreferences({ refreshInterval: parseInt(e.target.value) })}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>1 dk</span>
                          <span>30 dk</span>
                          <span>60 dk</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Default Date Range */}
                  <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
                    <label className="text-gray-300 text-sm font-medium mb-3 block">
                      Varsayılan Tarih Aralığı: {preferences.data.defaultDateRange} gün
                    </label>
                    <input
                      type="range"
                      min="7"
                      max="365"
                      step="1"
                      value={preferences.data.defaultDateRange}
                      onChange={(e) => updateDataPreferences({ defaultDateRange: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>7 gün</span>
                      <span>180 gün</span>
                      <span>365 gün</span>
                    </div>
                  </div>

                  {/* Display Options */}
                  <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
                    <label className="flex items-center justify-between cursor-pointer mb-3">
                      <span className="text-gray-300 text-sm font-medium">Yüzde Değişimlerini Göster</span>
                      <input
                        type="checkbox"
                        checked={preferences.data.showChangePercentages}
                        onChange={(e) => updateDataPreferences({ showChangePercentages: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      />
                    </label>

                    <div>
                      <label className="text-gray-300 text-sm font-medium mb-2 block">
                        Ondalık Basamak Sayısı: {preferences.data.decimalPlaces}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="4"
                        step="1"
                        value={preferences.data.decimalPlaces}
                        onChange={(e) => updateDataPreferences({ decimalPlaces: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>0</span>
                        <span>2</span>
                        <span>4</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Layout Settings */}
            {activeTab === 'layout' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-white text-lg font-semibold mb-4 flex items-center space-x-2">
                    <Sliders className="h-5 w-5" />
                    <span>Düzen Ayarları</span>
                  </h3>

                  <div className="bg-gray-700/30 rounded-lg p-4 space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-gray-300 text-sm font-medium block">Kompakt Mod</span>
                        <span className="text-gray-400 text-xs">Daha az boşluk, daha fazla içerik</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.layout.compactMode}
                        onChange={(e) => updateLayoutPreferences({ compactMode: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-gray-300 text-sm font-medium block">Tooltip\'leri Göster</span>
                        <span className="text-gray-400 text-xs">Hover ipuçlarını etkinleştir</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.layout.showTooltips}
                        onChange={(e) => updateLayoutPreferences({ showTooltips: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900/50 border-t border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={exportPreferences}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
            >
              <Download className="h-4 w-4" />
              <span>Ayarları İndir</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
            >
              <Upload className="h-4 w-4" />
              <span>Ayarları Yükle</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>

          <div className="flex items-center space-x-3">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Sıfırla</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-red-400 text-sm">Emin misiniz?</span>
                <button
                  onClick={handleReset}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                >
                  Evet
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
                >
                  İptal
                </button>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors text-sm font-medium ${
                saveStatus === 'saved'
                  ? 'bg-green-500 text-white'
                  : saveStatus === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } disabled:opacity-50`}
            >
              {saveStatus === 'saving' && <Save className="h-4 w-4 animate-spin" />}
              {saveStatus === 'saved' && <Check className="h-4 w-4" />}
              {saveStatus === 'error' && <AlertCircle className="h-4 w-4" />}
              <span>
                {saveStatus === 'saving'
                  ? 'Kaydediliyor...'
                  : saveStatus === 'saved'
                  ? 'Kaydedildi'
                  : saveStatus === 'error'
                  ? 'Hata'
                  : 'Kaydet'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel
