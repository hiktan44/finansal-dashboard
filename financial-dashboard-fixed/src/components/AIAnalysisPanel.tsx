import React, { useState, useEffect } from 'react'
import { Brain, TrendingUp, AlertTriangle, Info, RefreshCw, ChevronDown, ChevronUp, Loader } from 'lucide-react'
import { 
  analyzeTrend, 
  getTechnicalIndicators, 
  predictPrices, 
  getRiskMetrics,
  generateMarketSignals,
  generateAIInsights,
  findSupportResistance,
  detectAnomalies
} from '../utils/aiAnalysis'
import { PriceData, AIInsight } from '../types/aiAnalysis'
import { 
  fetchHistoricalData, 
  triggerHistoricalDataFetch, 
  triggerAIAnalysis,
  fetchAIPredictions,
  fetchAIInsights,
  fetchMarketSignals
} from '../lib/supabase'

interface AIAnalysisPanelProps {
  symbol: string
  currentPrice: number
}

const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({ symbol, currentPrice }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [historicalData, setHistoricalData] = useState<PriceData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [dataInitialized, setDataInitialized] = useState(false)

  useEffect(() => {
    initializeData()
  }, [symbol])

  const initializeData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Önce veritabanından geçmiş verileri çek
      console.log('Fetching historical data from database...')
      let dbData = await fetchHistoricalData(symbol)

      // Eğer veri yoksa veya yetersizse, Yahoo Finance'den çek
      if (dbData.length < 30) {
        console.log('Insufficient data in database, fetching from Yahoo Finance...')
        await triggerHistoricalDataFetch(symbol, '1y')
        
        // Yeniden veritabanından çek
        await new Promise(resolve => setTimeout(resolve, 2000))
        dbData = await fetchHistoricalData(symbol)
      }

      if (dbData.length === 0) {
        throw new Error('Geçmiş veri bulunamadı')
      }

      // Veriyi PriceData formatına dönüştür
      const priceData: PriceData[] = dbData.map(d => ({
        date: d.data_date,
        price: d.price,
        volume: d.volume
      }))

      setHistoricalData(priceData)
      setDataInitialized(true)

      // Client-side analiz
      const clientInsights = generateAIInsights(priceData, symbol)
      setInsights(clientInsights)

      // Server-side AI analizini de tetikle (async)
      triggerServerAnalysis()

    } catch (error: any) {
      console.error('Error initializing data:', error)
      setError(error.message || 'Veri yüklenirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const triggerServerAnalysis = async () => {
    try {
      console.log('Triggering server-side AI analysis...')
      await triggerAIAnalysis(symbol)
      
      // Sunucu analizi sonuçlarını çek
      const [predictions, serverInsights, signals] = await Promise.all([
        fetchAIPredictions(symbol),
        fetchAIInsights(symbol),
        fetchMarketSignals(symbol)
      ])

      console.log('Server analysis results:', { predictions, serverInsights, signals })
    } catch (error) {
      console.error('Server analysis error:', error)
    }
  }

  const runAnalysis = async () => {
    if (!dataInitialized) {
      await initializeData()
    } else {
      setIsLoading(true)
      setTimeout(() => {
        const generatedInsights = generateAIInsights(historicalData, symbol)
        setInsights(generatedInsights)
        setIsLoading(false)
      }, 500)
    }
  }

  const trend = historicalData.length > 0 ? analyzeTrend(historicalData) : null
  const riskMetrics = historicalData.length > 0 ? getRiskMetrics(historicalData) : null
  const indicators = historicalData.length > 0 ? getTechnicalIndicators(historicalData) : []
  const signals = historicalData.length > 0 ? generateMarketSignals(historicalData) : []
  const predictions = historicalData.length > 0 ? predictPrices(historicalData, 10) : []
  const supportResistance = historicalData.length > 0 ? findSupportResistance(historicalData) : null
  const anomalies = historicalData.length > 0 ? detectAnomalies(historicalData) : []

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-4 w-4 text-green-400" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      default: return <Info className="h-4 w-4 text-blue-400" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'bg-green-500/10 border-green-500/30'
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30'
      default: return 'bg-blue-500/10 border-blue-500/30'
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'düşük': return 'text-green-400'
      case 'orta': return 'text-yellow-400'
      case 'yüksek': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'al': return 'text-green-400 bg-green-500/20'
      case 'sat': return 'text-red-400 bg-red-500/20'
      default: return 'text-yellow-400 bg-yellow-500/20'
    }
  }

  if (isLoading && !dataInitialized) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center space-x-3 text-gray-400">
          <Loader className="h-5 w-5 animate-spin" />
          <span>Geçmiş veriler yükleniyor...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/30">
        <div className="flex items-center space-x-2 text-red-400">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
        </div>
        <button
          onClick={initializeData}
          className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    )
  }

  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center space-x-2 text-gray-400">
          <Brain className="h-5 w-5" />
          <span>Analiz için yeterli veri yok</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl border border-purple-500/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">AI Analiz ve Tahminler</h3>
              <p className="text-purple-100 text-sm">{symbol} için otomatik piyasa analizi</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={runAnalysis}
              disabled={isLoading}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-white" />
              ) : (
                <ChevronDown className="h-4 w-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Trend Analizi */}
          {trend && (
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
              <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Trend Analizi</span>
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Yön</p>
                  <p className={`text-lg font-bold ${
                    trend.direction === 'yukarı' ? 'text-green-400' : 
                    trend.direction === 'aşağı' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {trend.direction.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Güç</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${(trend.strength / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-white font-mono text-sm">{trend.strength.toFixed(1)}/10</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400 text-sm">Güven Seviyesi</p>
                  <p className="text-white font-semibold">%{trend.confidence}</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm mt-3 p-3 bg-gray-700/30 rounded">{trend.description}</p>
            </div>
          )}

          {/* Risk Metrikleri */}
          {riskMetrics && (
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
              <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Risk Değerlendirmesi</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-400 text-xs">Risk Seviyesi</p>
                  <p className={`font-bold text-lg ${getRiskColor(riskMetrics.riskLevel)}`}>
                    {riskMetrics.riskLevel.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Volatilite</p>
                  <p className="text-white font-semibold">%{riskMetrics.volatility.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Sharpe Ratio</p>
                  <p className="text-white font-semibold">{riskMetrics.sharpeRatio.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Max Düşüş</p>
                  <p className="text-white font-semibold">%{riskMetrics.maxDrawdown.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">VaR (95%)</p>
                  <p className="text-white font-semibold">%{riskMetrics.valueAtRisk.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Beta</p>
                  <p className="text-white font-semibold">{riskMetrics.beta.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Teknik İndikatörler */}
          {indicators.length > 0 && (
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
              <h4 className="text-white font-semibold mb-3">Teknik İndikatörler</h4>
              <div className="space-y-3">
                {indicators.map((indicator, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex-1">
                      <p className="text-white font-medium">{indicator.name}</p>
                      <p className="text-gray-400 text-xs">{indicator.description}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-white font-mono text-sm">{indicator.value.toFixed(2)}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSignalColor(indicator.signal)}`}>
                        {indicator.signal.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Piyasa Sinyalleri */}
          {signals.length > 0 && (
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
              <h4 className="text-white font-semibold mb-3">Piyasa Sinyalleri</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {signals.map((signal, index) => (
                  <div key={index} className="p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm capitalize">{signal.type}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getSignalColor(signal.signal)}`}>
                        {signal.signal.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="flex-1 bg-gray-600 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${(signal.strength / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-gray-300 text-xs">{signal.strength.toFixed(1)}</span>
                    </div>
                    <p className="text-gray-300 text-xs">{signal.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Destek ve Direnç */}
          {supportResistance && (supportResistance.support.length > 0 || supportResistance.resistance.length > 0) && (
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
              <h4 className="text-white font-semibold mb-3">Destek ve Direnç Seviyeleri</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-green-400 text-sm font-semibold mb-2">Destek</p>
                  {supportResistance.support.map((level, index) => (
                    <div key={index} className="text-gray-300 text-sm mb-1">
                      ${level.toFixed(2)}
                    </div>
                  ))}
                  {supportResistance.support.length === 0 && (
                    <p className="text-gray-500 text-xs">Tespit edilemedi</p>
                  )}
                </div>
                <div>
                  <p className="text-red-400 text-sm font-semibold mb-2">Direnç</p>
                  {supportResistance.resistance.map((level, index) => (
                    <div key={index} className="text-gray-300 text-sm mb-1">
                      ${level.toFixed(2)}
                    </div>
                  ))}
                  {supportResistance.resistance.length === 0 && (
                    <p className="text-gray-500 text-xs">Tespit edilemedi</p>
                  )}
                </div>
              </div>
              <div className="mt-3 p-2 bg-gray-700/50 rounded text-center">
                <p className="text-gray-400 text-xs">Güncel Fiyat</p>
                <p className="text-white font-bold">${supportResistance.currentPrice.toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Fiyat Tahminleri */}
          {predictions.length > 0 && (
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
              <h4 className="text-white font-semibold mb-3">
                10 Günlük Fiyat Tahmini 
                <span className="text-xs text-gray-400 ml-2">({predictions.length} tahmin)</span>
              </h4>
              <div className="space-y-2">
                {predictions.map((prediction, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                    <span className="text-gray-400 text-sm">
                      {new Date(prediction.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-400 text-xs">
                        ${prediction.confidenceInterval.lower.toFixed(2)} - ${prediction.confidenceInterval.upper.toFixed(2)}
                      </span>
                      <span className="text-white font-semibold">${prediction.predictedPrice.toFixed(2)}</span>
                      <span className="text-purple-400 text-xs">%{prediction.confidence}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-gray-400 text-xs mt-3 text-center">
                Tahminler lineer regresyon modeline dayanmaktadır. Yatırım tavsiyesi değildir.
              </p>
            </div>
          )}

          {/* AI Insights */}
          {insights.length > 0 && (
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
              <h4 className="text-white font-semibold mb-3">AI Öngörüleri</h4>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">{getInsightIcon(insight.type)}</div>
                      <div className="flex-1">
                        <h5 className="text-white font-semibold mb-1">{insight.title}</h5>
                        <p className="text-gray-300 text-sm mb-2">{insight.content}</p>
                        <div className="flex items-center space-x-3 text-xs">
                          <span className="text-gray-400">Güven: %{insight.confidence}</span>
                          <span className="text-gray-500">|</span>
                          <span className="text-gray-400 capitalize">Önem: {insight.severity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Anomali Uyarısı */}
          {anomalies.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <h4 className="text-orange-400 font-semibold mb-2 flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Olağandışı Hareketler Tespit Edildi</span>
              </h4>
              <p className="text-gray-300 text-sm">
                Son dönemde {anomalies.length} olağandışı fiyat hareketi tespit edildi. 
                Dikkatli olmak ve ek analiz yapmak önerilir.
              </p>
            </div>
          )}

          {/* Yasal Uyarı */}
          <div className="bg-gray-700/20 border border-gray-600/30 rounded-lg p-3">
            <p className="text-gray-400 text-xs text-center">
              Bu analizler otomatik algoritmalar tarafından üretilmiştir ve yatırım tavsiyesi niteliği taşımamaktadır. 
              Yatırım kararlarınızı verirken profesyonel danışmanlık almanız önerilir.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIAnalysisPanel
