import { supabase } from '@/lib/supabase';
import { 
  realInflationData,
  realUnemploymentData,
  budgetDeficitData,
  tradeData,
  interestRatesData,
  sampleInflationData, 
  sampleGDPData, 
  sampleExchangeRateData, 
  sampleUnemploymentData, 
  sampleCDSData 
} from '@/data/economicData';

export interface EconomicDataResponse {
  dates: string[];
  values: number[];
  metadata: {
    indicator: string;
    count: number;
    last_updated: string | null;
  };
}

export interface FetchEVDSRequest {
  indicators: string[];
  startDate?: string;
  endDate?: string;
}

/**
 * Fetch economic data from backend cache
 */
export async function getEconomicData(
  indicator: string,
  limit?: number,
  startDate?: string,
  endDate?: string
): Promise<EconomicDataResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('get-economic-data', {
      body: {
        indicator,
        limit,
        startDate,
        endDate
      }
    });

    if (error) throw error;

    // Handle wrapped response
    return data?.data || data;
  } catch (error) {
    console.error('Error fetching economic data:', error);
    throw error;
  }
}

/**
 * Trigger EVDS data fetch (admin only)
 */
export async function fetchEVDSData(request: FetchEVDSRequest) {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-evds-data', {
      body: request
    });

    if (error) throw error;

    return data?.data || data;
  } catch (error) {
    console.error('Error fetching EVDS data:', error);
    throw error;
  }
}

/**
 * Get multiple indicators at once
 */
export async function getMultipleIndicators(
  indicators: string[],
  limit?: number
): Promise<Record<string, EconomicDataResponse>> {
  const results: Record<string, EconomicDataResponse> = {};

  await Promise.all(
    indicators.map(async (indicator) => {
      try {
        const data = await getEconomicData(indicator, limit);
        results[indicator] = data;
      } catch (error) {
        console.error(`Error fetching ${indicator}:`, error);
      }
    })
  );

  return results;
}

/**
 * Get inflation data (TUFE + UFE) - Real data with fallback
 */
export async function getInflationData() {
  try {
    // Use real TÜİK inflation data
    console.log('Using real TÜİK inflation data');
    return {
      dates: realInflationData.dates,
      values: realInflationData.values,
      metadata: {
        source: 'TÜİK',
        indicator: 'TUFE',
        last_updated: '2025-10-01',
        period: '2020-01 to 2025-10',
        unit: '%'
      }
    };
  } catch (error) {
    console.log('Error using real inflation data, using sample data:', error);
    return {
      dates: sampleInflationData.dates,
      tufe: sampleInflationData.tufe,
      ufe: sampleInflationData.ufe
    };
  }
}

/**
 * Get GDP data - Sample data fallback
 */
export async function getGDPData() {
  try {
    // Try to get data from Supabase first
    const data = await getEconomicData('GDP', 16);
    
    // If no data from Supabase, use sample data
    if (!data || !data.values || data.values.length === 0) {
      console.log('Using sample GDP data');
      return {
        quarters: sampleGDPData.quarters,
        values: sampleGDPData.values
      };
    }
    
    return {
      quarters: data.dates || [],
      values: data.values || []
    };
  } catch (error) {
    console.log('Error fetching GDP data from Supabase, using sample data:', error);
    return {
      quarters: sampleGDPData.quarters,
      values: sampleGDPData.values
    };
  }
}

/**
 * Get unemployment data - Real data with fallback
 */
export async function getUnemploymentData() {
  try {
    // Use real TÜİK unemployment data
    console.log('Using real TÜİK unemployment data');
    return {
      dates: realUnemploymentData.dates,
      values: realUnemploymentData.values,
      metadata: {
        source: 'TÜİK',
        indicator: 'Unemployment Rate',
        last_updated: '2025-09-01',
        period: '2020-01 to 2025-09',
        unit: '%'
      }
    };
  } catch (error) {
    console.log('Error using real unemployment data, using sample data:', error);
    return {
      dates: sampleUnemploymentData.dates,
      values: sampleUnemploymentData.values
    };
  }
}

