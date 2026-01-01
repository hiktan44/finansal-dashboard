import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Calendar, Target, BarChart3, AlertCircle, RefreshCw, Volume2, Users, Lightbulb } from 'lucide-react'
import { fetchLatestDailyAnalysis, fetchDailyAnalysis, triggerDailyAnalysisGeneration, DailyAnalysis } from '../lib/supabase'

import staticAnalysisData from '../data/daily_analysis_20251231.json'

const GunlukAnaliz = () => {
  const [latestAnalysis, setLatestAnalysis] = useState<DailyAnalysis | null>(null)
  const [allAnalyses, setAllAnalyses] = useState<DailyAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<DailyAnalysis | null>(null)

  useEffect(() => {
    loadAnalyses()
  }, [])

  const loadAnalyses = async () => {
    try {
      setLoading(true)
      setError(null)

      /*
       * RESTORING REAL DATA FETCH
       * User explicitly requested NO fake data.
       */
      const [latest, all] = await Promise.all([
        fetchLatestDailyAnalysis(),
        fetchDailyAnalysis(10)
      ])

      if (!latest) {
        throw new Error('Analiz verisi bulunamadı')
      }

      setLatestAnalysis(latest)
      setAllAnalyses(all)
      setSelectedAnalysis(latest)
    } catch (err) {
      console.error('Error loading analyses:', err)
      setError('Günlük analiz verileri şu anda alınamıyor. Lütfen daha sonra tekrar deneyiniz.')
      // DO NOT fallback to static data
      setLatestAnalysis(null)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await triggerDailyAnalysisGeneration()

      // Wait a moment for the analysis to be generated
      setTimeout(() => {
        loadAnalyses()
        setRefreshing(false)
      }, 3000)
    } catch (err) {
      setError('Analiz güncellenirken bir hata oluştu.')
      setRefreshing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const getSentimentColor = (score: string) => {
    const numScore = parseFloat(score)
    if (numScore >= 7) return 'text-green-600 bg-green-50 border-green-200'
    if (numScore >= 5) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getVolatilityColor = (index: string) => {
    const numIndex = parseFloat(index)
    if (numIndex >= 20) return 'text-red-600 bg-red-50 border-red-200'
    if (numIndex >= 15) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-green-600 bg-green-50 border-green-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-lg font-medium text-gray-600">Günlük analiz yükleniyor...</span>
      </div>
    )
  }

  if (error || !latestAnalysis) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Veri Yüklenemedi</h3>
        <p className="text-gray-600 mb-4">{error || 'Günlük analiz verisi bulunamadı.'}</p>
        <button
          onClick={loadAnalyses}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    )
  }

  const analysis = selectedAnalysis || latestAnalysis

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Günlük Piyasa Analizi</h1>
              <p className="text-gray-600">{formatDate(analysis.analysis_date)}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Güncelleniyor...' : 'Yenile'}</span>
          </button>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg border ${getSentimentColor(analysis.sentiment_score)}`}>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span className="font-medium">Piyasa Duyarlılığı</span>
            </div>
            <div className="text-2xl font-bold mt-1">{analysis.sentiment_score}/10</div>
          </div>
          <div className={`p-4 rounded-lg border ${getVolatilityColor(analysis.volatility_index)}`}>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span className="font-medium">Volatilite Endeksi</span>
            </div>
            <div className="text-2xl font-bold mt-1">{analysis.volatility_index}%</div>
          </div>
        </div>
      </div>

      {/* Analysis History Selector */}
      {allAnalyses.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Analiz Geçmişi</h2>
          <div className="flex flex-wrap gap-2">
            {allAnalyses.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedAnalysis(item)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${selectedAnalysis?.id === item.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {formatDate(item.analysis_date).split(',')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Analysis Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Piyasa Özeti</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">{analysis.market_summary}</p>
        </div>

        {/* Technical Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Teknik Analiz</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">{analysis.technical_analysis}</p>
        </div>

        {/* Sector Highlights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Sektör Vurgular</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">{analysis.sector_highlights}</p>
        </div>

        {/* Market Forecast */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Piyasa Tahmini</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">{analysis.market_forecast}</p>
        </div>
      </div>

      {/* Top Movers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Günün Öne Çıkanları</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gainers */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Yükselişte Olanlar</h3>
            </div>
            <div className="space-y-3">
              {analysis.top_movers.gainers.map((stock, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <div className="font-semibold text-gray-900">{stock.symbol}</div>
                    <div className="text-sm text-gray-600">{stock.reason}</div>
                  </div>
                  <div className="text-green-600 font-bold">+{stock.change}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Losers */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Düşüşte Olanlar</h3>
            </div>
            <div className="space-y-3">
              {analysis.top_movers.losers.map((stock, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <div className="font-semibold text-gray-900">{stock.symbol}</div>
                    <div className="text-sm text-gray-600">{stock.reason}</div>
                  </div>
                  <div className="text-red-600 font-bold">{stock.change}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Audio Player */}
      {analysis.audio_file_path && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Volume2 className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Sesli Analiz</h2>
          </div>
          <audio controls className="w-full">
            <source src={analysis.audio_file_path} type="audio/mpeg" />
            Tarayıcınız ses oynatmayı desteklemiyor.
          </audio>
        </div>
      )}
    </div>
  )
}

export default GunlukAnaliz