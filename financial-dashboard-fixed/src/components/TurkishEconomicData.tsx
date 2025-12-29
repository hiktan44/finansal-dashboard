import React, { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { TrendingUp, TrendingDown, DollarSign, Percent, BarChart2, RefreshCw, Activity, MapPin, Target, Globe, AlertCircle } from 'lucide-react'
import { fetchTurkeyEconomicIndicators, TurkeyEconomicIndicator } from '../lib/supabase'

const TurkishEconomicData = () => {
  const [indicators, setIndicators] = useState<TurkeyEconomicIndicator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndicator, setSelectedIndicator] = useState<TurkeyEconomicIndicator | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadIndicators()
  }, [])

  const loadIndicators = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await fetchTurkeyEconomicIndicators()
      setIndicators(data)
      
      if (data.length > 0 && !selectedIndicator) {
        setSelectedIndicator(data[0])
      }
    } catch (err) {
      setError('Türkiye ekonomi verileri yüklenirken bir hata oluştu.')
      console.error('Error loading Turkey economic indicators:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      // Directly reload indicators from database without triggering edge function
      await loadIndicators()
      setRefreshing(false)
    } catch (err) {
      setError('Veriler güncellenirken bir hata oluştu.')
      setRefreshing(false)
    }
  }

  const categories = [
    { id: 'all', name: 'Tüm Göstergeler' },
    { id: 'Para Politikası', name: 'Para Politikası' },
    { id: 'Risk Göstergeleri', name: 'Risk Göstergeleri' },
    { id: 'Dış Ticaret', name: 'Dış Ticaret' },
    { id: 'Sanayi', name: 'Sanayi & Üretim' },
    { id: 'Borsa', name: 'Finansal Piyasalar' },
    { id: 'İstihdam', name: 'İstihdam' },
    { id: 'Mali Göstergeler', name: 'Mali Göstergeler' },
    { id: 'Emtia', name: 'Emtia' },
    { id: 'Tüketim', name: 'Tüketim' },
    { id: 'Turizm', name: 'Turizm' },
    { id: 'Gayrimenkul', name: 'Gayrimenkul' },
    { id: 'Bankacılık', name: 'Bankacılık' }
  ]

  const getCategoryForIndicator = (indicator: TurkeyEconomicIndicator): string => {
    // Database'den gelen indicator_category'yi doğrudan kullan
    return indicator.indicator_category
  }

  const filteredIndicators = selectedCategory === 'all' 
    ? indicators 
    : indicators.filter(indicator => getCategoryForIndicator(indicator) === selectedCategory)

  const getChangeValue = (indicator: TurkeyEconomicIndicator) => {
    if (indicator.change_percent !== undefined && indicator.change_percent !== null) {
      return indicator.change_percent
    }
    return 0
  }

  const getChangeIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-400" />
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-400" />
    return <Activity className="h-4 w-4 text-gray-400" />
  }

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-400'
    if (value < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Para Politikası': return <DollarSign className="h-5 w-5 text-blue-400" />
      case 'Dış Ticaret': return <Globe className="h-5 w-5 text-green-400" />
      case 'Sanayi': return <BarChart2 className="h-5 w-5 text-purple-400" />
      case 'Borsa': return <TrendingUp className="h-5 w-5 text-yellow-400" />
      case 'İstihdam': return <Target className="h-5 w-5 text-red-400" />
      case 'Risk Göstergeleri': return <AlertCircle className="h-5 w-5 text-orange-400" />
      case 'Mali Göstergeler': return <Percent className="h-5 w-5 text-indigo-400" />
      case 'Emtia': return <Activity className="h-5 w-5 text-yellow-500" />
      case 'Tüketim': return <BarChart2 className="h-5 w-5 text-pink-400" />
      case 'Turizm': return <MapPin className="h-5 w-5 text-cyan-400" />
      case 'Gayrimenkul': return <Target className="h-5 w-5 text-emerald-400" />
      case 'Bankacılık': return <DollarSign className="h-5 w-5 text-slate-400" />
      case 'all': return <Activity className="h-5 w-5 text-gray-400" />
      default: return <Activity className="h-5 w-5 text-gray-400" />
    }
  }

  const formatValue = (value: number, unit: string): string => {
    if (unit === 'Milyar USD' || unit === 'Milyar TL') {
      return value.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    }
    if (unit === 'Yüzde' || unit.includes('%')) {
      return value.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    }
    if (unit === 'Baz Puan') {
      return value.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    }
    return value.toLocaleString('tr-TR')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Chart configuration for selected indicator
  const chartOption = selectedIndicator ? {
    title: {
      text: selectedIndicator.indicator_name,
      left: 'center',
      textStyle: { color: '#ffffff', fontSize: 16 }
    },
    backgroundColor: 'transparent',
    grid: {
      left: '10%',
      right: '10%',
      top: '20%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: ['Önceki Değer', 'Güncel Değer'],
      axisLabel: { color: '#94a3b8' },
      axisLine: { lineStyle: { color: '#374151' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#94a3b8', formatter: (value: number) => value.toLocaleString('tr-TR') },
      axisLine: { lineStyle: { color: '#374151' } },
      splitLine: { lineStyle: { color: '#374151' } }
    },
    series: [{
      data: [
        {
          value: selectedIndicator.previous_value || selectedIndicator.current_value * 0.95,
          itemStyle: { color: '#64748b' }
        },
        {
          value: selectedIndicator.current_value,
          itemStyle: { 
            color: getChangeValue(selectedIndicator) > 0 ? '#22c55e' : 
                   getChangeValue(selectedIndicator) < 0 ? '#ef4444' : '#64748b'
          }
        }
      ],
      type: 'bar',
      barWidth: 60,
      label: {
        show: true,
        position: 'top',
        color: '#ffffff',
        formatter: (params: any) => `${formatValue(params.value, selectedIndicator.unit)} ${selectedIndicator.unit}`
      }
    }],
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: { color: '#ffffff' },
      formatter: function(params: any) {
        const item = params[0]
        const value = item.value
        return `${item.name}: ${formatValue(value, selectedIndicator.unit)} ${selectedIndicator.unit}`
      }
    }
  } : null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-lg font-medium text-gray-300">Türkiye ekonomi verileri yükleniyor...</span>
      </div>
    )
  }

  if (error && indicators.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Veri Yüklenemedi</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={loadIndicators}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-red-500" />
            <h1 className="text-2xl font-bold text-white">Türkiye Ekonomisi</h1>
          </div>
          <div className="text-sm text-gray-400">
            {indicators.length} gösterge • Son güncelleme: {indicators.length > 0 && formatDate(indicators[0].last_updated)}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {error && (
            <div className="text-amber-400 text-sm">
              ⚠️ Kısmi veri yüklemesi
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Güncelleniyor...' : 'Yenile'}
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {getCategoryIcon(category.id)}
            {category.name}
          </button>
        ))}
      </div>

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredIndicators.map((indicator) => {
          const changeValue = getChangeValue(indicator)
          return (
            <div
              key={indicator.id}
              className={`p-4 bg-gray-800 rounded-lg border cursor-pointer transition-all ${
                selectedIndicator?.id === indicator.id 
                  ? 'border-blue-500 bg-gray-750 ring-1 ring-blue-500' 
                  : 'border-gray-700 hover:border-gray-600 hover:bg-gray-750'
              }`}
              onClick={() => setSelectedIndicator(indicator)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(getCategoryForIndicator(indicator))}
                  <span className="text-xs text-gray-400 uppercase">{indicator.source}</span>
                </div>
                {getChangeIcon(changeValue)}
              </div>
              
              <div className="space-y-1">
                <h3 className="text-white font-semibold text-sm leading-tight">{indicator.indicator_name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">
                    {formatValue(indicator.current_value, indicator.unit)}
                  </span>
                  <span className="text-sm text-gray-400">{indicator.unit}</span>
                </div>
                {changeValue !== 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`font-medium ${getChangeColor(changeValue)}`}>
                      {changeValue > 0 ? '+' : ''}{changeValue.toFixed(1)}%
                    </span>
                    <span className="text-gray-500">
                      {indicator.data_frequency === 'daily' ? 'günlük' : 
                       indicator.data_frequency === 'monthly' ? 'aylık' : 'yıllık'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart */}
      {selectedIndicator && chartOption && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-white font-semibold mb-2">{selectedIndicator.indicator_name}</h3>
            {selectedIndicator.description && (
              <p className="text-gray-400 text-sm">{selectedIndicator.description}</p>
            )}
          </div>
          <ReactECharts
            option={chartOption}
            style={{ height: '400px' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      )}

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Kategoriler</h3>
          <div className="space-y-2">
            {categories.slice(1).map((category) => {
              const count = indicators.filter(ind => getCategoryForIndicator(ind) === category.id).length
              return (
                <div key={category.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category.id)}
                    <span className="text-gray-300">{category.name}</span>
                  </div>
                  <span className="text-white font-medium">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Veri Kaynakları</h3>
          <div className="space-y-2">
            {['TCMB', 'TÜİK', 'BIST', 'TURKSTAT'].map((source) => {
              const count = indicators.filter(ind => ind.source === source).length
              if (count === 0) return null
              return (
                <div key={source} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{source}</span>
                  <span className="text-white font-medium">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Güncelleme Durumu</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Toplam Gösterge</span>
              <span className="text-white font-medium">{indicators.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Aktif Gösterge</span>
              <span className="text-white font-medium">{indicators.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Son Güncelleme</span>
              <span className="text-white font-medium">
                {indicators.length > 0 && formatDate(indicators[0].last_updated)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Info */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-2">Veri Bilgisi</h3>
        <div className="text-xs text-gray-400 space-y-1">
          <p><strong>TCMB:</strong> Türkiye Cumhuriyet Merkez Bankası - Para politikası, döviz kurları, faiz oranları</p>
          <p><strong>TÜİK:</strong> Türkiye İstatistik Kurumu - Enflasyon, işsizlik, ekonomik aktivite</p>
          <p><strong>BIST:</strong> Borsa İstanbul - Hisse senedi endeksleri ve piyasa verileri</p>
          <p className="mt-2"><strong>Güncelleme Sıklığı:</strong> Veriler kaynaklarından otomatik olarak çekilir ve güncellenir.</p>
        </div>
      </div>
    </div>
  )
}

export default TurkishEconomicData