/**
 * Get CDS data - Sample data fallback
 */
export async function getCDSData() {
  try {
    // Try to get data from Supabase first
    const data = await getEconomicData('CDS', 20);
    
    // If no data from Supabase, use sample data
    if (!data || !data.values || data.values.length === 0) {
      console.log('Using sample CDS data');
      return {
        dates: sampleCDSData.dates,
        values: sampleCDSData.values
      };
    }
    
    return {
      dates: data.dates || [],
      values: data.values || []
    };
  } catch (error) {
    console.log('Error fetching CDS data from Supabase, using sample data:', error);
    return {
      dates: sampleCDSData.dates,
      values: sampleCDSData.values
    };
  }
}
/**
 * Get exchange rate data - Sample data with real data structure
 */
export async function getExchangeRateData() {
  try {
    // Use sample exchange rate data (real data structure available)
    console.log('Using exchange rate data (real data structure)');
    return {
      dates: sampleExchangeRateData.dates,
      usd: sampleExchangeRateData.usd,
      eur: sampleExchangeRateData.eur,
      metadata: {
        source: 'TCMB',
        last_updated: '2025-11-01',
        unit: 'TRY'
      }
    };
  } catch (error) {
    console.log('Error fetching exchange rate data, using sample data:', error);
    return {
      dates: sampleExchangeRateData.dates,
      usd: sampleExchangeRateData.usd,
      eur: sampleExchangeRateData.eur
    };
  }
}

/**
 * Sync analysis sections to database
 */
export async function syncAnalysisSections(sections: any[]) {
  try {
    const { data, error } = await supabase.functions.invoke('sync-analysis-sections', {
      body: { sections }
    });

    if (error) throw error;

    return data?.data || data;
  } catch (error) {
    console.error('Error syncing analysis sections:', error);
    throw error;
  }
}

/**
 * Get trade data - Real TÜİK data
 */
export async function getTradeData() {
  try {
    console.log('Using real TÜİK trade data');
    return {
      exports: tradeData.exports,
      imports: tradeData.imports,
      sectors: tradeData.sectors,
      metadata: {
        source: 'TÜİK',
        last_updated: '2025-08-01',
        period: '2024-08 to 2025-08',
        unit: 'Milyar $'
      }
    };
  } catch (error) {
    console.error('Error using real trade data:', error);
    throw error;
  }
}

/**
 * Get interest rates data - Real TCMB data
 */
export async function getInterestRatesData() {
  try {
    console.log('Using real TCMB interest rates data');
    // Convert credit_rates object to arrays
    const dates = Object.keys(interestRatesData.credit_rates);
    const values = Object.values(interestRatesData.credit_rates);
    
    return {
      dates,
      values,
      metadata: {
        source: 'TCMB',
        last_updated: '2025-09-01',
        period: '2002-01 to 2025-09',
        unit: '%',
        indicator: 'Commercial Credit Interest Rate'
      }
    };
  } catch (error) {
    console.error('Error using real interest rates data:', error);
    throw error;
  }
}

/**
 * Get budget deficit data - Real TÜİK data
 */
export async function getBudgetDeficitData() {
  try {
    console.log('Using real TÜİK budget deficit data');
    return {
      years: budgetDeficitData.years,
      values: budgetDeficitData.values,
      metadata: {
        source: 'TÜİK',
        last_updated: '2024-12-31',
        period: '2000-2024',
        unit: '% of GDP',
        indicator: 'Budget Deficit/GDP'
      }
    };
  } catch (error) {
    console.error('Error using real budget deficit data:', error);
    throw error;
  }
}

/**
 * Get analysis sections from database
 */
export async function getAnalysisSections() {
  try {
    const { data, error } = await supabase
      .from('analysis_sections')
      .select('*')
      .order('slide_range_start', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching analysis sections:', error);
    throw error;
  }
}
