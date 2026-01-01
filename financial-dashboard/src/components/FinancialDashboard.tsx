import React, { useState, useEffect } from 'react'
import MarketIndices from './MarketIndices'
import TechGiants from './TechGiants'
import SectorPerformance from './SectorPerformance'
import Commodities from './Commodities'
import MarketSummary from './MarketSummary'
import GlobalAudioControl from './GlobalAudioControl'
import SettingsPanel from './SettingsPanel'
import AIAnalysisPanel from './AIAnalysisPanel'
import AuthModal from './auth/AuthModal'
import FREDEconomicData from './FREDEconomicData'
import TurkishEconomicData from './TurkishEconomicData'
import ComparisonDashboard from './ComparisonDashboard'
import FonAnalizi from './FonAnalizi'
import GunlukAnaliz from './GunlukAnaliz'
import SectorHeatmap from './SectorHeatmap'
import ScenarioSimulator from './ScenarioSimulator'
import CorrelationMatrix from './CorrelationMatrix'
import Footer from './Footer'
import { Activity, TrendingUp, BarChart3, Coins, RefreshCw, WifiOff, Settings, LogIn, LogOut, User, Bell, Globe, MapPin, GitCompare, PieChart, Calendar } from 'lucide-react'
import { fetchLatestMarketData, triggerDataSync, getCachedData, setCachedData } from '../lib/supabase'
import { usePreferencesContext } from '../context/UserPreferencesContext'
import { useAuth } from '../context/AuthContext'

import staticIndices from '../data/market_indices_20250930.json'
import staticTechGiants from '../data/tech_giants_20250930.json'
import staticSectors from '../data/sector_performance_20250930.json'
import staticCommodities from '../data/commodities_20250930.json'
import staticSummary from '../data/market_summary_20250930.json'

interface MarketData {
  indices: any
  techGiants: any
  sectors: any
  commodities: any
  summary: any
}

