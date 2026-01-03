import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, TrendingDown, ArrowLeft, Plus, Loader2, 
  BarChart3, LineChart, Activity, Target, AlertCircle 
} from 'lucide-react';
import {
  fetchAssetBySymbol,
  fetchFundBySymbol,
  fetchPriceHistory,
  Asset,
  Fund,
  supabase
} from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { AIAnalysisPanel } from '@/components/AIAnalysisPanel';
import { AdvancedCandlestickChart } from '@/components/AdvancedCandlestickChart';

export function AssetDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [asset, setAsset] = useState<Asset | Fund | null>(null);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [ohlcvData, setOhlcvData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'details'>('overview');

  useEffect(() => {
    if (symbol) {
      loadAssetData();
    }
  }, [symbol]);

  const loadAssetData = async () => {
    if (!symbol) return;

    setLoading(true);
    try {
      // Try to fetch as regular asset first
      let assetData: Asset | Fund | null = await fetchAssetBySymbol(symbol);
      
      // If not found, try as fund
      if (!assetData) {
        assetData = await fetchFundBySymbol(symbol);
      }

      if (assetData) {
        setAsset(assetData);

        // Load price history if regular asset
        if (assetData && 'asset_type' in assetData) {
          const history = await fetchPriceHistory(symbol, 30);
          setPriceHistory(history);

          // Fetch OHLCV data for candlestick chart
          const { data: ohlcvResponse } = await supabase.functions.invoke('fetch-ohlcv-data', {
            body: { symbol, interval: '1d', range: '1mo' }
          });

          if (ohlcvResponse?.data?.ohlcv) {
            setOhlcvData(ohlcvResponse.data.ohlcv);
          }
        }
      }
    } catch (error) {
      console.error('Error loading asset:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | undefined, currency: string = 'TRY') => {
    if (!value) return '--';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getPrice = () => {
    if (!asset) return 0;
    return 'price' in asset ? asset.price : ('nav' in asset ? asset.nav : 0);
  };

  const getChangePercent = () => {
    if (!asset) return 0;
    return 'change_percent' in asset ? asset.change_percent : 0;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Varlık Bulunamadı</h2>
        <p className="text-gray-500 mb-6">Aradığınız varlık sistemde mevcut değil.</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Geri Dön</span>
        </button>
      </div>
    );
  }

  const price = getPrice();
  const changePercent = getChangePercent() || 0;
  const isPositive = changePercent >= 0;
  const isFund = 'fund_type' in asset;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Geri</span>
      </button>

      {/* Asset Info Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{asset.symbol}</h1>
            <p className="text-lg text-gray-600">{asset.name}</p>
            {isFund && (
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {asset.fund_type === 'equity' && 'Hisse Senedi Fonu'}
                {asset.fund_type === 'bond' && 'Tahvil Fonu'}
                {asset.fund_type === 'mixed' && 'Karma Fon'}
                {asset.fund_type === 'money_market' && 'Para Piyasası Fonu'}
                {asset.fund_type === 'precious_metal' && 'Altın Fonu'}
              </span>
            )}
          </div>

          {user && (
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-5 h-5" />
              <span>{t('addToPortfolio')}</span>
            </button>
          )}
        </div>

        {/* Price Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">{isFund ? t('nav') : t('price')}</div>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(price, asset.currency)}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">{t('change')}</div>
            <div className={`flex items-center gap-2 text-2xl font-bold ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              <span>{isPositive ? '+' : ''}{changePercent.toFixed(2)}%</span>
            </div>
          </div>

          {isFund && asset.risk_score && (
            <div>
              <div className="text-sm text-gray-500 mb-1">{t('riskScore')}</div>
              <div className="text-3xl font-bold text-gray-900">
                {asset.risk_score.toFixed(1)}/10
              </div>
            </div>
          )}

          {!isFund && 'market_cap' in asset && asset.market_cap && (
            <div>
              <div className="text-sm text-gray-500 mb-1">{t('marketCap')}</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(asset.market_cap, asset.currency)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-2 border-b border-gray-200">
          {['overview', 'charts', 'details'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t(tab)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* AI Analysis Panel */}
          {'asset_type' in asset && (
            <AIAnalysisPanel symbol={asset.symbol} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Stats */}
          {isFund && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-600" />
                {t('performance')}
              </h2>
              <div className="space-y-3">
                {[
                  { label: '1 Ay', value: asset.performance_1m },
                  { label: '3 Ay', value: asset.performance_3m },
                  { label: '6 Ay', value: asset.performance_6m },
                  { label: '1 Yıl', value: asset.performance_1y },
                  { label: 'YTD', value: asset.performance_ytd },
                ].map((perf) => (
                  <div key={perf.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{perf.label}</span>
                    <span className={`font-semibold ${
                      (perf.value || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {perf.value !== undefined ? 
                        `${perf.value >= 0 ? '+' : ''}${perf.value.toFixed(2)}%` : '--'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fund Details */}
          {isFund && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-600" />
                Fon Bilgileri
              </h2>
              <div className="space-y-3">
                {asset.aum && (
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{t('aum')}</span>
                    <span className="font-semibold text-gray-900">
                      {(asset.aum / 1000000).toFixed(2)}M TL
                    </span>
                  </div>
                )}
                {asset.expense_ratio && (
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{t('expenseRatio')}</span>
                    <span className="font-semibold text-gray-900">
                      %{asset.expense_ratio.toFixed(2)}
                    </span>
                  </div>
                )}
                {asset.risk_score && (
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{t('riskScore')}</span>
                    <span className="font-semibold text-gray-900">
                      {asset.risk_score.toFixed(1)}/10
                    </span>
                  </div>
                )}
                {asset.manager && (
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Yönetici</span>
                    <span className="font-semibold text-gray-900">
                      {asset.manager}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Asset Details */}
          {!isFund && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Varlık Bilgileri
              </h2>
              <div className="space-y-3">
                {'volume' in asset && asset.volume && (
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{t('volume')}</span>
                    <span className="font-semibold text-gray-900">
                      {asset.volume.toLocaleString('tr-TR')}
                    </span>
                  </div>
                )}
                {'exchange' in asset && asset.exchange && (
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Borsa</span>
                    <span className="font-semibold text-gray-900">
                      {asset.exchange}
                    </span>
                  </div>
                )}
                {'asset_type' in asset && (
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Tür</span>
                    <span className="font-semibold text-gray-900">
                      {t(asset.asset_type)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Para Birimi</span>
                  <span className="font-semibold text-gray-900">
                    {asset.currency}
                  </span>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      )}

      {activeTab === 'charts' && (
        <div className="space-y-6">
          {ohlcvData.length > 0 ? (
            <AdvancedCandlestickChart 
              symbol={asset?.symbol || symbol || ''}
              data={ohlcvData}
              showMA={true}
              showVolume={true}
              showBollingerBands={false}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <LineChart className="w-6 h-6 text-blue-600" />
                Fiyat Grafiği
              </h2>
              <div className="text-center py-12 text-gray-500">
                Bu varlık için grafik verisi yükleniyor...
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'details' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Detaylı Bilgiler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Sembol</div>
              <div className="font-semibold text-gray-900">{asset.symbol}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Ad</div>
              <div className="font-semibold text-gray-900">{asset.name}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Para Birimi</div>
              <div className="font-semibold text-gray-900">{asset.currency}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Son Güncelleme</div>
              <div className="font-semibold text-gray-900">
                {asset.last_updated ? 
                  new Date(asset.last_updated).toLocaleString('tr-TR') : '--'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
