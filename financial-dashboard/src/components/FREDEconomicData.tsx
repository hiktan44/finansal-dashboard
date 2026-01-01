import React, { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { TrendingUp, TrendingDown, DollarSign, Percent, BarChart2, RefreshCw, Activity } from 'lucide-react'
import { supabase } from '../lib/supabase'
import VoiceControl from './VoiceControl'

interface FREDSeries {
  series_id: string
  title: string
  description: string
  frequency: string
  units: string
  data: Array<{ date: string; value: number }>
  record_count: number
}

interface FREDData {
  collection_info: {
    collection_date: string
    start_date: string
    end_date: string
    total_series: number
    successful_series: number
    total_records: number
  }
  series: Record<string, FREDSeries>
}

const FREDEconomicData = () => {
  const [fredData, setFredData] = useState<FREDData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSeries, setSelectedSeries] = useState<string>('FEDFUNDS')
  const [refreshing, setRefreshing] = useState(false)

  const loadFREDData = async () => {
    try {
      setError(null)
      setRefreshing(true)

      const seriesIds = ['FEDFUNDS', 'GDP', 'CPIAUCSL', 'UNRATE', 'DGS10']
      const { data, error: dbError } = await supabase
        .from('macro_data')
        .select('*')
        .eq('country', 'US')
        .in('indicator', seriesIds)
        .order('date', { ascending: true })

      if (dbError) throw dbError

      if (data && data.length > 0) {
        const seriesMap: Record<string, FREDSeries> = {}

        seriesIds.forEach(id => {
          const seriesData = data
            .filter(item => item.indicator === id)
            .map(item => ({
              date: item.date,
              value: item.value
            }))

          if (seriesData.length > 0) {
            seriesMap[id] = {
              series_id: id,
              title: id, // Mapping name logically or keep ID
              description: '', // Could be enhanced
              frequency: 'Monthly',
              units: id === 'GDP' ? 'Billion USD' : 'Percent',
              data: seriesData,
              record_count: seriesData.length
            }
          }
        })

        // Enhance titles for better display
        const titles: Record<string, string> = {
          'FEDFUNDS': 'Federal Fon Faiz Oranı',
          'GDP': 'Gayri Safi Yurt İçi Hasıla',
          'CPIAUCSL': 'Tüketici Fiyat Endeksi',
          'UNRATE': 'İşsizlik Oranı',
          'DGS10': '10 Yıllık Hazine Tahvili'
        }

        Object.keys(seriesMap).forEach(id => {
          if (titles[id]) seriesMap[id].title = titles[id]
        })

        setFredData({
          collection_info: {
            collection_date: new Date().toISOString(),
            start_date: data[0].date,
            end_date: data[data.length - 1].date,
            total_series: seriesIds.length,
            successful_series: Object.keys(seriesMap).length,
            total_records: data.length
          },
          series: seriesMap
        })
      } else {
        // Trigger backend fetch if no data
        console.log('No US data found, triggering backend fetch...')
        await fetch('http://localhost:3001/api/fred/fetch-all', { method: 'POST' })

        // Retry once
        setTimeout(loadFREDData, 2000)
      }
    } catch (err) {
      console.error('FRED veri yukle hatasi:', err)
      setError('ABD ekonomik verileri yuklenirken hata olustu')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadFREDData()
  }, [])

  const getLatestValue = (seriesId: string): number | null => {
    if (!fredData?.series[seriesId]?.data) return null
    const data = fredData.series[seriesId].data
    return data.length > 0 ? data[data.length - 1].value : null
  }

  const getChangePercent = (seriesId: string): number | null => {
    if (!fredData?.series[seriesId]?.data) return null
    const data = fredData.series[seriesId].data
    if (data.length < 2) return null
    const current = data[data.length - 1].value
    const previous = data[data.length - 2].value
    return previous !== 0 ? ((current - previous) / previous) * 100 : null
  }

  const formatValue = (value: number | null, units: string): string => {
    if (value === null) return 'N/A'
    if (units.includes('Percent')) return `${value.toFixed(2)}%`
    if (units.includes('Index')) return value.toFixed(2)
    if (units.includes('Dollar')) return `$${value.toFixed(4)}`
    return value.toFixed(2)
  }

  const getChartOption = (seriesId: string) => {
    if (!fredData?.series[seriesId]) return {}

    const series = fredData.series[seriesId]
    const dates = series.data.map(d => d.date)
    const values = series.data.map(d => d.value)

    return {
      backgroundColor: 'transparent',
      title: {
        text: series.title,
        textStyle: {
          color: '#e5e7eb',
          fontSize: 14,
          fontWeight: 'normal'
        },
        left: 'center',
        top: 10
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        borderColor: '#374151',
        textStyle: {
          color: '#e5e7eb'
        },
        formatter: (params: any) => {
          const param = params[0]
          return `${param.name}<br/>${param.seriesName}: ${formatValue(param.value, series.units)}`
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: 60,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: '#4b5563'
          }
        },
        axisLabel: {
          color: '#9ca3af',
          fontSize: 10,
          formatter: (value: string) => {
            const date = new Date(value)
            return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#4b5563'
          }
        },
        axisLabel: {
          color: '#9ca3af',
          fontSize: 10,
          formatter: (value: number) => formatValue(value, series.units)
        },
        splitLine: {
          lineStyle: {
            color: '#374151',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: series.units,
          type: 'line',
          data: values,
          smooth: true,
          lineStyle: {
            color: '#3b82f6',
            width: 2
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
              ]
            }
          },
          emphasis: {
            focus: 'series'
          }
        }
      ]
    }
  }

  const keyIndicators = [
    { id: 'FEDFUNDS', name: 'Federal Fon Faiz Oranı', icon: Percent, color: 'blue' },
    { id: 'GDP', name: 'Gayri Safi Yurt İçi Hasıla', icon: Activity, color: 'purple' },
    { id: 'CPIAUCSL', name: 'Tüketici Fiyat Endeksi', icon: TrendingUp, color: 'red' },
    { id: 'UNRATE', name: 'İşsizlik Oranı', icon: BarChart2, color: 'yellow' },
    { id: 'DGS10', name: '10 Yıllık Hazine Tahvili', icon: TrendingDown, color: 'green' }
  ]

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">ABD Ekonomik Verileri Yukleniyor...</div>
        </div>
      </div>
    )
  }

  if (error || !fredData) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-400">{error || 'Veri yuklenemedi'}</div>
        </div>
      </div>
    )
  }

  // Sesli açıklama metinleri
  const voiceSections = [
    {
      id: 'genel-bakis',
      name: 'Genel Bakış',
      description: `ABD Merkez Bankası Federal Reserve ekonomik verileri. ${fredData?.collection_info.successful_series || 0} veri serisi başarıyla yüklendi. Federal Reserve, ABD'nin merkez bankası olarak ülkenin ekonomisini izler ve para politikalarını belirler.`
    },
    {
      id: 'faiz-orani',
      name: 'Federal Fon Faiz Oranı',
      description: `Federal Reserve'in belirlediği çekirdek faiz oranıdır. Bankaların birbirlerine gecelik borç verirken kullandığı orandır. Mevcut değer ${getLatestValue('FEDFUNDS')?.toFixed(2)}%. Bu oran, tüm ekonomik faaliyetleri etkiler ve tüketici kredilerine de yansır.`
    },
    {
      id: 'gdp',
      name: 'Gayri Safi Yurt İçi Hasıla',
      description: `Bir ülkenin ekonomik büyüklüğünü gösteren en önemli göstergedir. ABD'nin bir yıllık toplam mal ve hizmet üretimini ölçer. ${fredData?.series.GDP ? `Son değer ${getLatestValue('GDP')?.toFixed(2)} trilyon dolar. ` : ''}Üç ayda bir güncellenir ve ekonomik performansın temel göstergesidir.`
    },
    {
      id: 'enflasyon',
      name: 'Tüketici Fiyat Endeksi',
      description: `Tüketici fiyat endeksi, günlük hayatta kullandığımız mal ve hizmetlerin fiyat değişimini ölçer. ${getLatestValue('CPIAUCSL')?.toFixed(2)} seviyesinde. Bu değer enflasyonu yansıtır ve yüksek oranlar paranın değer kaybettiğini gösterir. Merkez Bankası enflasyonu yüzde 2 seviyesinde tutmayı hedefler.`
    },
    {
      id: 'issizlik',
      name: 'İşsizlik Oranı',
      description: `İşgücünün yüzde kaçının çalışmadığını gösterir. Mevcut oran ${getLatestValue('UNRATE')?.toFixed(2)}%. Düşük işsizlik oranı güçlü ekonomi ve canlı istihdam piyasasının işaretidir. Bu oran, Federal Reserve'in para politikası kararlarını etkileyen önemli faktörlerden biridir.`
    },
    {
      id: 'tahvil',
      name: '10 Yıllık Hazine Tahvili',
      description: `ABD devletinin 10 yıllık tahvili için ödenen faiz oranıdır. Mevcut değer ${getLatestValue('DGS10')?.toFixed(2)}%. Bu oran, uzun vadeli ekonomik beklentiler ve enflasyon tahminlerini yansıtır. Yatırımcılar için ABD devlet tahvillerinin risksiz getiri oranı olarak kabul edilir ve diğer yatırım araçlarına göre kıyaslamada kullanılır.`
    }
  ]

  return (
    <div className="space-y-6">
      {/* Baslik ve Yenileme */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-blue-400" />
            ABD Ekonomik Gostergeler (FRED)
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Federal Reserve Ekonomik Verileri - {fredData.collection_info.successful_series}/{fredData.collection_info.total_series} seri
          </p>
        </div>
        <button
          onClick={loadFREDData}
          disabled={refreshing}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Yenile
        </button>
      </div>

      {/* Sesli Açıklama Kontrolü */}
      <div className="bg-gray-800 rounded-lg p-4">
        <VoiceControl
          sections={voiceSections}
          onSectionChange={(sectionId) => {
            // Bölüm değiştikçe ilgili seriyi seç
            const sectionToSeriesMap: Record<string, string> = {
              'faiz-orani': 'FEDFUNDS',
              'gdp': 'GDP',
              'enflasyon': 'CPIAUCSL',
              'issizlik': 'UNRATE',
              'tahvil': 'DGS10'
            }
            const seriesId = sectionToSeriesMap[sectionId]
            if (seriesId && fredData.series[seriesId]) {
              setSelectedSeries(seriesId)
            }
          }}
        />
      </div>

      {/* Anahtar Gostergeler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {keyIndicators.map((indicator) => {
          const latest = getLatestValue(indicator.id)
          const change = getChangePercent(indicator.id)
          const Icon = indicator.icon
          const series = fredData.series[indicator.id]

          return (
            <div
              key={indicator.id}
              className={`bg-gray-800 rounded-lg p-4 cursor-pointer border-2 transition-all ${selectedSeries === indicator.id
                  ? 'border-blue-500'
                  : 'border-transparent hover:border-gray-600'
                }`}
              onClick={() => setSelectedSeries(indicator.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-${indicator.color}-500/10`}>
                  <Icon className={`w-5 h-5 text-${indicator.color}-400`} />
                </div>
                {change !== null && (
                  <div className={`flex items-center text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {Math.abs(change).toFixed(2)}%
                  </div>
                )}
              </div>
              <h3 className="text-gray-400 text-sm mb-1">{indicator.name}</h3>
              <div className="text-2xl font-bold text-white">
                {latest !== null && series ? formatValue(latest, series.units) : 'N/A'}
              </div>
              {series && (
                <div className="text-xs text-gray-500 mt-1">
                  {series.data[series.data.length - 1]?.date}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Detayli Grafik */}
      {selectedSeries && fredData.series[selectedSeries] && (
        <div className="bg-gray-800 rounded-lg p-6">
          <ReactECharts
            option={getChartOption(selectedSeries)}
            style={{ height: '400px' }}
            opts={{ renderer: 'canvas' }}
          />
          <div className="mt-4 text-sm text-gray-400">
            <p className="font-semibold text-white mb-2">Aciklama:</p>
            <p className="line-clamp-3">{fredData.series[selectedSeries].description}</p>
          </div>
        </div>
      )}

      {/* Tum Seriler Listesi */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Tum Ekonomik Seriler</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(fredData.series).map(([id, series]) => (
            <button
              key={id}
              onClick={() => setSelectedSeries(id)}
              className={`text-left p-3 rounded-lg transition-all ${selectedSeries === id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
              <div className="font-semibold text-sm">{id}</div>
              <div className="text-xs opacity-75 line-clamp-1">{series.title}</div>
              <div className="text-xs opacity-60 mt-1">{series.record_count} veri noktasi</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FREDEconomicData
