import React, { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { TrendingUp, TrendingDown, BarChart3, RefreshCw, Activity, Flag, Globe2, ChevronDown } from 'lucide-react'
import VoiceControl from './VoiceControl'

// Top 20 Economies (Turkey is Base, US is added to list)
const COUNTRIES = [
  { code: 'US', name: 'ABD', flag: '🇺🇸' },
  { code: 'CN', name: 'Çin', flag: '🇨🇳' },
  { code: 'DE', name: 'Almanya', flag: '🇩🇪' },
  { code: 'JP', name: 'Japonya', flag: '🇯🇵' },
  { code: 'IN', name: 'Hindistan', flag: '🇮🇳' },
  { code: 'UK', name: 'Birleşik Krallık', flag: '🇬🇧' },
  { code: 'FR', name: 'Fransa', flag: '🇫🇷' },
  { code: 'IT', name: 'İtalya', flag: '🇮🇹' },
  { code: 'BR', name: 'Brezilya', flag: '🇧🇷' },
  { code: 'CA', name: 'Kanada', flag: '🇨🇦' },
  { code: 'RU', name: 'Rusya', flag: '🇷🇺' },
  { code: 'MX', name: 'Meksika', flag: '🇲🇽' },
  { code: 'AU', name: 'Avustralya', flag: '🇦🇺' },
  { code: 'KR', name: 'Güney Kore', flag: '🇰🇷' },
  { code: 'ES', name: 'İspanya', flag: '🇪🇸' },
  { code: 'ID', name: 'Endonezya', flag: '🇮🇩' },
  { code: 'NL', name: 'Hollanda', flag: '🇳🇱' },
  { code: 'SA', name: 'Suudi Arabistan', flag: '🇸🇦' },
  { code: 'CH', name: 'İsviçre', flag: '🇨🇭' }
]

interface ComparisonData {
  indicator: string
  indicator_tr: string
  base_value: number      // Turkey Value
  target_value: number    // Selected Country Value
  base_unit: string
  target_unit: string
  base_change: number
  target_change: number
  base_date: string
  target_date: string
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
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('US')

  const getMockCountryData = (countryCode: string): ComparisonData[] => {
    // Seed-like generation
    const seed = countryCode.charCodeAt(0) + countryCode.charCodeAt(1)
    const variance = (n: number) => n + (seed % 5 - 2) * 0.1
    const randomChange = () => (Math.random() * 2 - 1)

    // Base Values = Turkey
    const trValues = {
      interest: 45.0,
      inflation: 48.6,
      unemployment: 8.7,
      gdp: 3.2,
      stock: 35.4
    }

    // Target Values
    let targetValues
    if (countryCode === 'US') {
      targetValues = {
        interest: 4.5,
        inflation: 2.4,
        unemployment: 4.3,
        gdp: 2.8,
        stock: 18.5
      }
    } else {
      targetValues = {
        interest: Math.max(0.1, variance(4.5)),
        inflation: Math.max(0.5, variance(3.0)),
        unemployment: Math.max(2.0, variance(5.5)),
        gdp: variance(2.0),
        stock: variance(10.0) * 1.5
      }
    }

    return [
      {
        indicator: 'Interest Rate',
        indicator_tr: 'Faiz Oranı',
        base_value: trValues.interest,
        target_value: targetValues.interest,
        base_unit: '%',
        target_unit: '%',
        base_change: 0.0,
        target_change: countryCode === 'US' ? 0.0 : randomChange(),
        base_date: '2025-11-01',
        target_date: '2025-11-01',
        category: 'monetary'
      },
      {
        indicator: 'Inflation Rate',
        indicator_tr: 'Enflasyon Oranı',
        base_value: trValues.inflation,
        target_value: targetValues.inflation,
        base_unit: '% (YoY)',
        target_unit: '% (YoY)',
        base_change: -2.6,
        target_change: countryCode === 'US' ? -0.2 : randomChange(),
        base_date: '2025-11-01',
        target_date: '2025-11-01',
        category: 'economic'
      },
      {
        indicator: 'Unemployment Rate',
        indicator_tr: 'İşsizlik Oranı',
        base_value: trValues.unemployment,
        target_value: targetValues.unemployment,
        base_unit: '%',
        target_unit: '%',
        base_change: -0.1,
        target_change: countryCode === 'US' ? 0.1 : randomChange(),
        base_date: '2025-10-15',
        target_date: '2025-10-01',
        category: 'economic'
      },
      {
        indicator: 'GDP Growth',
        indicator_tr: 'GSYİH Büyümesi',
        base_value: trValues.gdp,
        target_value: targetValues.gdp,
        base_unit: '% (YoY)',
        target_unit: '% (YoY)',
        base_change: 0.1,
        target_change: countryCode === 'US' ? 0.3 : randomChange(),
        base_date: '2025-Q3',
        target_date: '2025-Q3',
        category: 'economic'
      },
      {
        indicator: 'Stock Market (YTD)',
        indicator_tr: 'Borsa Getirisi (YTD)',
        base_value: trValues.stock,
        target_value: targetValues.stock,
        base_unit: '%',
        target_unit: '%',
        base_change: 0.5,
        target_change: countryCode === 'US' ? 1.2 : randomChange(),
        base_date: '2025-12-31',
        target_date: '2025-12-31',
        category: 'market'
      }
    ]
  }

  const loadComparisonData = async () => {
    try {
      setError(null)
      setRefreshing(true)

      const comparisons = getMockCountryData(selectedCountryCode)

      const dataset: ComparisonDataset = {
        collection_date: new Date().toISOString(),
        comparisons: comparisons,
        summary: {
          total_indicators: comparisons.length,
          categories: ['monetary', 'economic', 'market'],
          last_updated: new Date().toISOString()
        }
      }

      setComparisonData(dataset)
    } catch (err: any) {
      console.error('Error loading comparison data:', err)
      setError(err.message || 'Veri yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadComparisonData()
  }, [selectedCountryCode])

  const handleRefresh = () => {
    loadComparisonData()
  }

  const getFilteredData = () => {
    if (!comparisonData) return []
    if (selectedCategory === 'all') return comparisonData.comparisons
    return comparisonData.comparisons.filter(item => item.category === selectedCategory)
  }

  const getChartOption = (data: ComparisonData[]) => {
    if (!data.length) return {}

    const selectedCountry = COUNTRIES.find(c => c.code === selectedCountryCode)

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
        borderColor: '#374151',
        textStyle: { color: '#F3F4F6' }
      },
      legend: {
        data: ['Türkiye', selectedCountry?.name || selectedCountryCode],
        textStyle: { color: '#9CA3AF' },
        bottom: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.indicator_tr),
        axisLabel: { color: '#9CA3AF', interval: 0, rotate: 30 },
        axisLine: { lineStyle: { color: '#4B5563' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#9CA3AF' },
        splitLine: { lineStyle: { color: '#374151' } }
      },
      series: [
        {
          name: 'Türkiye',
          type: 'bar',
          data: data.map(item => item.base_value),
          itemStyle: { color: '#EF4444' }, // Red for Turkey
          barGap: 0
        },
        {
          name: selectedCountry?.name || selectedCountryCode,
          type: 'bar',
          data: data.map(item => item.target_value),
          itemStyle: { color: '#3B82F6' } // Blue/Different for others
        }
      ]
    }
  }

  const getSelectedCountryName = () => {
    return COUNTRIES.find(c => c.code === selectedCountryCode)?.name || selectedCountryCode
  }

  const getSelectedCountryFlag = () => {
    return COUNTRIES.find(c => c.code === selectedCountryCode)?.flag || '🌐'
  }

  if (loading && !comparisonData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    )
  }

  const filteredData = getFilteredData()

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-700">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe2 className="h-6 w-6 text-blue-400" />
            Küresel Ekonomi Karşılaştırması
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Türkiye Ekonomisi ile Dünyanın En Büyük Ekonomilerini Karşılaştırın
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Country Selector */}
          <div className="relative group">
            <div className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors border border-gray-600">
              <span className="text-xl">{getSelectedCountryFlag()}</span>
              <span className="font-medium">{getSelectedCountryName()}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>

            <div className="absolute right-0 top-full mt-2 w-64 max-h-80 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 hidden group-hover:block">
              <div className="p-2 space-y-1">
                {COUNTRIES.map(country => (
                  <button
                    key={country.code}
                    onClick={() => setSelectedCountryCode(country.code)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${selectedCountryCode === country.code
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'text-gray-300 hover:bg-gray-700'
                      }`}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span>{country.name}</span>
                    {selectedCountryCode === country.code && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-blue-400"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <VoiceControl />

          <button
            onClick={handleRefresh}
            className={`p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors ${refreshing ? 'animate-spin' : ''}`}
            title="Verileri Yenile"
          >
            <RefreshCw className="h-5 w-5 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Comparisons List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-yellow-500" />
              Temel Göstergeler
            </h3>
            <div className="space-y-3">
              {filteredData.map((item, index) => (
                <div key={index} className="bg-gray-700/30 p-3 rounded-lg border border-gray-600/50 hover:bg-gray-700/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-gray-300 font-medium">{item.indicator_tr}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.category === 'monetary' ? 'bg-purple-900/50 text-purple-300' :
                        item.category === 'market' ? 'bg-green-900/50 text-green-300' :
                          'bg-blue-900/50 text-blue-300'
                      }`}>
                      {item.category === 'monetary' ? 'Parasal' : item.category === 'market' ? 'Piyasa' : 'Ekonomi'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        🇹🇷 Türkiye
                      </div>
                      <div className="text-lg font-bold text-white">
                        {item.base_value}{item.base_unit.replace('%', '')}<span className="text-xs text-gray-400">%</span>
                      </div>
                      <div className={`text-xs flex items-center ${item.base_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {item.base_change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {Math.abs(item.base_change)}%
                      </div>
                    </div>

                    <div className="text-right border-l border-gray-600 pl-4">
                      <div className="text-xs text-gray-500 flex items-center justify-end gap-1">
                        {getSelectedCountryFlag()} {selectedCountryCode}
                      </div>
                      <div className="text-lg font-bold text-white">
                        {item.target_value.toFixed(2)}{item.target_unit.replace('%', '')}<span className="text-xs text-gray-400">%</span>
                      </div>
                      <div className={`text-xs flex items-center justify-end ${item.target_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {item.target_change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {Math.abs(item.target_change).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Comparison Chart */}
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Karşılaştırmalı Analiz
              </h3>
              {/* Category Filter Buttons */}
              <div className="flex gap-2 text-xs">
                {['all', 'economic', 'monetary', 'market'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg transition-colors capitalize ${selectedCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                  >
                    {cat === 'all' ? 'Tümü' : cat === 'economic' ? 'Ekonomi' : cat === 'monetary' ? 'Parasal' : 'Piyasa'}
                  </button>
                ))}
              </div>
            </div>

            <ReactECharts
              option={getChartOption(filteredData)}
              theme="dark"
              style={{ height: '400px', width: '100%' }}
              opts={{ renderer: 'svg' }}
            />
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-red-900/20 to-gray-800 p-4 rounded-xl border border-red-500/20">
              <h4 className="text-red-400 font-medium mb-2 text-sm uppercase tracking-wider">Türkiye Görünüm</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                Türkiye ekonomisi dezenflasyon sürecinde önemli mesafe kat etti. Yapısal reformlar ve sıkı para politikası meyvelerini vermeye başladı.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-900/20 to-gray-800 p-4 rounded-xl border border-blue-500/20">
              <h4 className="text-blue-400 font-medium mb-2 text-sm uppercase tracking-wider">{getSelectedCountryName()} Görünüm</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                {selectedCountryCode === 'US'
                  ? "ABD ekonomisi 2025'in son çeyreğinde istikrarlı büyümesini sürdürüyor. Enflasyon hedeflenen seviyelere yakınsarken, işgücü piyasası dengelenme işaretleri gösteriyor."
                  : `${getSelectedCountryName()} küresel konjonktür ve ticari dengeler doğrultusunda ekonomik performansını şekillendiriyor.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComparisonDashboard