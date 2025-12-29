import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Loader2, Globe } from 'lucide-react';
import { fetchMacroDataUpdate } from '@/lib/supabase';
import { getInflationData, getUnemploymentData, getTradeData, getInterestRatesData, getBudgetDeficitData } from '@/services/economicDataService';

// Define our local MacroData interface for consistent data structure
interface LocalMacroData {
  id: string;
  country: string;
  indicator: string;
  value: number;
  previous_value?: number;
  change_percent?: number;
  unit?: string;
  date: string;
  source: string;
  metadata?: any;
}

export function MacroEconomic() {
  const { t } = useTranslation();
  const [macroData, setMacroData] = useState<LocalMacroData[]>([]);
  const [groupedData, setGroupedData] = useState<Record<string, LocalMacroData[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<string>('all');

  useEffect(() => {
    loadMacroData();
  }, []);

  useEffect(() => {
    console.log('MacroEconomic: useEffect - macroData değişti, length:', macroData.length);
    if (macroData.length > 0) {
      groupDataByCountry();
    }
  }, [macroData, selectedIndicator]);

  const loadMacroData = async () => {
    setLoading(true);
    try {
      console.log('MacroEconomic: Veri yükleme başlatılıyor...');
      
      // Fetch data from economicDataService
      const [inflationData, unemploymentData, tradeData, interestRatesData, budgetDeficitData] = await Promise.all([
        getInflationData().catch(err => {
          console.error('Inflation data error:', err);
          return null;
        }),
        getUnemploymentData().catch(err => {
          console.error('Unemployment data error:', err);
          return null;
        }),
        getTradeData().catch(err => {
          console.error('Trade data error:', err);
          return null;
        }),
        getInterestRatesData().catch(err => {
          console.error('Interest rates data error:', err);
          return null;
        }),
        getBudgetDeficitData().catch(err => {
          console.error('Budget deficit data error:', err);
          return null;
        })
      ]);

      // Transform data into LocalMacroData format
      const transformedData: LocalMacroData[] = [];
      
      // Add inflation data
      if (inflationData && inflationData.values && inflationData.values.length > 0) {
        const latestInflation = inflationData.values[inflationData.values.length - 1];
        const previousInflation = inflationData.values[inflationData.values.length - 2] || latestInflation;
        transformedData.push({
          id: 'turkey-inflation-1',
          country: 'Türkiye',
          indicator: 'inflation',
          value: latestInflation,
          previous_value: previousInflation,
          change_percent: previousInflation ? ((latestInflation - previousInflation) / previousInflation * 100) : 0,
          unit: '%',
          date: '2025-10-01',
          source: 'TÜİK',
          metadata: inflationData.metadata
        });
        console.log('MacroEconomic: Enflasyon verisi eklendi:', latestInflation);
      }
      
      // Add unemployment data
      if (unemploymentData && unemploymentData.values) {
        const latestUnemployment = unemploymentData.values[unemploymentData.values.length - 1];
        const previousUnemployment = unemploymentData.values[unemploymentData.values.length - 2];
        transformedData.push({
          id: 'turkey-unemployment-1',
          country: 'Türkiye',
          indicator: 'unemployment',
          value: latestUnemployment,
          previous_value: previousUnemployment,
          change_percent: previousUnemployment ? ((latestUnemployment - previousUnemployment) / previousUnemployment * 100) : 0,
          unit: '%',
          date: '2025-09-01',
          source: 'TÜİK',
          metadata: unemploymentData.metadata
        });
      }
      
      // Add interest rates data
      if (interestRatesData && interestRatesData.values) {
        const latestRate = interestRatesData.values[interestRatesData.values.length - 1];
        const previousRate = interestRatesData.values[interestRatesData.values.length - 2];
        transformedData.push({
          id: 'turkey-interest-rate-1',
          country: 'Türkiye',
          indicator: 'interest_rate',
          value: latestRate,
          previous_value: previousRate,
          change_percent: previousRate ? ((latestRate - previousRate) / previousRate * 100) : 0,
          unit: '%',
          date: '2025-09-01',
          source: 'TCMB',
          metadata: interestRatesData.metadata
        });
      }
      
      // Add budget deficit data
      if (budgetDeficitData && budgetDeficitData.values) {
        const latestDeficit = budgetDeficitData.values[budgetDeficitData.values.length - 1];
        const previousDeficit = budgetDeficitData.values[budgetDeficitData.values.length - 2];
        transformedData.push({
          id: 'turkey-budget-deficit-1',
          country: 'Türkiye',
          indicator: 'budget_deficit',
          value: latestDeficit || 0,
          previous_value: previousDeficit,
          change_percent: previousDeficit ? ((latestDeficit - previousDeficit) / Math.abs(previousDeficit) * 100) : 0,
          unit: '%',
          date: '2024-12-31',
          source: 'TÜİK',
          metadata: budgetDeficitData.metadata
        });
      }

      console.log('MacroEconomic: Dönüştürülen veri sayısı:', transformedData.length);
      console.log('MacroEconomic: Dönüştürülen veriler:', transformedData);
      setMacroData(transformedData);
      console.log('MacroEconomic: macroData state güncellendi, length:', transformedData.length);
      
    } catch (error) {
      console.error('Error loading macro data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchMacroDataUpdate();
      await loadMacroData();
    } catch (error) {
      console.error('Error refreshing macro data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const groupDataByCountry = () => {
    console.log('MacroEconomic: groupDataByCountry başlatılıyor');
    console.log('MacroEconomic: macroData:', macroData);
    console.log('MacroEconomic: selectedIndicator:', selectedIndicator);
    
    const filtered = selectedIndicator === 'all' 
      ? macroData 
      : macroData.filter(d => d.indicator === selectedIndicator);

    console.log('MacroEconomic: filtered data:', filtered);

    const grouped = filtered.reduce((acc, item) => {
      if (!acc[item.country]) {
        acc[item.country] = [];
      }
      acc[item.country].push(item);
      return acc;
    }, {} as Record<string, LocalMacroData[]>);

    console.log('MacroEconomic: grouped data:', grouped);
    console.log('MacroEconomic: ülke sayısı:', Object.keys(grouped).length);

    setGroupedData(grouped);
  };

  const indicators = [
    { value: 'all', label: t('all') },
    { value: 'interest_rate', label: t('interestRate') },
    { value: 'inflation', label: t('inflation') },
    { value: 'unemployment', label: t('unemployment') },
    { value: 'budget_deficit', label: 'Bütçe Açığı' },
    { value: 'gdp_growth', label: t('gdpGrowth') },
  ];

  const getIndicatorName = (indicator: string) => {
    switch (indicator) {
      case 'interest_rate': return t('interestRate');
      case 'inflation': return t('inflation');
      case 'unemployment': return t('unemployment');
      case 'budget_deficit': return 'Bütçe Açığı';
      case 'gdp_growth': return t('gdpGrowth');
      default: return indicator;
    }
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
          <h1 className="text-3xl font-bold text-gray-900">{t('macroData')}</h1>
          <p className="text-gray-500 mt-1">
            Küresel Ekonomik Göstergeler ({Object.keys(groupedData).length} ülke)
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

      {/* Filters */}
      <div className="mb-6">
        <div className="flex gap-2 flex-wrap">
          {indicators.map((indicator) => (
            <button
              key={indicator.value}
              onClick={() => setSelectedIndicator(indicator.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedIndicator === indicator.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {indicator.label}
            </button>
          ))}
        </div>
      </div>

      {/* Countries Grid */}
      {Object.keys(groupedData).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('noData')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groupedData).map(([country, data]) => (
            <div
              key={country}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
            >
              {/* Country Header */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Globe className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{country}</h3>
                  <p className="text-sm text-gray-500">{data.length} gösterge</p>
                </div>
              </div>

              {/* Indicators */}
              <div className="space-y-3">
                {data.map((item) => {
                  const isPositive = (item.change_percent || 0) >= 0;
                  const isGoodChange = item.indicator === 'gdp_growth' ? isPositive : 
                                     item.indicator === 'unemployment' ? !isPositive :
                                     item.indicator === 'inflation' ? !isPositive : isPositive;

                  return (
                    <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {getIndicatorName(item.indicator)}
                        </span>
                        {item.change_percent !== undefined && (
                          <span className={`flex items-center gap-1 text-xs font-medium ${
                            isGoodChange ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {isPositive ? '+' : ''}{(item.change_percent || 0).toFixed(2)}%
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {(item.value || 0).toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 mb-0.5">
                          {item.unit}
                        </span>
                      </div>

                      {item.previous_value !== undefined && (
                        <div className="text-xs text-gray-500 mt-1">
                          Önceki: {(item.previous_value || 0).toFixed(2)}{item.unit}
                        </div>
                      )}

                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(item.date).toLocaleDateString('tr-TR')} • {item.source}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
