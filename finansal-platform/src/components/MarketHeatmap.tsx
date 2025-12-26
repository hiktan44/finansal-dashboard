import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface HeatmapAsset {
  symbol: string;
  name: string;
  price: number;
  change_percent: number;
  market_cap?: number;
  sector?: string;
  volume?: number;
}

interface Props {
  assets: HeatmapAsset[];
  groupBy?: 'sector' | 'market_cap' | 'performance';
  title?: string;
}

export function MarketHeatmap({ assets, groupBy = 'performance', title = 'Piyasa Isı Haritası' }: Props) {
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);
  const [sortedAssets, setSortedAssets] = useState<HeatmapAsset[]>([]);

  useEffect(() => {
    // Sort assets by market cap or change
    const sorted = [...assets].sort((a, b) => {
      if (groupBy === 'market_cap') {
        return (b.market_cap || 0) - (a.market_cap || 0);
      }
      return Math.abs(b.change_percent) - Math.abs(a.change_percent);
    });
    setSortedAssets(sorted);
  }, [assets, groupBy]);

  const getColor = (changePercent: number): string => {
    if (changePercent >= 5) return 'bg-green-700';
    if (changePercent >= 3) return 'bg-green-600';
    if (changePercent >= 1) return 'bg-green-500';
    if (changePercent > 0) return 'bg-green-400';
    if (changePercent > -1) return 'bg-red-400';
    if (changePercent > -3) return 'bg-red-500';
    if (changePercent > -5) return 'bg-red-600';
    return 'bg-red-700';
  };

  const getSize = (asset: HeatmapAsset): string => {
    if (!asset.market_cap) return 'col-span-2 row-span-2';
    
    const maxMarketCap = Math.max(...sortedAssets.map(a => a.market_cap || 0));
    const ratio = (asset.market_cap / maxMarketCap) * 100;

    if (ratio >= 70) return 'col-span-4 row-span-4';
    if (ratio >= 50) return 'col-span-3 row-span-3';
    if (ratio >= 30) return 'col-span-3 row-span-2';
    if (ratio >= 15) return 'col-span-2 row-span-2';
    return 'col-span-2 row-span-1';
  };

  const formatMarketCap = (value: number): string => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(0)}`;
  };

  // Group assets by sector
  const groupedBySector = sortedAssets.reduce((acc, asset) => {
    const sector = asset.sector || 'Diğer';
    if (!acc[sector]) acc[sector] = [];
    acc[sector].push(asset);
    return acc;
  }, {} as Record<string, HeatmapAsset[]>);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{sortedAssets.length} varlık</p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-700"></div>
            <span className="text-xs text-gray-600">&gt;5%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500"></div>
            <span className="text-xs text-gray-600">0-5%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500"></div>
            <span className="text-xs text-gray-600">0-(-5%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-700"></div>
            <span className="text-xs text-gray-600">&lt;-5%</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      {groupBy === 'sector' ? (
        <div className="space-y-6">
          {Object.entries(groupedBySector).map(([sector, sectorAssets]) => (
            <div key={sector}>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">{sector}</h4>
              <div className="grid grid-cols-12 gap-2 auto-rows-fr">
                {sectorAssets.map((asset) => (
                  <div
                    key={asset.symbol}
                    className={`${getColor(asset.change_percent)} ${getSize(asset)} rounded-lg p-3 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg relative overflow-hidden`}
                    onMouseEnter={() => setHoveredAsset(asset.symbol)}
                    onMouseLeave={() => setHoveredAsset(null)}
                  >
                    <div className="text-white">
                      <div className="font-bold text-sm truncate">{asset.symbol}</div>
                      <div className="text-xs opacity-90 truncate">{asset.name}</div>
                      <div className="mt-2 font-semibold text-lg">
                        {asset.change_percent >= 0 ? '+' : ''}{asset.change_percent.toFixed(2)}%
                      </div>
                      {asset.market_cap && (
                        <div className="text-xs opacity-80 mt-1">
                          {formatMarketCap(asset.market_cap)}
                        </div>
                      )}
                    </div>

                    {/* Hover Overlay */}
                    {hoveredAsset === asset.symbol && (
                      <div className="absolute inset-0 bg-black bg-opacity-90 p-3 text-white">
                        <div className="font-bold">{asset.symbol}</div>
                        <div className="text-xs mt-1">{asset.name}</div>
                        <div className="mt-2 space-y-1 text-xs">
                          <div>Fiyat: ${asset.price.toFixed(2)}</div>
                          <div>Değişim: {asset.change_percent >= 0 ? '+' : ''}{asset.change_percent.toFixed(2)}%</div>
                          {asset.market_cap && (
                            <div>Piyasa Değeri: {formatMarketCap(asset.market_cap)}</div>
                          )}
                          {asset.volume && (
                            <div>Hacim: {formatMarketCap(asset.volume)}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-2 auto-rows-fr" style={{ minHeight: '500px' }}>
          {sortedAssets.map((asset) => (
            <div
              key={asset.symbol}
              className={`${getColor(asset.change_percent)} ${getSize(asset)} rounded-lg p-3 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg relative overflow-hidden`}
              onMouseEnter={() => setHoveredAsset(asset.symbol)}
              onMouseLeave={() => setHoveredAsset(null)}
            >
              <div className="text-white h-full flex flex-col justify-between">
                <div>
                  <div className="font-bold text-sm truncate">{asset.symbol}</div>
                  <div className="text-xs opacity-90 truncate">{asset.name}</div>
                </div>
                <div>
                  <div className="font-semibold text-lg">
                    {asset.change_percent >= 0 ? '+' : ''}{asset.change_percent.toFixed(2)}%
                  </div>
                  {asset.market_cap && (
                    <div className="text-xs opacity-80">
                      {formatMarketCap(asset.market_cap)}
                    </div>
                  )}
                </div>
              </div>

              {/* Hover Overlay */}
              {hoveredAsset === asset.symbol && (
                <div className="absolute inset-0 bg-black bg-opacity-90 p-3 text-white flex flex-col justify-center">
                  <div className="font-bold text-base">{asset.symbol}</div>
                  <div className="text-xs mt-1 opacity-90">{asset.name}</div>
                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="opacity-80">Fiyat:</span>
                      <span className="font-medium">${asset.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-80">Değişim:</span>
                      <span className={`font-medium ${asset.change_percent >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {asset.change_percent >= 0 ? '+' : ''}{asset.change_percent.toFixed(2)}%
                      </span>
                    </div>
                    {asset.market_cap && (
                      <div className="flex justify-between">
                        <span className="opacity-80">Piyasa Değeri:</span>
                        <span className="font-medium">{formatMarketCap(asset.market_cap)}</span>
                      </div>
                    )}
                    {asset.volume && (
                      <div className="flex justify-between">
                        <span className="opacity-80">Hacim:</span>
                        <span className="font-medium">{formatMarketCap(asset.volume)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary Statistics */}
      <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {sortedAssets.filter(a => a.change_percent > 0).length}
          </div>
          <div className="text-sm text-gray-600">Yükselişte</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {sortedAssets.filter(a => a.change_percent < 0).length}
          </div>
          <div className="text-sm text-gray-600">Düşüşte</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {Math.max(...sortedAssets.map(a => a.change_percent)).toFixed(2)}%
          </div>
          <div className="text-sm text-gray-600">En Yüksek</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {Math.min(...sortedAssets.map(a => a.change_percent)).toFixed(2)}%
          </div>
          <div className="text-sm text-gray-600">En Düşük</div>
        </div>
      </div>
    </div>
  );
}
