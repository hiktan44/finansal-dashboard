import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Award, Target, BarChart3, Coins, Filter } from 'lucide-react'
import AudioPlayer from './AudioPlayer'

interface TefasFund {
  fund_code: string
  fund_name: string
  fund_type: string
  price: number
  performance_1m: number
  performance_3m: number
  performance_6m: number
  performance_1y: number
  risk_score: number
  expense_ratio: number
  volume: number
  category: string
}

interface FonAnaliziProps {
  // Props boş - component kendi verilerini çekecek
}

const FonAnalizi: React.FC<FonAnaliziProps> = () => {
  const [funds, setFunds] = useState<TefasFund[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<string>('performance_1y')

  useEffect(() => {
    fetchTefasData()
  }, [])

  const fetchTefasData = async () => {
    try {
      setLoading(true)
      const supabaseUrl = 'https://twbromyqdzzjdddqaivs.supabase.co'
      
      // TEFAS fonlarını Supabase'den getir
      const response = await fetch(`${supabaseUrl}/rest/v1/tefas_funds?order=${sortBy}.desc`, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3YnJvbXlxZHp6amRkZHFhaXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyOTM3MjMsImV4cCI6MjA3Nzg2OTcyM30.jrYmX6yy8OSlOw5Vv1xRDxoxvhAuRmnB3D34A3G7W9o',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3YnJvbXlxZHp6amRkZHFhaXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyOTM3MjMsImV4cCI6MjA3Nzg2OTcyM30.jrYmX6yy8OSlOw5Vv1xRDxoxvhAuRmnB3D34A3G7W9o'
        }
      })

      if (!response.ok) {
        throw new Error('TEFAS verileri alınamadı')
      }

      const data = await response.json()
      setFunds(data)
    } catch (err) {
      console.error('TEFAS data fetch error:', err)
      setError(err instanceof Error ? err.message : 'Veri yükleme hatası')
      
      // Fallback - Edge Function'dan çek
      try {
        const fallbackResponse = await fetch(`${supabaseUrl}/functions/v1/fetch-tefas-data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3YnJvbXlxZHp6amRkZHFhaXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyOTM3MjMsImV4cCI6MjA3Nzg2OTcyM30.jrYmX6yy8OSlOw5Vv1xRDxoxvhAuRmnB3D34A3G7W9o'
          }
        })

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          if (fallbackData.data) {
            setFunds(fallbackData.data)
            setError(null)
          }
        }
      } catch (fallbackErr) {
        console.error('Fallback fetch failed:', fallbackErr)
      }
    } finally {
      setLoading(false)
    }
  }

  const filterFunds = (funds: TefasFund[]) => {
    if (selectedFilter === 'ALL') return funds
    return funds.filter(fund => fund.fund_type === selectedFilter)
  }

  const sortedFunds = filterFunds(funds).sort((a, b) => {
    if (sortBy === 'risk_score') return a.risk_score - b.risk_score
    if (sortBy === 'expense_ratio') return a.expense_ratio - b.expense_ratio
    return b[sortBy as keyof TefasFund] as number - (a[sortBy as keyof TefasFund] as number)
  })

  const getTopPerformers = (count: number = 5) => {
    return [...funds]
      .sort((a, b) => b.performance_1y - a.performance_1y)
      .slice(0, count)
  }

  const getRiskClass = (riskScore: number) => {
    if (riskScore <= 2) return { label: 'Düşük Risk', color: 'green' }
    if (riskScore <= 3) return { label: 'Orta Risk', color: 'yellow' }
    return { label: 'Yüksek Risk', color: 'red' }
  }

  const getPerformanceColor = (performance: number) => {
    return performance >= 0 ? 'text-green-500' : 'text-red-500'
  }

  const fundTypeFilters = [
    { value: 'ALL', label: 'Tüm Fonlar' },
    { value: 'HISSE', label: 'Hisse Senedi' },
    { value: 'TAHVIL', label: 'Tahvil' },
    { value: 'KARMA', label: 'Karma' },
    { value: 'ALTIN', label: 'Altın' },
    { value: 'PARA', label: 'Para Piyasası' },
    { value: 'GYO', label: 'Gayrimenkul' }
  ]

  const sortOptions = [
    { value: 'performance_1y', label: '1 Yıllık Getiri' },
    { value: 'performance_6m', label: '6 Aylık Getiri' },
    { value: 'performance_3m', label: '3 Aylık Getiri' },
    { value: 'risk_score', label: 'Risk Skoru' },
    { value: 'expense_ratio', label: 'Yönetim Ücreti' },
    { value: 'volume', label: 'İşlem Hacmi' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-yellow-500 text-lg">TEFAS fon verileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Coins className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">TEFAS Fon Analizi</h2>
              <p className="text-gray-400">
                Türkiye'nin en iyi yatırım fonları analizi ve karşılaştırması
              </p>
            </div>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-1">
            <AudioPlayer 
              audioSrc="/audio/commodities.mp3"
              label="TEFAS Analizi Oynat"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Filtreler ve Sıralama */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <label className="text-gray-300 text-sm font-medium mb-2 block">
              Fon Türü Filtresi
            </label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
            >
              {fundTypeFilters.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-64">
            <label className="text-gray-300 text-sm font-medium mb-2 block">
              Sıralama
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* En İyi Performans Gösterenler */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center space-x-3 mb-6">
          <Award className="h-6 w-6 text-yellow-500" />
          <h3 className="text-xl font-bold text-white">En Yüksek Getiri (1 Yıl)</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {getTopPerformers().map((fund, index) => (
            <div key={fund.fund_code} className={`
              relative rounded-lg p-4 border transition-all
              ${index === 0 
                ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50' 
                : 'bg-gray-700/30 border-gray-600 hover:border-blue-500/50'
              }
            `}>
              {index === 0 && (
                <div className="absolute top-2 right-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                </div>
              )}
              <div className="text-center">
                <h4 className="font-semibold text-white text-sm mb-2">
                  {fund.fund_code}
                </h4>
                <p className="text-xs text-gray-400 mb-3">
                  {fund.fund_name.length > 30 ? `${fund.fund_name.substring(0, 30)}...` : fund.fund_name}
                </p>
                <div className="text-2xl font-bold text-green-500 mb-1">
                  +{fund.performance_1y.toFixed(1)}%
                </div>
                <p className="text-xs text-gray-400">
                  Risk: {fund.risk_score.toFixed(1)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fon Listesi */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Fon Detayları ({sortedFunds.length} Fon)</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 font-medium py-3 px-4">Fon</th>
                <th className="text-right text-gray-400 font-medium py-3 px-4">Fiyat</th>
                <th className="text-right text-gray-400 font-medium py-3 px-4">1A</th>
                <th className="text-right text-gray-400 font-medium py-3 px-4">6A</th>
                <th className="text-right text-gray-400 font-medium py-3 px-4">3A</th>
                <th className="text-right text-gray-400 font-medium py-3 px-4">1A</th>
                <th className="text-right text-gray-400 font-medium py-3 px-4">Risk</th>
                <th className="text-right text-gray-400 font-medium py-3 px-4">Yön. Ücreti</th>
              </tr>
            </thead>
            <tbody>
              {sortedFunds.map((fund) => {
                const riskClass = getRiskClass(fund.risk_score)
                return (
                  <tr key={fund.fund_code} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-semibold text-white">{fund.fund_code}</div>
                        <div className="text-sm text-gray-400">{fund.fund_name}</div>
                        <div className="text-xs text-blue-400">{fund.category}</div>
                      </div>
                    </td>
                    <td className="text-right py-4 px-4">
                      <div className="text-white font-mono">
                        {fund.price.toFixed(3)} TL
                      </div>
                    </td>
                    <td className="text-right py-4 px-4">
                      <span className={`font-semibold ${getPerformanceColor(fund.performance_1m)}`}>
                        {fund.performance_1m > 0 ? '+' : ''}{fund.performance_1m.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right py-4 px-4">
                      <span className={`font-semibold ${getPerformanceColor(fund.performance_3m)}`}>
                        {fund.performance_3m > 0 ? '+' : ''}{fund.performance_3m.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right py-4 px-4">
                      <span className={`font-semibold ${getPerformanceColor(fund.performance_6m)}`}>
                        {fund.performance_6m > 0 ? '+' : ''}{fund.performance_6m.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right py-4 px-4">
                      <span className={`font-semibold ${getPerformanceColor(fund.performance_1y)}`}>
                        {fund.performance_1y > 0 ? '+' : ''}{fund.performance_1y.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right py-4 px-4">
                      <span className={`
                        px-2 py-1 rounded text-xs font-medium
                        ${riskClass.color === 'green' ? 'bg-green-500/20 text-green-400' :
                          riskClass.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'}
                      `}>
                        {fund.risk_score.toFixed(1)}
                      </span>
                    </td>
                    <td className="text-right py-4 px-4">
                      <span className="text-gray-400">
                        %{fund.expense_ratio.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default FonAnalizi