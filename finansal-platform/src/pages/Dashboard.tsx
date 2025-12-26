import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetList } from '@/components/AssetList';
import { MarketHeatmap } from '@/components/MarketHeatmap';
import { triggerMarketDataFetch, fetchAssets } from '@/lib/supabase';
import { RefreshCw, TrendingUp, Activity } from 'lucide-react';

export function Dashboard() {
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [heatmapAssets, setHeatmapAssets] = useState<any[]>([]);

  useEffect(() => {
    // İlk yüklemede veri çek
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setIsRefreshing(true);
      // Başlangıçta BIST ve Crypto verilerini çek
      await Promise.all([
        triggerMarketDataFetch('bist', ['THYAO.IS', 'GARAN.IS', 'AKBNK.IS', 'EREGL.IS', 'TCELL.IS']),
        triggerMarketDataFetch('crypto', ['BTC-USD', 'ETH-USD', 'BNB-USD']),
        triggerMarketDataFetch('currency'),
        triggerMarketDataFetch('metal'),
      ]);

      // Heatmap için varlıkları yükle
      const assets = await fetchAssets();
      const mappedAssets = assets.slice(0, 30).map(asset => ({
        symbol: asset.symbol,
        name: asset.name,
        price: asset.price,
        change_percent: asset.change_percent || 0,
        market_cap: asset.market_cap,
        volume: asset.volume,
        sector: asset.asset_type,
      }));
      setHeatmapAssets(mappedAssets);
    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await initializeData();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('dashboard')}</h1>
          <p className="text-gray-500 mt-1">
            Türkiye'nin en kapsamlı finansal takip platformu
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showHeatmap
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span>Isı Haritası</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? t('loading') : t('refresh') || 'Yenile'}</span>
          </button>
        </div>
      </div>

      {/* Market Heatmap */}
      {showHeatmap && heatmapAssets.length > 0 && (
        <div className="mb-8">
          <MarketHeatmap 
            assets={heatmapAssets}
            groupBy="performance"
            title="Piyasa Performans Haritası"
          />
        </div>
      )}

      {/* Asset List */}
      <AssetList />
    </div>
  );
}
