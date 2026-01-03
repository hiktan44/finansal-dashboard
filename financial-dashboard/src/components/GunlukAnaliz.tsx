import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Calendar, Target, BarChart3, AlertCircle, RefreshCw, Volume2, Users, Lightbulb, CalendarDays, LineChart, Briefcase, Clock } from 'lucide-react'
import { fetchLatestDailyAnalysis, fetchDailyAnalysis, triggerDailyAnalysisGeneration, DailyAnalysis } from '../lib/supabase'

import staticAnalysisData from '../data/daily_analysis_20251231.json'

const TimeDisplay = () => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center space-x-1 font-mono text-sm">
      <Clock className="w-4 h-4" />
      <span>{time.toLocaleTimeString('tr-TR')}</span>
    </div>
  )
}

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Günlük Piyasa Analizi</h1>
              <div className="flex items-center space-x-2 text-gray-600">
                <span>{formatDate(analysis.analysis_date)}</span>
                <span className="text-gray-400">|</span>
                <TimeDisplay />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Calendar / Date Picker */}
            <div className="relative">
              <input
                type="date"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value).toISOString().split('T')[0];
                  const found = allAnalyses.find(a => a.analysis_date.startsWith(selectedDate));
                  if (found) setSelectedAnalysis(found);
                }}
                max={new Date().toISOString().split('T')[0]}
              />
              <CalendarDays className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
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

      {/* Main Analysis Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Piyasa Özeti</h2>
          </div>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{analysis.market_summary}</p>
        </div>

        {/* Technical Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Teknik Analiz</h2>
          </div>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{analysis.technical_analysis}</p>
        </div>

        {/* Sector Highlights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Sektör Vurgular</h2>
          </div>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{analysis.sector_highlights}</p>
        </div>

        {/* Market Forecast */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Piyasa Tahmini</h2>
          </div>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{analysis.market_forecast}</p>
        </div>

        {/* Next Week Outlook */}
        {analysis.next_week_outcome && (
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-sm border border-indigo-100 p-6 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <CalendarDays className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Gelecek Hafta Beklentisi</h2>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{analysis.next_week_outcome}</p>
          </div>
        )}

        {/* Long Term Outlook */}
        {analysis.long_term_outcome && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <LineChart className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Uzun Vadeli Beklentiler</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">3 Aylık</h3>
                <p className="text-sm text-gray-600">{analysis.long_term_outcome['3_months']}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">6 Aylık</h3>
                <p className="text-sm text-gray-600">{analysis.long_term_outcome['6_months']}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">1 Yıllık</h3>
                <p className="text-sm text-gray-600">{analysis.long_term_outcome['1_year']}</p>
              </div>
            </div>
          </div>
        )}

        {/* Economic Calendar */}
        {analysis.economic_calendar && analysis.economic_calendar.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Briefcase className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Önemli Veri Takvimi</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih/Saat</th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Olay</th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Önem</th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beklenti</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analysis.economic_calendar.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.date} {item.time}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{item.event}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.importance === 'High' ? 'bg-red-100 text-red-800' :
                          item.importance === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                          {item.importance}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.expectation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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