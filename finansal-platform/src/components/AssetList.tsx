import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Asset, AssetType, fetchAssets, fetchFunds, Fund } from '@/lib/supabase';
import { AssetCard } from './AssetCard';
import { AdvancedFilters, FilterCriteria } from './AdvancedFilters';

export function AssetList() {
  const { t } = useTranslation();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [allAssets, setAllAssets] = useState<(Asset | Fund)[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<(Asset | Fund)[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterCriteria>({
    searchQuery: '',
    assetTypes: [],
    priceRange: { min: 0, max: 1000000 },
    performanceRange: { min: -100, max: 100 },
    riskLevels: [],
    marketCapRange: { min: 0, max: 10000000000 },
    sectors: [],
  });

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    filterAssets();
  }, [allAssets, filters]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const [assetsData, fundsData] = await Promise.all([
        fetchAssets(),
        fetchFunds()
      ]);
      setAssets(assetsData);
      setFunds(fundsData);
      setAllAssets([...assetsData, ...fundsData]);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAssets = () => {
    let filtered = allAssets;

    // Filter by search query (CRITICAL FEATURE - letter-based filtering)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (asset) =>
          asset.symbol.toLowerCase().includes(query) ||
          asset.name.toLowerCase().includes(query)
      );
    }

    // Filter by asset types
    if (filters.assetTypes.length > 0) {
      filtered = filtered.filter((asset) => {
        if ('asset_type' in asset) {
          return filters.assetTypes.includes(asset.asset_type);
        } else {
          return filters.assetTypes.includes('tefas');
        }
      });
    }

    // Filter by price range
    filtered = filtered.filter((asset) => {
      const price = 'price' in asset ? asset.price : ('nav' in asset ? asset.nav : 0);
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    // Filter by performance range
    filtered = filtered.filter((asset) => {
      const changePercent = asset.change_percent || 0;
      return changePercent >= filters.performanceRange.min && 
             changePercent <= filters.performanceRange.max;
    });

    // Filter by market cap (for assets that have it)
    filtered = filtered.filter((asset) => {
      const marketCap = 'market_cap' in asset ? (asset.market_cap || 0) : 0;
      return marketCap >= filters.marketCapRange.min && 
             marketCap <= filters.marketCapRange.max;
    });

    setFilteredAssets(filtered);
  };

  const handleFilterChange = (newFilters: FilterCriteria) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Advanced Filters */}
      <AdvancedFilters onFilterChange={handleFilterChange} initialFilters={filters} />

      {/* Results Count */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-gray-600">
          {t('showing') || 'Gösterilen'}: <span className="font-semibold">{filteredAssets.length}</span> / {allAssets.length} {t('assets') || 'varlık'}
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAssets.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            {t('noData')}
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))
        )}
      </div>
    </div>
  );
}
