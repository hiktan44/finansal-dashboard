import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, TrendingUp, TrendingDown, Loader2, Plus } from 'lucide-react';
import { fetchFunds, Fund, fetchTEFASFunds } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function Funds() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [funds, setFunds] = useState<Fund[]>([]);
  const [filteredFunds, setFilteredFunds] = useState<Fund[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFunds();
  }, []);

  useEffect(() => {
    filterFunds();
  }, [searchQuery, selectedType, funds]);

  const loadFunds = async () => {
    setLoading(true);
    try {
      const data = await fetchFunds();
      setFunds(data);
      setFilteredFunds(data);
    } catch (error) {
      console.error('Error loading funds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchTEFASFunds();
      await loadFunds();
    } catch (error) {
      console.error('Error refreshing funds:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filterFunds = () => {
    let filtered = funds;

    if (selectedType !== 'all') {
      filtered = filtered.filter(fund => fund.fund_type === selectedType);
    }

    if (searchQuery) {
      filtered = filtered.filter(fund =>
        fund.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fund.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredFunds(filtered);
  };

  const fundTypes = [
    { value: 'all', label: t('all') },
    { value: 'equity', label: t('equityFund') },
    { value: 'bond', label: t('bondFund') },
    { value: 'mixed', label: t('mixedFund') },
    { value: 'money_market', label: t('moneyMarketFund') },
    { value: 'precious_metal', label: t('preciousMetalFund') },
  ];

  const formatCurrency = (value: number | undefined, currency: string = 'TRY') => {
    if (!value) return '--';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatLargeNumber = (value: number | undefined | null) => {
    if (value === null || value === undefined || isNaN(value)) return '--';
    const numValue = Number(value);
    if (numValue >= 1000000000) {
      return `${(numValue / 1000000000).toFixed(2)}B`;
    }
    if (numValue >= 1000000) {
      return `${(numValue / 1000000).toFixed(2)}M`;
    }
    return numValue.toFixed(0);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('funds')}</h1>
          <p className="text-gray-500 mt-1">
            TEFAS Yatırım Fonları ({filteredFunds.length} fon)
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300"
        >
          {refreshing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t('loading')}</span>
            </>
          ) : (
            <span>{t('refresh')}</span>
          )}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search')}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {fundTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === type.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Funds Grid */}
      {filteredFunds.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('noData')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFunds.map((fund) => {
            const isPositive = (fund.change_percent || 0) >= 0;
            
            return (
              <div
                key={fund.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">{fund.symbol}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{fund.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {fund.fund_type === 'equity' && t('equityFund')}
                      {fund.fund_type === 'bond' && t('bondFund')}
                      {fund.fund_type === 'mixed' && t('mixedFund')}
                      {fund.fund_type === 'money_market' && t('moneyMarketFund')}
                      {fund.fund_type === 'precious_metal' && t('preciousMetalFund')}
                    </span>
                  </div>
                </div>

                {/* NAV */}
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">{t('nav')}</div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(fund.nav, fund.currency)}
                    </span>
                    {fund.change_percent !== undefined && fund.change_percent !== null && (
                      <span className={`flex items-center gap-1 text-sm font-medium ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {isPositive ? '+' : ''}{Number(fund.change_percent).toFixed(2)}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Performance */}
                <div className="mb-4 grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">1 Ay</div>
                    <div className={`text-sm font-medium ${
                      (fund.performance_1m || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {fund.performance_1m !== undefined && fund.performance_1m !== null ? 
                        `${fund.performance_1m >= 0 ? '+' : ''}${Number(fund.performance_1m).toFixed(2)}%` : '--'}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">3 Ay</div>
                    <div className={`text-sm font-medium ${
                      (fund.performance_3m || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {fund.performance_3m !== undefined && fund.performance_3m !== null ? 
                        `${fund.performance_3m >= 0 ? '+' : ''}${Number(fund.performance_3m).toFixed(2)}%` : '--'}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">1 Yıl</div>
                    <div className={`text-sm font-medium ${
                      (fund.performance_1y || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {fund.performance_1y !== undefined && fund.performance_1y !== null ? 
                        `${fund.performance_1y >= 0 ? '+' : ''}${Number(fund.performance_1y).toFixed(2)}%` : '--'}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="text-xs text-gray-500 space-y-1 mb-4">
                  <div className="flex justify-between">
                    <span>{t('aum')}:</span>
                    <span className="font-medium text-gray-700">{formatLargeNumber(fund.aum)} TL</span>
                  </div>
                  {fund.expense_ratio !== undefined && fund.expense_ratio !== null && (
                    <div className="flex justify-between">
                      <span>{t('expenseRatio')}:</span>
                      <span className="font-medium text-gray-700">%{Number(fund.expense_ratio).toFixed(2)}</span>
                    </div>
                  )}
                  {fund.risk_score !== undefined && fund.risk_score !== null && (
                    <div className="flex justify-between">
                      <span>{t('riskScore')}:</span>
                      <span className="font-medium text-gray-700">{Number(fund.risk_score).toFixed(1)}/10</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {user && (
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                      <Plus className="w-4 h-4" />
                      <span>{t('addToPortfolio')}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
