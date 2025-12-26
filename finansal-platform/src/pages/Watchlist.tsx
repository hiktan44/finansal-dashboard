import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, TrendingUp, TrendingDown, Loader2, X, Search as SearchIcon } from 'lucide-react';
import { 
  fetchWatchlist, 
  fetchAssets,
  fetchFunds,
  addToWatchlist,
  removeFromWatchlist, 
  Watchlist as WatchlistType,
  Asset,
  Fund,
  supabase
} from '@/lib/supabase';

export function Watchlist() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistType[]>([]);
  const [watchlistAssets, setWatchlistAssets] = useState<(Asset | Fund)[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Modal State
  const [searchQuery, setSearchQuery] = useState('');
  const [assetType, setAssetType] = useState<'all' | 'bist' | 'crypto' | 'currency' | 'metal' | 'tefas'>('all');
  const [availableAssets, setAvailableAssets] = useState<(Asset | Fund)[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<(Asset | Fund)[]>([]);
  const [addingAsset, setAddingAsset] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadWatchlist();
    }
  }, [user]);

  useEffect(() => {
    if (showAddModal) {
      loadAvailableAssets();
    }
  }, [showAddModal, assetType]);

  useEffect(() => {
    filterAssets();
  }, [searchQuery, availableAssets]);

  const loadWatchlist = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await fetchWatchlist(user.id);
      setWatchlist(data);

      // Load asset details
      if (data.length > 0) {
        const assetIds = data.map(w => w.asset_id);
        
        const { data: assets } = await supabase
          .from('assets')
          .select('*')
          .in('id', assetIds);

        const { data: funds } = await supabase
          .from('funds')
          .select('*')
          .in('id', assetIds);

        if (assets || funds) {
          setWatchlistAssets([...(assets || []), ...(funds || [])]);
        }
      } else {
        setWatchlistAssets([]);
      }
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableAssets = async () => {
    try {
      let data: (Asset | Fund)[] = [];
      
      if (assetType === 'tefas') {
        data = await fetchFunds();
      } else if (assetType === 'all') {
        const [assetsData, fundsData] = await Promise.all([
          fetchAssets(),
          fetchFunds()
        ]);
        data = [...assetsData, ...fundsData];
      } else {
        data = await fetchAssets(assetType);
      }
      
      // Filter out already watched assets
      const watchedIds = new Set(watchlist.map(w => w.asset_id));
      const filtered = data.filter(a => !watchedIds.has(a.id));
      
      setAvailableAssets(filtered);
      setFilteredAssets(filtered);
    } catch (error) {
      console.error('Error loading available assets:', error);
    }
  };

  const filterAssets = () => {
    if (searchQuery) {
      const filtered = availableAssets.filter(asset =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAssets(filtered);
    } else {
      setFilteredAssets(availableAssets);
    }
  };

  const handleAddToWatchlist = async (asset: Asset | Fund) => {
    if (!user) return;

    setAddingAsset(asset.id);
    try {
      await addToWatchlist(user.id, asset.id, asset.symbol);
      await loadWatchlist();
      setShowAddModal(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    } finally {
      setAddingAsset(null);
    }
  };

  const handleRemoveFromWatchlist = async (watchlistId: string) => {
    if (!window.confirm(t('confirmRemove'))) return;

    try {
      await removeFromWatchlist(watchlistId);
      await loadWatchlist();
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const formatPrice = (asset: Asset | Fund) => {
    const price = 'price' in asset ? asset.price : ('nav' in asset ? asset.nav : 0);
    const currency = asset.currency || 'TRY';
    
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(price || 0);
  };

  const getChangePercent = (asset: Asset | Fund) => {
    return 'change_percent' in asset ? asset.change_percent : 0;
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('signInRequired')}
          </h2>
          <p className="text-gray-500">
            {t('signInToManageWatchlist')}
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('watchlist')}</h1>
          <p className="text-gray-500 mt-1">
            {t('trackYourFavorites')}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>{t('addToWatchlist')}</span>
        </button>
      </div>

      {/* Watchlist */}
      {watchlist.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('emptyWatchlist')}
          </h2>
          <p className="text-gray-500 mb-6">
            {t('addAssetsToWatchlist')}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>{t('addToWatchlist')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlistAssets.map((asset) => {
            const changePercent = getChangePercent(asset) || 0;
            const isPositive = changePercent >= 0;
            const watchlistItem = watchlist.find(w => w.asset_id === asset.id);

            return (
              <div
                key={asset.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{asset.symbol}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">{asset.name}</p>
                  </div>
                  <button
                    onClick={() => watchlistItem && handleRemoveFromWatchlist(watchlistItem.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-2">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(asset)}
                  </div>
                </div>

                <div className={`flex items-center gap-1 text-sm font-medium ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{isPositive ? '+' : ''}{changePercent.toFixed(2)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add to Watchlist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{t('addToWatchlist')}</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchQuery('');
                }}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Search and Filter */}
              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <div className="flex gap-2 flex-wrap">
                  {['all', 'bist', 'crypto', 'currency', 'metal', 'tefas'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setAssetType(type as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        assetType === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t(type)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assets List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {filteredAssets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => handleAddToWatchlist(asset)}
                    disabled={addingAsset === asset.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">{asset.symbol}</div>
                      <div className="text-sm text-gray-500">{asset.name}</div>
                    </div>
                    {addingAsset === asset.id ? (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    ) : (
                      <Plus className="w-5 h-5 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
