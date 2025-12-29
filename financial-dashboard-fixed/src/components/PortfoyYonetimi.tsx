import React, { useState, useEffect } from 'react'
import { PlusCircle, TrendingUp, TrendingDown, Target, AlertCircle, PieChart, BarChart3, RefreshCw, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface PortfolioItem {
  id?: number
  symbol: string
  asset_name: string
  asset_type: string
  quantity: number
  avg_purchase_price: number
  current_price?: number
  total_investment?: number
  current_value?: number
  profit_loss?: number
  profit_loss_percent?: number
  purchase_date: string
  commission?: number
}

interface Portfolio {
  id: number
  portfolio_name: string
  description: string
  total_investment: number
  current_value: number
  profit_loss: number
  profit_loss_percent: number
  created_at: string
}

interface RiskMetrics {
  diversification_score: number
  volatility_estimate: number
  sector_exposure: { [key: string]: number }
  top_positions: Array<{
    symbol: string
    asset_name: string
    current_value: number
    profit_loss_percent: number
  }>
}

const PortfoyYonetimi: React.FC = () => {
  const { user } = useAuth()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [newPortfolioName, setNewPortfolioName] = useState('')
  const [newItem, setNewItem] = useState<Partial<PortfolioItem>>({
    symbol: '',
    asset_name: '',
    asset_type: 'STOCK',
    quantity: 0,
    avg_purchase_price: 0,
    purchase_date: new Date().toISOString().split('T')[0],
    commission: 0
  })

  const supabaseUrl = 'https://twbromyqdzzjdddqaivs.supabase.co'
  const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3YnJvbXlxZHp6amRkZHFhaXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyOTM3MjMsImV4cCI6MjA3Nzg2OTcyM30.jrYmX6yy8OSlOw5Vv1xRDxoxvhAuRmnB3D34A3G7W9o'

  useEffect(() => {
    if (user) {
      fetchPortfolios()
    }
  }, [user])

  useEffect(() => {
    if (selectedPortfolio) {
      fetchPortfolioItems()
    }
  }, [selectedPortfolio])

  const fetchPortfolios = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${supabaseUrl}/rest/v1/user_portfolios?user_id=eq.${user?.id}&is_active=eq.true`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`
        }
      })

      if (!response.ok) throw new Error('Portföy verileri alınamadı')

      const data = await response.json()
      setPortfolios(data)
      
      if (data.length > 0 && !selectedPortfolio) {
        setSelectedPortfolio(data[0])
      }
    } catch (err) {
      console.error('Portfolio fetch error:', err)
      setError(err instanceof Error ? err.message : 'Portföy yükleme hatası')
    } finally {
      setLoading(false)
    }
  }

  const fetchPortfolioItems = async () => {
    if (!selectedPortfolio) return

    try {
      setLoading(true)
      const response = await fetch(`${supabaseUrl}/rest/v1/portfolio_items?portfolio_id=eq.${selectedPortfolio.id}`, {
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`
        }
      })

      if (!response.ok) throw new Error('Portföy detayları alınamadı')

      const data = await response.json()
      setPortfolioItems(data)

      // Portföy hesaplamalarını tetikle
      if (data.length > 0) {
        await calculatePortfolio()
      }
    } catch (err) {
      console.error('Portfolio items fetch error:', err)
      setError(err instanceof Error ? err.message : 'Portföy detayları yükleme hatası')
    } finally {
      setLoading(false)
    }
  }

  const calculatePortfolio = async () => {
    if (!selectedPortfolio) return

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/calculate-portfolio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ portfolio_id: selectedPortfolio.id })
      })

      if (!response.ok) throw new Error('Portföy hesaplama hatası')

      const data = await response.json()
      
      if (data.success) {
        setRiskMetrics(data.risk_metrics)
        setPortfolioItems(data.items)
        
        // Portfolio özet bilgilerini güncelle
        setSelectedPortfolio(prev => prev ? {
          ...prev,
          total_investment: data.portfolio_summary.total_investment,
          current_value: data.portfolio_summary.current_value,
          profit_loss: data.portfolio_summary.profit_loss,
          profit_loss_percent: data.portfolio_summary.profit_loss_percent
        } : null)
      }
    } catch (err) {
      console.error('Portfolio calculation error:', err)
    }
  }

  const createPortfolio = async () => {
    if (!user || !newPortfolioName.trim()) return

    try {
      setLoading(true)
      const response = await fetch(`${supabaseUrl}/rest/v1/user_portfolios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          user_id: user.id,
          portfolio_name: newPortfolioName.trim(),
          description: `${newPortfolioName} portföyü`,
          is_active: true
        })
      })

      if (!response.ok) throw new Error('Portföy oluşturulamadı')

      setNewPortfolioName('')
      await fetchPortfolios()
    } catch (err) {
      console.error('Portfolio creation error:', err)
      setError(err instanceof Error ? err.message : 'Portföy oluşturma hatası')
    } finally {
      setLoading(false)
    }
  }

  const addPortfolioItem = async () => {
    if (!selectedPortfolio || !newItem.symbol || !newItem.quantity || !newItem.avg_purchase_price) {
      setError('Lütfen tüm alanları doldurun')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${supabaseUrl}/rest/v1/portfolio_items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          portfolio_id: selectedPortfolio.id,
          symbol: newItem.symbol?.toUpperCase(),
          asset_name: newItem.asset_name || newItem.symbol,
          asset_type: newItem.asset_type,
          quantity: newItem.quantity,
          avg_purchase_price: newItem.avg_purchase_price,
          purchase_date: newItem.purchase_date,
          commission: newItem.commission || 0
        })
      })

      if (!response.ok) throw new Error('Varlık eklenemedi')

      // Form'u temizle
      setNewItem({
        symbol: '',
        asset_name: '',
        asset_type: 'STOCK',
        quantity: 0,
        avg_purchase_price: 0,
        purchase_date: new Date().toISOString().split('T')[0],
        commission: 0
      })
      setShowAddModal(false)
      await fetchPortfolioItems()
    } catch (err) {
      console.error('Add item error:', err)
      setError(err instanceof Error ? err.message : 'Varlık ekleme hatası')
    } finally {
      setLoading(false)
    }
  }

  const deletePortfolioItem = async (itemId: number) => {
    if (!confirm('Bu varlığı portföyden çıkarmak istediğinizden emin misiniz?')) return

    try {
      setLoading(true)
      const response = await fetch(`${supabaseUrl}/rest/v1/portfolio_items?id=eq.${itemId}`, {
        method: 'DELETE',
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`
        }
      })

      if (!response.ok) throw new Error('Varlık silinemedi')

      await fetchPortfolioItems()
    } catch (err) {
      console.error('Delete item error:', err)
      setError(err instanceof Error ? err.message : 'Varlık silme hatası')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Giriş Yapın</h3>
        <p className="text-gray-400">
          Portföy yönetimi için lütfen giriş yapın.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-500/20 p-3 rounded-lg">
              <PieChart className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Portföy Yönetimi</h2>
              <p className="text-gray-400">Yatırım portföyünüzü izleyin ve yönetin</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={calculatePortfolio}
              disabled={!selectedPortfolio || loading}
              className="bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Güncelle</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Portföy Seçici */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <label className="text-gray-300 text-sm font-medium mb-2 block">
              Portföy Seçin
            </label>
            <select
              value={selectedPortfolio?.id || ''}
              onChange={(e) => {
                const portfolio = portfolios.find(p => p.id === parseInt(e.target.value))
                setSelectedPortfolio(portfolio || null)
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Portföy seçin...</option>
              {portfolios.map(portfolio => (
                <option key={portfolio.id} value={portfolio.id}>
                  {portfolio.portfolio_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-gray-300 text-sm font-medium mb-2 block">
              Yeni Portföy Oluştur
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newPortfolioName}
                onChange={(e) => setNewPortfolioName(e.target.value)}
                placeholder="Portföy adı..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={createPortfolio}
                disabled={!newPortfolioName.trim() || loading}
                className="bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg"
              >
                Oluştur
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedPortfolio && (
        <>
          {/* Portföy Özeti */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3">
                <Target className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-gray-400 text-sm">Toplam Yatırım</p>
                  <p className="text-2xl font-bold text-white">
                    {selectedPortfolio.total_investment?.toLocaleString('tr-TR', { 
                      style: 'currency', currency: 'TRY' 
                    }) || '₺0'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-gray-400 text-sm">Güncel Değer</p>
                  <p className="text-2xl font-bold text-white">
                    {selectedPortfolio.current_value?.toLocaleString('tr-TR', { 
                      style: 'currency', currency: 'TRY' 
                    }) || '₺0'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3">
                {(selectedPortfolio.profit_loss || 0) >= 0 ? 
                  <TrendingUp className="h-8 w-8 text-green-500" /> : 
                  <TrendingDown className="h-8 w-8 text-red-500" />
                }
                <div>
                  <p className="text-gray-400 text-sm">Kar/Zarar</p>
                  <p className={`text-2xl font-bold ${(selectedPortfolio.profit_loss || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {selectedPortfolio.profit_loss?.toLocaleString('tr-TR', { 
                      style: 'currency', currency: 'TRY' 
                    }) || '₺0'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3">
                <Target className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-gray-400 text-sm">Getiri Oranı</p>
                  <p className={`text-2xl font-bold ${(selectedPortfolio.profit_loss_percent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(selectedPortfolio.profit_loss_percent || 0) >= 0 ? '+' : ''}
                    {selectedPortfolio.profit_loss_percent?.toFixed(2) || '0.00'}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Metrikleri */}
          {riskMetrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Risk Analizi</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Çeşitlendirme Skoru:</span>
                    <span className="text-white font-semibold">
                      {riskMetrics.diversification_score?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Volatilite Tahmini:</span>
                    <span className="text-white font-semibold">
                      {riskMetrics.volatility_estimate?.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Sektör Dağılımı</h3>
                <div className="space-y-2">
                  {Object.entries(riskMetrics.sector_exposure || {}).map(([sector, percentage]) => (
                    <div key={sector} className="flex justify-between">
                      <span className="text-gray-400">{sector}:</span>
                      <span className="text-white font-semibold">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Portföy Detayları */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Portföy Detayları</h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Varlık Ekle</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 font-medium py-3 px-4">Varlık</th>
                    <th className="text-right text-gray-400 font-medium py-3 px-4">Adet</th>
                    <th className="text-right text-gray-400 font-medium py-3 px-4">Alış Fiyatı</th>
                    <th className="text-right text-gray-400 font-medium py-3 px-4">Güncel Fiyat</th>
                    <th className="text-right text-gray-400 font-medium py-3 px-4">Yatırım</th>
                    <th className="text-right text-gray-400 font-medium py-3 px-4">Güncel Değer</th>
                    <th className="text-right text-gray-400 font-medium py-3 px-4">Kar/Zarar</th>
                    <th className="text-right text-gray-400 font-medium py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-semibold text-white">{item.symbol}</div>
                          <div className="text-sm text-gray-400">{item.asset_name}</div>
                          <div className="text-xs text-blue-400">{item.asset_type}</div>
                        </div>
                      </td>
                      <td className="text-right py-4 px-4 text-white">
                        {item.quantity.toLocaleString('tr-TR')}
                      </td>
                      <td className="text-right py-4 px-4 text-white font-mono">
                        {item.avg_purchase_price.toLocaleString('tr-TR', { 
                          minimumFractionDigits: 2 
                        })}
                      </td>
                      <td className="text-right py-4 px-4 text-white font-mono">
                        {(item.current_price || item.avg_purchase_price).toLocaleString('tr-TR', { 
                          minimumFractionDigits: 2 
                        })}
                      </td>
                      <td className="text-right py-4 px-4 text-white">
                        {(item.total_investment || 0).toLocaleString('tr-TR', { 
                          style: 'currency', currency: 'TRY' 
                        })}
                      </td>
                      <td className="text-right py-4 px-4 text-white">
                        {(item.current_value || 0).toLocaleString('tr-TR', { 
                          style: 'currency', currency: 'TRY' 
                        })}
                      </td>
                      <td className="text-right py-4 px-4">
                        <div className={`${(item.profit_loss_percent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          <div>
                            {(item.profit_loss_percent || 0) >= 0 ? '+' : ''}
                            {(item.profit_loss_percent || 0).toFixed(2)}%
                          </div>
                          <div className="text-xs">
                            {(item.profit_loss || 0).toLocaleString('tr-TR', { 
                              style: 'currency', currency: 'TRY' 
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-4 px-4">
                        <button
                          onClick={() => deletePortfolioItem(item.id!)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Varlık Ekleme Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-96 max-w-[90vw]">
            <h3 className="text-xl font-bold text-white mb-4">Yeni Varlık Ekle</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Sembol *
                </label>
                <input
                  type="text"
                  value={newItem.symbol || ''}
                  onChange={(e) => setNewItem(prev => ({ 
                    ...prev, 
                    symbol: e.target.value.toUpperCase(),
                    asset_name: e.target.value.toUpperCase() 
                  }))}
                  placeholder="THYAO, GARAN, vb."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Varlık Türü
                </label>
                <select
                  value={newItem.asset_type || 'STOCK'}
                  onChange={(e) => setNewItem(prev => ({ ...prev, asset_type: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="STOCK">Hisse Senedi</option>
                  <option value="FUND">Yatırım Fonu</option>
                  <option value="CRYPTO">Kripto Para</option>
                  <option value="BOND">Tahvil</option>
                  <option value="COMMODITY">Emtia</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Adet *
                  </label>
                  <input
                    type="number"
                    value={newItem.quantity || ''}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                    placeholder="100"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Alış Fiyatı *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.avg_purchase_price || ''}
                    onChange={(e) => setNewItem(prev => ({ ...prev, avg_purchase_price: parseFloat(e.target.value) || 0 }))}
                    placeholder="85.50"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Alış Tarihi
                  </label>
                  <input
                    type="date"
                    value={newItem.purchase_date || ''}
                    onChange={(e) => setNewItem(prev => ({ ...prev, purchase_date: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Komisyon
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.commission || ''}
                    onChange={(e) => setNewItem(prev => ({ ...prev, commission: parseFloat(e.target.value) || 0 }))}
                    placeholder="5.00"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg"
              >
                İptal
              </button>
              <button
                onClick={addPortfolioItem}
                disabled={loading || !newItem.symbol || !newItem.quantity || !newItem.avg_purchase_price}
                className="flex-1 bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg"
              >
                {loading ? 'Ekleniyor...' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PortfoyYonetimi