const FinancialDashboard = () => {
  const { preferences } = usePreferencesContext()
  const { user, signOut } = useAuth()
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'market' | 'us_economy' | 'turkey_economy' | 'comparison' | 'fon_analizi' | 'gunluk_analiz'>('market')

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadMarketData = async (useCache = true) => {
    try {
      setError(null)

      // Try to load from cache first if offline or requested
      if ((!isOnline || useCache) && useCache) {
        const cached = getCachedData()
        if (cached) {
          console.log('Using cached data')
          setMarketData(cached)
          setLastUpdate(new Date())
          if (!isOnline) {
            setLoading(false)
            return
          }
        }
      }

      // Fetch real-time data from Supabase
      console.log('Fetching real-time data from Supabase...')
      const data = await fetchLatestMarketData()

      // Transform data to match component format
      const transformedData = {
        indices: {
          date: data.indices[0]?.data_date || new Date().toISOString().split('T')[0],
          indices: data.indices.map((item: any) => ({
            name: item.name,
            symbol: item.symbol,
            close: item.close_price,
            change: item.change_value,
            changePercent: item.change_percent,
            isNewHigh: item.is_new_high,
            monthlyChange: item.monthly_change,
            quarterlyChange: item.quarterly_change,
            note: item.note
          }))
        },
        techGiants: (data.techStocks?.length || 0) > 3 ? {
          date: data.techStocks[0]?.data_date || new Date().toISOString().split('T')[0],
          companies: data.techStocks.map((item: any) => ({
            name: item.name,
            symbol: item.symbol,
            close: item.close_price,
            changePercent: item.change_percent,
            dayHigh: item.day_high,
            dayLow: item.day_low,
            note: item.note
          }))
        } : staticTechGiants,

        commodities: (data.commodities?.length || 0) > 2 ? {
          date: data.commodities[0]?.data_date || new Date().toISOString().split('T')[0],
          commodities: data.commodities.map((item: any) => ({
            name: item.name,
            symbol: item.symbol,
            price: item.price,
            changePercent: item.change_percent,
            monthlyChange: item.monthly_change,
            note: item.note
          }))
        } : staticCommodities,

        sectors: staticSectors,

        summary: data.summary ? {
          date: data.summary.data_date,
          marketSummary: data.summary.daily_summary || data.summary.market_overview || {
            headline: "Veri Yüklenemedi",
            keyPoints: [],
            marketConcerns: [],
            upcomingEvents: []
          },
          topPerformers: data.summary.top_performers || [],
          worstPerformers: data.summary.worst_performers || []
        } : staticSummary,

        // Use real sector data if available, otherwise static
        // @ts-ignore
        realSectors: data.sectors || []
      }

      setMarketData(transformedData)
      setLastUpdate(new Date())

      // Cache the data
      setCachedData(transformedData)
    } catch (error) {
      console.error('Failed to load market data:', error)
      setError('Veriler yüklenirken hata oluştu. Lütfen tekrar deneyin.')

      // Try to use cached data as fallback
      const cached = getCachedData()
      if (cached) {
        console.log('Using cached data as fallback')
        setMarketData(cached)
        setLastUpdate(new Date())
      } else {
        // Fallback to static data if no cache
        const fallbackData = {
          indices: staticIndices,
          techGiants: staticTechGiants,
          sectors: staticSectors,
          commodities: staticCommodities,
          summary: staticSummary
        }
        setMarketData(fallbackData)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMarketData()

    // Auto-refresh based on user preferences
    if (preferences.data.autoRefreshEnabled) {
      const interval = setInterval(() => {
        if (isOnline) {
          loadMarketData(false)
        }
      }, preferences.data.refreshInterval * 60 * 1000)

      return () => clearInterval(interval)
    }
  }, [isOnline, preferences.data.autoRefreshEnabled, preferences.data.refreshInterval])

  const refreshData = async () => {
    setLoading(true)
    await loadMarketData(false)
  }

  const handleManualSync = async () => {
    if (!isOnline) {
      setError('Manuel senkronizasyon için internet bağlantısı gerekli')
      return
    }

    setSyncing(true)
    try {
      console.log('Triggering manual sync...')
      await triggerDataSync()

      // Wait a moment for the sync to complete, then reload
      setTimeout(async () => {
        await loadMarketData(false)
        setSyncing(false)
      }, 2000)
    } catch (error) {
      console.error('Manual sync failed:', error)
      setError('Manuel senkronizasyon başarısız oldu')
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-yellow-500 text-lg">
            {isOnline ? 'Canlı piyasa verileri yükleniyor...' : 'Önbellek verileri yükleniyor...'}
          </p>
        </div>
      </div>
    )
  }

  if (!marketData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">
            {error || 'Veri yükleme başarısız, lütfen daha sonra tekrar deneyin'}
          </p>
          {!isOnline && (
            <div className="flex items-center justify-center space-x-2 mb-4 text-orange-500">
              <WifiOff className="h-5 w-5" />
              <span>İnternet bağlantısı yok</span>
            </div>
          )}
          <button
            onClick={refreshData}
            className="mt-4 px-6 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 transition-colors"
          >
            Yeniden Yükle
          </button>
        </div>
      </div>
    )
  }

  // Calculate dynamic stats from real data
  const topPerformer = marketData.techGiants?.companies?.reduce((max: any, company: any) =>
    company.changePercent > (max?.changePercent || -Infinity) ? company : max
    , null)

  const goldPrice = marketData.commodities?.commodities?.find((c: any) => c.symbol === 'GC=F')

  const averageIndexChange = marketData.indices?.indices?.length > 0 ?
    marketData.indices.indices.reduce((sum: number, idx: any) =>
      sum + (idx.changePercent || 0), 0
    ) / marketData.indices.indices.length : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Finansal Piyasalar Panosu</h1>
                <p className="text-gray-400 text-sm">
                  {isOnline ? 'Canlı Veriler' : 'Çevrimdışı Mod'} - {marketData.indices?.date || 'Güncel Tarih'}
                </p>
              </div>
              {!isOnline && (
                <div className="flex items-center space-x-2 text-orange-500 bg-orange-500/10 px-3 py-1 rounded-lg">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-sm">Çevrimdışı</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-gray-700/50 px-3 py-2 rounded-lg">
                    <User className="h-4 w-4 text-blue-400" />
                    <span className="text-white text-sm">{user.email}</span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Çıkış</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Giriş Yap</span>
                </button>
              )}
              <GlobalAudioControl />
              <div className="text-right">
                <p className="text-gray-400 text-sm">Son Güncelleme</p>
                <p className="text-white font-mono text-sm">{lastUpdate?.toLocaleTimeString('tr-TR') || '--:--'}</p>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Ayarlar</span>
              </button>
              <button
                onClick={handleManualSync}
                disabled={syncing || !isOnline}
                className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Senkronize Ediliyor...' : 'Manuel Senkronizasyon'}</span>
              </button>
              <button
                onClick={refreshData}
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Activity className="h-4 w-4" />
                <span>Verileri Yenile</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="overflow-x-auto bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-2">
          <div className="flex items-center space-x-2 min-w-max">
            <button
              onClick={() => setActiveTab('market')}
              className={`flex-shrink-0 px-4 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${activeTab === 'market'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
            >
              Piyasa Verileri
            </button>
            <button
              onClick={() => setActiveTab('us_economy')}
              className={`flex-shrink-0 px-4 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'us_economy'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
            >
              <Globe size={18} />
              ABD Ekonomisi
            </button>
            <button
              onClick={() => setActiveTab('turkey_economy')}
              className={`flex-shrink-0 px-4 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'turkey_economy'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
            >
              <MapPin size={18} />
              Türkiye Ekonomisi
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`flex-shrink-0 px-4 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'comparison'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
            >
              <GitCompare size={18} />
              Karşılaştırma
            </button>
            <button
              onClick={() => setActiveTab('fon_analizi')}
              className={`flex-shrink-0 px-4 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'fon_analizi'
                ? 'bg-orange-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
            >
              <PieChart size={18} />
              Fon Analizi
            </button>
            <button
              onClick={() => setActiveTab('gunluk_analiz')}
              className={`flex-shrink-0 px-4 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'gunluk_analiz'
                ? 'bg-teal-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
            >
              <Calendar size={18} />
              Günlük Analiz
            </button>
          </div>
        </div>

        {activeTab === 'market' && (
          <>
            {/* Market Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`bg-gradient-to-br ${averageIndexChange >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} p-6 rounded-xl text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={averageIndexChange >= 0 ? 'text-green-100' : 'text-red-100'}>Başlıca Endeksler</p>
                    <p className="text-2xl font-bold">
                      {averageIndexChange >= 0 ? 'Yükselişte' : 'Düşüşte'}
                    </p>
                    <p className={`text-sm ${averageIndexChange >= 0 ? 'text-green-100' : 'text-red-100'}`}>
                      Ort. {(averageIndexChange || 0) >= 0 ? '+' : ''}{(averageIndexChange || 0).toFixed(2)}%
                    </p>
                  </div>
                  <TrendingUp className={`h-8 w-8 ${averageIndexChange >= 0 ? 'text-green-100' : 'text-red-100'}`} />
                </div>
              </div>

              <div className={`bg-gradient-to-br ${topPerformer?.changePercent >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} p-6 rounded-xl text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Teknoloji Devleri</p>
                    <p className="text-2xl font-bold">{topPerformer?.name || 'Yükleniyor'}</p>
                    <p className="text-blue-100 text-sm">
                      {topPerformer?.changePercent >= 0 ? '+' : ''}{topPerformer?.changePercent?.toFixed(2) || '0'}% lider
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-100" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Sıcak Sektörler</p>
                    <p className="text-2xl font-bold">Canlı Veri</p>
                    <p className="text-purple-100 text-sm">Güncel takip</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-100" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-6 rounded-xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100">Altın Fiyatı</p>
                    <p className="text-2xl font-bold">${(goldPrice?.price ?? 0).toFixed(2)}</p>
                    <p className="text-yellow-100 text-sm">
                      {goldPrice?.changePercent >= 0 ? '+' : ''}{(goldPrice?.changePercent ?? 0).toFixed(2)}%
                    </p>
                  </div>
                  <Coins className="h-8 w-8 text-yellow-100" />
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                <MarketIndices data={marketData.indices} />
                <TechGiants data={marketData.techGiants} />
                <SectorPerformance data={marketData.sectors} />
                <SectorHeatmap data={(marketData as any).realSectors || []} />
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* AI Analysis Panel - SPX Index */}
                {marketData.indices?.indices?.[1] && (
                  <AIAnalysisPanel
                    symbol={marketData.indices.indices[1].symbol || 'SPX'}
                    currentPrice={marketData.indices.indices[1].close || 0}
                  />
                )}

                <Commodities data={marketData.commodities} />
                <MarketSummary data={marketData.summary} />
              </div>
            </div>

            {/* Advanced Tools Section */}
            <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-8">
              <CorrelationMatrix />
              <ScenarioSimulator />
            </div>
          </>
        )}

        {activeTab === 'us_economy' && (
          <FREDEconomicData />
        )}

        {activeTab === 'turkey_economy' && (
          <TurkishEconomicData />
        )}

        {activeTab === 'comparison' && (
          <ComparisonDashboard />
        )}

        {activeTab === 'fon_analizi' && (
          <FonAnalizi />
        )}

        {activeTab === 'gunluk_analiz' && (
          <GunlukAnaliz />
        )}
      </main>

      {/* Modals */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Settings Panel */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <Footer />
    </div>
  )
}

export default FinancialDashboard
