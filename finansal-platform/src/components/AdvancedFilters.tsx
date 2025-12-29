import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

export interface FilterCriteria {
  searchQuery: string;
  assetTypes: string[];
  priceRange: { min: number; max: number };
  performanceRange: { min: number; max: number };
  riskLevels: string[];
  marketCapRange: { min: number; max: number };
  sectors: string[];
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterCriteria) => void;
  initialFilters?: Partial<FilterCriteria>;
}

export function AdvancedFilters({ onFilterChange, initialFilters }: AdvancedFiltersProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [filters, setFilters] = useState<FilterCriteria>({
    searchQuery: initialFilters?.searchQuery || '',
    assetTypes: initialFilters?.assetTypes || [],
    priceRange: initialFilters?.priceRange || { min: 0, max: 1000000 },
    performanceRange: initialFilters?.performanceRange || { min: -100, max: 100 },
    riskLevels: initialFilters?.riskLevels || [],
    marketCapRange: initialFilters?.marketCapRange || { min: 0, max: 10000000000 },
    sectors: initialFilters?.sectors || [],
  });

  const assetTypes = ['bist', 'crypto', 'currency', 'metal', 'tefas', 'macro'];
  const riskLevels = ['low', 'medium', 'high'];
  const sectors = [
    'technology',
    'finance',
    'energy',
    'healthcare',
    'retail',
    'manufacturing',
    'telecom',
    'real_estate',
  ];

  const handleFilterChange = (key: keyof FilterCriteria, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleArrayFilter = (key: 'assetTypes' | 'riskLevels' | 'sectors', value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    handleFilterChange(key, newArray);
  };

  const clearFilters = () => {
    const clearedFilters: FilterCriteria = {
      searchQuery: '',
      assetTypes: [],
      priceRange: { min: 0, max: 1000000 },
      performanceRange: { min: -100, max: 100 },
      riskLevels: [],
      marketCapRange: { min: 0, max: 10000000000 },
      sectors: [],
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = 
    filters.searchQuery !== '' ||
    filters.assetTypes.length > 0 ||
    filters.riskLevels.length > 0 ||
    filters.sectors.length > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">{t('filters') || 'Filtreler'}</h3>
            {hasActiveFilters && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {t('active') || 'Aktif'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                {t('clear') || 'Temizle'}
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Quick Search - Always Visible */}
        <div className="mt-3">
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            placeholder={t('searchAssets') || 'Varlık ara (hisse, fon, kripto...)'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            {t('searchHint') || 'Harf yazarak filtreleme yapabilirsiniz (örn: T, BI, ETH)'}
          </p>
        </div>
      </div>

      {/* Advanced Filters - Collapsible */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Asset Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('assetType') || 'Varlık Türü'}
            </label>
            <div className="flex flex-wrap gap-2">
              {assetTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleArrayFilter('assetTypes', type)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filters.assetTypes.includes(type)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t(type)}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('priceRange') || 'Fiyat Aralığı'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('min') || 'Min'}</label>
                <input
                  type="number"
                  value={filters.priceRange.min}
                  onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, min: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('max') || 'Max'}</label>
                <input
                  type="number"
                  value={filters.priceRange.max}
                  onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, max: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1000000"
                />
              </div>
            </div>
          </div>

          {/* Performance Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('performanceRange') || 'Performans Aralığı (%)'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('min') || 'Min'}</label>
                <input
                  type="number"
                  value={filters.performanceRange.min}
                  onChange={(e) => handleFilterChange('performanceRange', { ...filters.performanceRange, min: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="-100"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('max') || 'Max'}</label>
                <input
                  type="number"
                  value={filters.performanceRange.max}
                  onChange={(e) => handleFilterChange('performanceRange', { ...filters.performanceRange, max: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>
            </div>
          </div>

          {/* Risk Levels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('riskLevel') || 'Risk Seviyesi'}
            </label>
            <div className="flex flex-wrap gap-2">
              {riskLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => toggleArrayFilter('riskLevels', level)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filters.riskLevels.includes(level)
                      ? level === 'low'
                        ? 'bg-green-600 text-white'
                        : level === 'medium'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t(level) || level}
                </button>
              ))}
            </div>
          </div>

          {/* Market Cap Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('marketCapRange') || 'Piyasa Değeri Aralığı'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('min') || 'Min'}</label>
                <input
                  type="number"
                  value={filters.marketCapRange.min}
                  onChange={(e) => handleFilterChange('marketCapRange', { ...filters.marketCapRange, min: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('max') || 'Max'}</label>
                <input
                  type="number"
                  value={filters.marketCapRange.max}
                  onChange={(e) => handleFilterChange('marketCapRange', { ...filters.marketCapRange, max: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10000000000"
                />
              </div>
            </div>
          </div>

          {/* Sectors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('sectors') || 'Sektörler'}
            </label>
            <div className="flex flex-wrap gap-2">
              {sectors.map((sector) => (
                <button
                  key={sector}
                  onClick={() => toggleArrayFilter('sectors', sector)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filters.sectors.includes(sector)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t(sector) || sector}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
