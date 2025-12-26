import { useTranslation } from 'react-i18next';
import { Asset, Fund } from '@/lib/supabase';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface AssetCardProps {
  asset: Asset | Fund | null;
  onClick?: () => void;
}

export function AssetCard({ asset, onClick }: AssetCardProps) {
  const { t } = useTranslation();
  
  // If no asset, return placeholder
  if (!asset) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  const isFund = 'nav' in asset;
  const isPositive = (asset.change_percent || 0) >= 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const changeBgColor = isPositive ? 'bg-green-50' : 'bg-red-50';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatVolume = (volume?: number) => {
    if (!volume) return '-';
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(2)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(2)}K`;
    }
    return volume.toString();
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{asset.symbol}</h3>
          <p className="text-sm text-gray-500">{asset.name}</p>
        </div>
        <span className="px-2 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-600">
          {isFund ? 'TEFAS' : ('exchange' in asset ? (asset as Asset).exchange : (asset as Asset).asset_type?.toUpperCase())}
        </span>
      </div>

      {/* Price */}
      <div className="mb-3">
        <div className="text-2xl font-bold text-gray-900">
          {formatPrice(isFund ? (asset as Fund).nav : (asset as Asset).price)} 
          {isFund ? ' TRY' : (asset as Asset).currency}
        </div>
        {isFund && (
          <div className="text-xs text-gray-500 mt-1">Fon Net Aktif Değeri</div>
        )}
      </div>

      {/* Change */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-md ${changeBgColor}`}>
          {isPositive ? (
            <TrendingUp className={`w-4 h-4 ${changeColor}`} />
          ) : (
            <TrendingDown className={`w-4 h-4 ${changeColor}`} />
          )}
          <span className={`text-sm font-medium ${changeColor}`}>
            {isPositive ? '+' : ''}{(asset.change_percent || 0).toFixed(2)}%
          </span>
        </div>

        {!isFund && (asset as Asset).volume && (
          <div className="text-sm text-gray-500">
            {t('volume')}: {formatVolume((asset as Asset).volume)}
          </div>
        )}
        {isFund && (asset as Fund).aum && (
          <div className="text-sm text-gray-500">
            AUM: {formatVolume((asset as Fund).aum)}
          </div>
        )}
      </div>
    </div>
  );
}
