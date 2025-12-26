import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, TrendingUp, TrendingDown, Loader2, PieChart, BarChart3, Edit } from 'lucide-react';
import { 
  fetchUserPortfolios, 
  fetchPortfolioHoldings, 
  fetchRiskMetrics,
  fetchDiversificationAnalysis,
  calculatePortfolioAnalytics,
  Portfolio as PortfolioType,
  PortfolioHolding,
  RiskMetric,
  DiversificationAnalysis as DivAnalysis,
  supabase,
  removeHoldingFromPortfolio
} from '@/lib/supabase';
import { AddAssetModal } from '@/components/AddAssetModal';
import { EditAssetModal } from '@/components/EditAssetModal';

export function Portfolio() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<PortfolioType[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioType | null>(null);
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([]);
  const [diversification, setDiversification] = useState<DivAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHolding, setEditingHolding] = useState<PortfolioHolding | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [calculatingAnalytics, setCalculatingAnalytics] = useState(false);

  useEffect(() => {
    if (user) {
      loadPortfolios();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPortfolio) {
      loadHoldings(selectedPortfolio.id);
      loadAnalytics(selectedPortfolio.id);
    }
  }, [selectedPortfolio]);

  const loadPortfolios = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await fetchUserPortfolios(user.id);
      setPortfolios(data);
      if (data.length > 0) {
        setSelectedPortfolio(data[0]);
      }
    } catch (error) {
      console.error('Error loading portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHoldings = async (portfolioId: string) => {
    try {
      const data = await fetchPortfolioHoldings(portfolioId);
      setHoldings(data);
    } catch (error) {
      console.error('Error loading holdings:', error);
    }
  };

  const loadAnalytics = async (portfolioId: string) => {
    try {
      const [metricsData, divData] = await Promise.all([
        fetchRiskMetrics(portfolioId),
        fetchDiversificationAnalysis(portfolioId)
      ]);
      
      setRiskMetrics(metricsData);
      setDiversification(divData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleCalculateAnalytics = async () => {
    if (!selectedPortfolio) return;

    setCalculatingAnalytics(true);
    try {
      await calculatePortfolioAnalytics(selectedPortfolio.id);
      await loadAnalytics(selectedPortfolio.id);
    } catch (error) {
      console.error('Error calculating analytics:', error);
    } finally {
      setCalculatingAnalytics(false);
    }
  };

  const handleRemoveHolding = async (holdingId: string) => {
    if (!window.confirm(t('confirmRemove'))) return;

    try {
      await removeHoldingFromPortfolio(holdingId);
      if (selectedPortfolio) {
        await loadHoldings(selectedPortfolio.id);
      }
    } catch (error) {
      console.error('Error removing holding:', error);
    }
  };

  const handleEditHolding = (holding: PortfolioHolding) => {
    setEditingHolding(holding);
    setShowEditModal(true);
  };

  const createDefaultPortfolio = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('portfolios')
        .insert({
          user_id: user.id,
          name: t('myPortfolio') || 'Portföyüm',
          description: t('defaultPortfolioDesc') || 'Ana portföy',
          currency: 'TRY',
          is_default: true
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setPortfolios([data]);
        setSelectedPortfolio(data);
      }
    } catch (error) {
      console.error('Error creating portfolio:', error);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('signInRequired')}
          </h2>
          <p className="text-gray-500">
            {t('signInToManagePortfolio')}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (portfolios.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('noPortfolio')}
          </h2>
          <p className="text-gray-500 mb-6">
            {t('createFirstPortfolio')}
          </p>
          <button
            onClick={createDefaultPortfolio}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>{t('createPortfolio')}</span>
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const totalValue = selectedPortfolio?.total_value || 0;
  const totalGainLoss = selectedPortfolio?.total_gain_loss || 0;
  const totalGainLossPercent = selectedPortfolio?.total_gain_loss_percent || 0;
  const isPositive = totalGainLoss >= 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('portfolio')}</h1>
          <p className="text-gray-500 mt-1">
            {t('manageYourInvestments')}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            <span>{t('analytics')}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>{t('addHolding')}</span>
          </button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-500 mb-1">{t('totalValue')}</div>
          <div className="text-3xl font-bold text-gray-900">
            {formatCurrency(totalValue, selectedPortfolio?.currency)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-500 mb-1">{t('totalGainLoss')}</div>
          <div className={`text-3xl font-bold flex items-center gap-2 ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
            {formatCurrency(Math.abs(totalGainLoss), selectedPortfolio?.currency)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-500 mb-1">{t('percentage')}</div>
          <div className={`text-3xl font-bold ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      {showAnalytics && (
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">{t('analytics')}</h2>
            <button
              onClick={handleCalculateAnalytics}
              disabled={calculatingAnalytics}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300"
            >
              {calculatingAnalytics ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('loading')}</span>
                </>
              ) : (
                <>
                  <PieChart className="w-4 h-4" />
                  <span>{t('refresh')}</span>
                </>
              )}
            </button>
          </div>

          {/* Risk Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">{t('volatility')}</div>
              <div className="text-2xl font-bold text-gray-900">
                {riskMetrics.find(m => m.metric_type === 'volatility')?.value.toFixed(2) || '--'}%
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">{t('sharpeRatio')}</div>
              <div className="text-2xl font-bold text-gray-900">
                {riskMetrics.find(m => m.metric_type === 'sharpe_ratio')?.value.toFixed(2) || '--'}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">{t('maxDrawdown')}</div>
              <div className="text-2xl font-bold text-red-600">
                {riskMetrics.find(m => m.metric_type === 'max_drawdown')?.value.toFixed(2) || '--'}%
              </div>
            </div>
          </div>

          {/* Diversification */}
          {diversification && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">{t('diversification')}</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">{t('diversificationScore')}</div>
                  <div className="text-xl font-bold text-blue-600">
                    {diversification.diversification_score?.toFixed(1) || '--'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">{t('concentrationScore')}</div>
                  <div className="text-xl font-bold text-gray-900">
                    {diversification.concentration_score?.toFixed(2) || '--'}
                  </div>
                </div>
              </div>
              {diversification.recommendations && (
                <div className="mt-3">
                  <div className="text-xs text-gray-500 mb-1">{t('recommendations')}</div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {diversification.recommendations.map((rec: string, idx: number) => (
                      <li key={idx}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Holdings Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{t('holdings')}</h2>
        </div>

        {holdings.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">{t('noHoldings')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('symbol')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('quantity')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('purchasePrice')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('currentPrice')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('currentValue')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('gainLoss')}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {holdings.map((holding) => {
                  const isHoldingPositive = (holding.gain_loss || 0) >= 0;
                  return (
                    <tr key={holding.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{holding.symbol}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {holding.quantity.toFixed(4)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {formatCurrency(holding.purchase_price, selectedPortfolio?.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {formatCurrency(holding.current_price, selectedPortfolio?.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {formatCurrency(holding.current_value, selectedPortfolio?.currency)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                        isHoldingPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isHoldingPositive ? '+' : ''}{formatCurrency(holding.gain_loss, selectedPortfolio?.currency)}
                        <div className="text-xs">
                          ({isHoldingPositive ? '+' : ''}{holding.gain_loss_percent.toFixed(2)}%)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditHolding(holding)}
                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            <span>{t('edit')}</span>
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleRemoveHolding(holding.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            {t('remove')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Asset Modal */}
      {selectedPortfolio && (
        <AddAssetModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          portfolioId={selectedPortfolio.id}
          onSuccess={() => {
            if (selectedPortfolio) {
              loadHoldings(selectedPortfolio.id);
            }
          }}
        />
      )}

      {/* Edit Asset Modal */}
      {editingHolding && (
        <EditAssetModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingHolding(null);
          }}
          holding={editingHolding}
          onSuccess={() => {
            if (selectedPortfolio) {
              loadHoldings(selectedPortfolio.id);
            }
          }}
        />
      )}
    </div>
  );
}
