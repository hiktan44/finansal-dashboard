import React, { useState, useEffect } from 'react'
import { Briefcase, Plus, TrendingUp, TrendingDown, DollarSign, BarChart3, RefreshCw, Trash2, PieChart } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Portfolio, PortfolioHolding, PortfolioCalculation, PerformanceMetrics, AddHoldingFormData } from '../../types/portfolio'
import { 
  getUserPortfolios, 
  createPortfolio, 
  getPortfolioHoldings,
  addHolding,
  deleteHolding,
  calculatePortfolio,
  getPerformanceMetrics
} from '../../lib/supabase'
import AddHoldingModal from './AddHoldingModal'

export default function PortfolioDashboard() {
  const { user } = useAuth()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([])
  const [calculation, setCalculation] = useState<PortfolioCalculation | null>(null)
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPortfolioName, setNewPortfolioName] = useState('')

  useEffect(() => {
    if (user) {
      loadPortfolios()
    }
  }, [user])

  useEffect(() => {
    if (selectedPortfolio) {
      loadPortfolioData()
    }
  }, [selectedPortfolio])

  const loadPortfolios = async () => {
    if (!user) return
    const data = await getUserPortfolios(user.id)
    setPortfolios(data)
    if (data.length > 0 && !selectedPortfolio) {
      setSelectedPortfolio(data[0])
    }
  }

  const loadPortfolioData = async () => {
    if (!selectedPortfolio) return
    setLoading(true)
    try {
      const [holdingsData, calcData, metricsData] = await Promise.all([
        getPortfolioHoldings(selectedPortfolio.id),
        calculatePortfolio(selectedPortfolio.id),
        getPerformanceMetrics(selectedPortfolio.id)
      ])

      setHoldings(holdingsData)
      setCalculation(calcData)
      setMetrics(metricsData)
    } catch (error) {
      console.error('Error loading portfolio data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePortfolio = async () => {
    if (!user || !newPortfolioName.trim()) return
    try {
      const portfolio = await createPortfolio({
        user_id: user.id,
        name: newPortfolioName,
        initial_capital: 10000,
        currency: 'USD'
      })
      setPortfolios([portfolio, ...portfolios])
      setSelectedPortfolio(portfolio)
      setNewPortfolioName('')
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating portfolio:', error)
    }
  }

  const handleAddHolding = async (formData: AddHoldingFormData) => {
    if (!selectedPortfolio) return
    try {
      await addHolding({
        portfolio_id: selectedPortfolio.id,
        ...formData
      })
      await loadPortfolioData()
    } catch (error) {
      console.error('Error adding holding:', error)
      throw error
    }
  }

  const handleDeleteHolding = async (holdingId: string) => {
    if (!confirm('Bu hisseyi portföyden kaldırmak istediğinize emin misiniz?')) return
    try {
      await deleteHolding(holdingId)
      await loadPortfolioData()
    } catch (error) {
      console.error('Error deleting holding:', error)
    }
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800/50 rounded-xl p-8 text-center">
          <Briefcase className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Portföy Takibi</h3>
          <p className="text-gray-400 mb-4">Tam özellikler için giriş yapın</p>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
            <p className="text-blue-400 text-sm">
              💡 Demo: Aşağıda örnek portföy gösterimi bulabilirsiniz
            </p>
          </div>
        </div>
        
        {/* Demo Portfolio */}
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Örnek Portföy</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-green-100 text-sm">Portföy Değeri</p>
                <DollarSign className="h-5 w-5 text-green-200" />
              </div>
              <h3 className="text-2xl font-bold text-white">₺125,430</h3>
              <p className="text-green-100 text-sm">+5.67% bu ay</p>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-100 text-sm">Günlük Değişim</p>
                <TrendingUp className="h-5 w-5 text-blue-200" />
              </div>
              <h3 className="text-2xl font-bold text-white">+₺1,234</h3>
              <p className="text-blue-100 text-sm">+0.99%</p>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-purple-100 text-sm">Hisse Sayısı</p>
                <BarChart3 className="h-5 w-5 text-purple-200" />
              </div>
              <h3 className="text-2xl font-bold text-white">5</h3>
              <p className="text-purple-100 text-sm">farklı hisse</p>
            </div>
          </div>
          
          {/* Demo Holdings */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Portföy İçeriği (Demo)</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">ASELS</span>
                <span className="text-green-400">+2.45%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">AKBNK</span>
                <span className="text-red-400">-0.83%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">THYAO</span>
                <span className="text-green-400">+1.12%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">BIMAS</span>
                <span className="text-green-400">+0.67%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">SISE</span>
                <span className="text-red-400">-1.23%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
          <Briefcase className="h-8 w-8 text-blue-400" />
          <span>Portföy Yönetimi</span>
        </h2>
        {selectedPortfolio && (
          <button
            onClick={loadPortfolioData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Yenile</span>
          </button>
        )}
      </div>

      {/* Portfolio Selector */}
      <div className="bg-gray-800/50 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <select
            value={selectedPortfolio?.id || ''}
            onChange={(e) => {
              const portfolio = portfolios.find(p => p.id === e.target.value)
              if (portfolio) setSelectedPortfolio(portfolio)
            }}
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            {portfolios.length === 0 && (
              <option value="">Portföy bulunamadı</option>
            )}
            {portfolios.map(portfolio => (
              <option key={portfolio.id} value={portfolio.id}>
                {portfolio.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Yeni Portföy</span>
          </button>
        </div>

        {showCreateForm && (
          <div className="mt-4 flex space-x-3">
            <input
              type="text"
              value={newPortfolioName}
              onChange={(e) => setNewPortfolioName(e.target.value)}
              placeholder="Portföy adı..."
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleCreatePortfolio()}
            />
            <button
              onClick={handleCreatePortfolio}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Oluştur
            </button>
          </div>
        )}
      </div>

      {selectedPortfolio && (
        <>
          {/* Summary Cards - only show if calculation data exists */}
          {calculation && (
          <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-100 text-sm">Portföy Değeri</p>
                <DollarSign className="h-5 w-5 text-blue-200" />
              </div>
              <p className="text-white text-2xl font-bold">
                ${calculation.total_value.toFixed(2)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-green-100 text-sm">Kar/Zarar</p>
                {calculation.total_gain_loss >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-200" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-200" />
                )}
              </div>
              <p className={`text-2xl font-bold ${calculation.total_gain_loss >= 0 ? 'text-white' : 'text-red-200'}`}>
                ${Math.abs(calculation.total_gain_loss).toFixed(2)}
              </p>
              <p className={`text-sm ${calculation.total_gain_loss >= 0 ? 'text-green-200' : 'text-red-300'}`}>
                {calculation.total_gain_loss >= 0 ? '+' : ''}{calculation.total_gain_loss_percent.toFixed(2)}%
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-purple-100 text-sm">Maliyet</p>
                <BarChart3 className="h-5 w-5 text-purple-200" />
              </div>
              <p className="text-white text-2xl font-bold">
                ${calculation.total_cost.toFixed(2)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-orange-100 text-sm">Hisse Sayısı</p>
                <PieChart className="h-5 w-5 text-orange-200" />
              </div>
              <p className="text-white text-2xl font-bold">
                {calculation.holdings_with_current.length}
              </p>
            </div>
          </div>

          {/* Performance Metrics */}
          {metrics && (
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="text-white font-semibold text-lg mb-4">Performans Metrikleri</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">ROI</p>
                  <p className="text-white text-xl font-semibold">{metrics.roi.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Volatilite</p>
                  <p className="text-white text-xl font-semibold">{metrics.volatility.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Sharpe Ratio</p>
                  <p className="text-white text-xl font-semibold">{metrics.sharpe_ratio.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Max Düşüş</p>
                  <p className="text-white text-xl font-semibold">{metrics.max_drawdown.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          )}
          </>
          )}

          {/* Holdings Table - always show if portfolio selected */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">Hisseler</h3>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Hisse Ekle</span>
              </button>
            </div>

            {!calculation || calculation.holdings_with_current.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">Henüz hisse eklenmemiş</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  İlk Hisseyi Ekle
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                      <th className="pb-3">Sembol</th>
                      <th className="pb-3 text-right">Miktar</th>
                      <th className="pb-3 text-right">Ort. Fiyat</th>
                      <th className="pb-3 text-right">Güncel</th>
                      <th className="pb-3 text-right">Değer</th>
                      <th className="pb-3 text-right">Kar/Zarar</th>
                      <th className="pb-3 text-right">%</th>
                      <th className="pb-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculation && calculation.holdings_with_current.map((holding, index) => (
                      <tr key={index} className="text-white border-b border-gray-700/50">
                        <td className="py-4 font-semibold">{holding.symbol}</td>
                        <td className="py-4 text-right">{holding.quantity.toFixed(2)}</td>
                        <td className="py-4 text-right">${holding.average_price.toFixed(2)}</td>
                        <td className="py-4 text-right">${holding.current_price?.toFixed(2)}</td>
                        <td className="py-4 text-right font-semibold">${holding.market_value?.toFixed(2)}</td>
                        <td className={`py-4 text-right font-semibold ${(holding.gain_loss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${Math.abs(holding.gain_loss || 0).toFixed(2)}
                        </td>
                        <td className={`py-4 text-right ${(holding.gain_loss_percent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {(holding.gain_loss_percent || 0) >= 0 ? '+' : ''}{holding.gain_loss_percent?.toFixed(2)}%
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleDeleteHolding(holding.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <AddHoldingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddHolding}
      />
    </div>
  )
}
