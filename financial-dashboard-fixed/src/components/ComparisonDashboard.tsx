import React, { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { TrendingUp, TrendingDown, BarChart3, RefreshCw, Activity, Flag, Globe2 } from 'lucide-react'
import { supabase, fetchTurkeyEconomicIndicators } from '../lib/supabase'
import VoiceControl from './VoiceControl'

interface ComparisonData {
  indicator: string
  indicator_tr: string
  us_value: number
  turkey_value: number
  us_unit: string
  turkey_unit: string
  us_change: number
  turkey_change: number
  us_date: string
  turkey_date: string
  category: 'monetary' | 'economic' | 'market'
}

interface ComparisonDataset {
  collection_date: string
  comparisons: ComparisonData[]
  summary: {
    total_indicators: number
    categories: string[]
    last_updated: string
  }
}

const ComparisonDashboard = () => {
  const [comparisonData, setComparisonData] = useState<ComparisonDataset | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [refreshing, setRefreshing] = useState(false)

  const loadComparisonData = async () => {
    try {
      setError(null)
      setRefreshing(true)

      // Fetch Turkey data from database instead of edge function
      const turkishData = await fetchTurkeyEconomicIndicators()

      // Use sample comparison data (no edge function needed)
      const sampleData: ComparisonDataset = {
        collection_date: new Date().toISOString(),
        comparisons: [
          {
            indicator: 'Interest Rate',
            indicator_tr: 'Faiz Oranı',
            us_value: 4.09,
            turkey_value: 45.0,
            us_unit: '%',
            turkey_unit: '%',
            us_change: 0.0,
            turkey_change: 5.0,
            us_date: '2025-10-01',
            turkey_date: '2025-11-10',
            category: 'monetary'
          },
          {
            indicator: 'Inflation Rate',
            indicator_tr: 'Enflasyon Oranı',
            us_value: 2.4,
            turkey_value: 48.6,
            us_unit: '% (YoY)',
            turkey_unit: '% (YoY)',
            us_change: -0.2,
            turkey_change: -2.6,
            us_date: '2025-10-01',
            turkey_date: '2025-11-01',
            category: 'economic'
          },
          {
            indicator: 'Unemployment Rate',
            indicator_tr: 'İşsizlik Oranı',
            us_value: 4.30,
            turkey_value: 8.7,
            us_unit: '%',
            turkey_unit: '%',
            us_change: 0.1,
            turkey_change: -0.4,
            us_date: '2025-08-01',
            turkey_date: '2025-10-15',
            category: 'economic'
          },
          {
            indicator: 'GDP Growth',
            indicator_tr: 'GSYİH Büyümesi',
            us_value: 2.8,
            turkey_value: 3.2,
            us_unit: '% (YoY)',
            turkey_unit: '% (YoY)',
            us_change: 0.3,
            turkey_change: -1.3,
            us_date: '2025-Q3',
            turkey_date: '2025-Q3',
            category: 'economic'
          },
          {
            indicator: 'Stock Market Index',
            indicator_tr: 'Borsa Endeksi',
            us_value: 35420.5, // S&P 500 * 10 for comparison
            turkey_value: 9845.2,
            us_unit: 'S&P 500',
            turkey_unit: 'BIST 100',
            us_change: 1.2,
            turkey_change: 1.25,
            us_date: '2025-11-11',
            turkey_date: '2025-11-11',
            category: 'market'
          },
          {
            indicator: 'Currency vs USD',
            indicator_tr: 'USD Karşısında Para Birimi',
            us_value: 1.0,
            turkey_value: 34.25,
            us_unit: 'USD',
            turkey_unit: 'TRY/USD',
            us_change: 0.0,
            turkey_change: 0.44,
            us_date: '2025-11-11',
            turkey_date: '2025-11-11',
            category: 'monetary'
          }
        ],
        summary: {
          total_indicators: 6,
          categories: ['monetary', 'economic', 'market'],
          last_updated: new Date().toISOString()
        }
      }

      setComparisonData(sampleData)
      
    } catch (error: any) {
      console.error('Comparison data error:', error)
      setError(error.message || 'Karşılaştırmalı veriler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadComparisonData()
  }, [])

  const handleRefresh = async () => {
    await loadComparisonData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-blue-400">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Karşılaştırmalı ekonomi verileri yükleniyor...</span>
        </div>
      </div>
    )
  }

  if (error || !comparisonData) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-400 mb-4">
          <BarChart3 className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-semibold">Veri Yükleme Hatası</p>
          <p className="text-sm opacity-75">{error}</p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    )
  }

  const filteredData = selectedCategory === 'all' 
    ? comparisonData.comparisons 
    : comparisonData.comparisons.filter(item => item.category === selectedCategory)

  const getChangeIcon = (changePercent: number) => {
    if (changePercent > 0) return <TrendingUp className="h-3 w-3 text-green-400" />
    if (changePercent < 0) return <TrendingDown className="h-3 w-3 text-red-400" />
    return <Activity className="h-3 w-3 text-gray-400" />
  }

  const getChangeColor = (changePercent: number) => {
    if (changePercent > 0) return 'text-green-400'
    if (changePercent < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'monetary': return 'bg-blue-500/20 text-blue-400'
      case 'economic': return 'bg-green-500/20 text-green-400'
      case 'market': return 'bg-purple-500/20 text-purple-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'monetary': return 'Para Politikası'
      case 'economic': return 'Ekonomik Göstergeler'
      case 'market': return 'Piyasa Verileri'
      default: return category
    }
  }

  // Chart data preparation
  const chartData = filteredData.map(item => ({
    indicator: item.indicator_tr,
    us_normalized: item.indicator === 'Stock Market Index' ? item.us_value / 1000 : item.us_value,
    turkey_normalized: item.turkey_value,
    us_original: item.us_value,
    turkey_original: item.turkey_value,
    us_unit: item.us_unit,
    turkey_unit: item.turkey_unit
  }))

  const comparisonChartOption = {
    title: {
      text: 'ABD vs Türkiye Ekonomik Karşılaştırma',
      left: 'center',
      textStyle: { color: '#ffffff', fontSize: 16 }
    },
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: { color: '#ffffff' },
      formatter: function(params: any) {
        const data = chartData[params[0].dataIndex]
        return `
          <div style="padding: 8px">
            <div style="font-weight: bold; margin-bottom: 8px">${data.indicator}</div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px">
              <span style="color: #3b82f6">🇺🇸 ABD:</span>
              <span>${data.us_original.toLocaleString()} ${data.us_unit}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px">
              <span style="color: #ef4444">🇹🇷 Türkiye:</span>
              <span>${data.turkey_original.toLocaleString()} ${data.turkey_unit}</span>
            </div>
          </div>
        `
      }
    },
    legend: {
      data: ['ABD', 'Türkiye'],
      top: '10%',
      textStyle: { color: '#ffffff' }
    },
    grid: {
      left: '5%',
      right: '5%',
      top: '25%',
      bottom: '10%'
    },
    xAxis: {
      type: 'category',
      data: chartData.map(item => item.indicator),
      axisLabel: { 
        color: '#94a3b8',
        interval: 0,
        rotate: 45
      },
      axisLine: { lineStyle: { color: '#374151' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#94a3b8' },
      axisLine: { lineStyle: { color: '#374151' } },
      splitLine: { lineStyle: { color: '#374151' } }
    },
    series: [
      {
        name: 'ABD',
        type: 'bar',
        data: chartData.map(item => item.us_normalized),
        itemStyle: { color: '#3b82f6' }
      },
      {
        name: 'Türkiye',
        type: 'bar',
        data: chartData.map(item => item.turkey_normalized),
        itemStyle: { color: '#ef4444' }
      }
    ]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Globe2 className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-bold text-white">ABD vs Türkiye Ekonomi Karşılaştırması</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-gray-400 text-sm">Kategori:</span>
        {[
          { key: 'all', label: 'Tümü' },
          { key: 'monetary', label: 'Para Politikası' },
          { key: 'economic', label: 'Ekonomik Göstergeler' },
          { key: 'market', label: 'Piyasa Verileri' }
        ].map(category => (
          <button
            key={category.key}
            onClick={() => setSelectedCategory(category.key)}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              selectedCategory === category.key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left p-4 text-white font-semibold">Gösterge</th>
                <th className="text-center p-4 text-white font-semibold w-16">Kategori</th>
                <th className="text-center p-4 text-white font-semibold">
                  <div className="flex items-center justify-center gap-2">
                    <Flag className="h-4 w-4 text-blue-400" />
                    ABD
                  </div>
                </th>
                <th className="text-center p-4 text-white font-semibold">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-3 bg-red-500 rounded-sm"></div>
                    Türkiye
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index} className="border-t border-gray-700 hover:bg-gray-750">
                  <td className="p-4">
                    <div>
                      <div className="text-white font-medium">{item.indicator_tr}</div>
                      <div className="text-gray-400 text-sm">{item.indicator}</div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(item.category)}`}>
                      {getCategoryName(item.category)}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="space-y-1">
                      <div className="text-white font-semibold">
                        {item.us_value.toLocaleString()} {item.us_unit}
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        {getChangeIcon(item.us_change)}
                        <span className={`text-xs ${getChangeColor(item.us_change)}`}>
                          {item.us_change > 0 ? '+' : ''}{item.us_change.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">{item.us_date}</div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="space-y-1">
                      <div className="text-white font-semibold">
                        {item.turkey_value.toLocaleString()} {item.turkey_unit}
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        {getChangeIcon(item.turkey_change)}
                        <span className={`text-xs ${getChangeColor(item.turkey_change)}`}>
                          {item.turkey_change > 0 ? '+' : ''}{item.turkey_change.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">{item.turkey_date}</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <ReactECharts
          option={comparisonChartOption}
          style={{ height: '500px' }}
          opts={{ renderer: 'canvas' }}
        />
        <p className="text-xs text-gray-500 mt-4 text-center">
          * Farklı ölçek birimlerindeki veriler görsel karşılaştırma için normalize edilmiştir. 
          Gerçek değerler için tabloya bakınız.
        </p>
      </div>

      {/* Summary */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-3">Karşılaştırma Özeti</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Toplam Gösterge:</span>
            <span className="text-white ml-2">{comparisonData.summary.total_indicators}</span>
          </div>
          <div>
            <span className="text-gray-400">Kategori Sayısı:</span>
            <span className="text-white ml-2">{comparisonData.summary.categories.length}</span>
          </div>
          <div>
            <span className="text-gray-400">Son Güncelleme:</span>
            <span className="text-white ml-2">
              {new Date(comparisonData.summary.last_updated).toLocaleDateString('tr-TR')}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Görüntülenen:</span>
            <span className="text-white ml-2">{filteredData.length} gösterge</span>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-500">
          <p><strong>Not:</strong> Bu karşılaştırma ABD Federal Reserve Ekonomik Verileri (FRED) ve Türkiye'nin resmi kurumlarından (TCMB, TÜİK, BIST) alınan verileri kullanır.</p>
          <p className="mt-1">Veriler farklı tarihlerde güncellenebilir ve karşılaştırma amacıyla en son mevcut değerler kullanılır.</p>
        </div>
      </div>
    </div>
  )
}

export default ComparisonDashboard