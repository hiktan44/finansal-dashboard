import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Search, Plus, Loader2 } from 'lucide-react';
import { fetchAssets, fetchFunds, addHoldingToPortfolio, Asset, Fund } from '@/lib/supabase';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioId: string;
  onSuccess: () => void;
}

export function AddAssetModal({ isOpen, onClose, portfolioId, onSuccess }: AddAssetModalProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [assetType, setAssetType] = useState<'all' | 'bist' | 'crypto' | 'currency' | 'metal' | 'tefas'>('all');
  const [assets, setAssets] = useState<(Asset | Fund)[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<(Asset | Fund)[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | Fund | null>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAssets();
    }
  }, [isOpen, assetType]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = assets.filter(asset => 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAssets(filtered);
    } else {
      setFilteredAssets(assets);
    }
  }, [searchQuery, assets]);

  const loadAssets = async () => {
    setLoading(true);
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
      
      setAssets(data);
      setFilteredAssets(data);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAsset = (asset: Asset | Fund) => {
    setSelectedAsset(asset);
    
    // Set price from asset if available
    if ('price' in asset) {
      setPrice(asset.price.toString());
    } else if ('nav' in asset && asset.nav) {
      setPrice(asset.nav.toString());
    }
  };

  const handleSubmit = async () => {
    if (!selectedAsset || !quantity || !price) {
      return;
    }

    setSubmitting(true);
    try {
      await addHoldingToPortfolio(
        portfolioId,
        selectedAsset.id,
        selectedAsset.symbol,
        parseFloat(quantity),
        parseFloat(price),
        purchaseDate,
        notes
      );

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error adding asset:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedAsset(null);
    setQuantity('');
    setPrice('');
    setNotes('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{t('addAsset')}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedAsset ? (
            <>
              {/* Search and Filter */}
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('search')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

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
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {filteredAssets.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => handleSelectAsset(asset)}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                    >
                      <div>
                        <div className="font-semibold text-gray-900">{asset.symbol}</div>
                        <div className="text-sm text-gray-500">{asset.name}</div>
                      </div>
                      <Plus className="w-5 h-5 text-blue-600" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Selected Asset Details */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="font-semibold text-gray-900 text-lg">{selectedAsset.symbol}</div>
                <div className="text-sm text-gray-600">{selectedAsset.name}</div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('quantity')}
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0.00"
                    step="0.0001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('purchasePrice')}
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('purchaseDate')}
                  </label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('notes')}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!quantity || !price || submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{t('loading')}</span>
                    </>
                  ) : (
                    <span>{t('add')}</span>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
