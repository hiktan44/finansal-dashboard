import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ihoxxlnzjdlanqwcdker.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlob3h4bG56amRsYW5xd2Nka2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzU0NzEsImV4cCI6MjA3NzgxMTQ3MX0.8cv6tJU7z1hfv1D16oSEObLRJkSYIl4IEmA136D9Drg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Asset types
export type AssetType = 'bist' | 'tefas' | 'crypto' | 'currency' | 'metal' | 'macro';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  asset_type: AssetType;
  exchange?: string;
  price: number;
  previous_close?: number;
  change_percent?: number;
  volume?: number;
  market_cap?: number;
  currency: string;
  last_updated: string;
  is_active: boolean;
}

export interface Fund {
  id: string;
  symbol: string;
  name: string;
  fund_type: 'equity' | 'bond' | 'mixed' | 'money_market' | 'precious_metal';
  manager?: string;
  inception_date?: string;
  expense_ratio?: number;
  aum?: number;
  nav?: number;
  previous_nav?: number;
  change_percent?: number;
  performance_1m?: number;
  performance_3m?: number;
  performance_6m?: number;
  performance_1y?: number;
  performance_ytd?: number;
  risk_score?: number;
  category?: string;
  currency: string;
  last_updated?: string;
  is_active: boolean;
  created_at?: string;
}

export interface MacroData {
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
  created_at?: string;
}

export interface RiskMetric {
  id: string;
  portfolio_id?: string;
  symbol?: string;
  metric_type: string;
  value: number;
  calculation_date?: string;
  period?: string;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface DiversificationAnalysis {
  id: string;
  portfolio_id: string;
  analysis_date?: string;
  asset_type_distribution?: any;
  sector_distribution?: any;
  country_distribution?: any;
  correlation_matrix?: any;
  concentration_score?: number;
  diversification_score?: number;
  recommendations?: any;
  created_at?: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  total_value: number;
  total_cost: number;
  total_gain_loss: number;
  total_gain_loss_percent: number;
  currency: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortfolioHolding {
  id: string;
  portfolio_id: string;
  asset_id: string;
  symbol: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  current_price: number;
  current_value: number;
  gain_loss: number;
  gain_loss_percent: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Watchlist {
  id: string;
  user_id: string;
  asset_id: string;
  symbol: string;
  notes?: string;
  sort_order: number;
  created_at: string;
}

// Fetch all assets
export async function fetchAssets(assetType?: AssetType) {
  let query = supabase
    .from('assets')
    .select('*')
    .eq('is_active', true)
    .order('symbol', { ascending: true });

  if (assetType) {
    query = query.eq('asset_type', assetType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching assets:', error);
    throw error;
  }

  return data as Asset[];
}

// Fetch single asset
export async function fetchAssetBySymbol(symbol: string) {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('symbol', symbol)
    .maybeSingle();

  if (error) {
    console.error('Error fetching asset:', error);
    throw error;
  }

  return data as Asset | null;
}

// Fetch price history
export async function fetchPriceHistory(symbol: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('price_history')
    .select('*')
    .eq('symbol', symbol)
    .gte('timestamp', startDate.toISOString())
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Error fetching price history:', error);
    throw error;
  }

  return data;
}

// Portfolio functions
export async function fetchUserPortfolios(userId: string) {
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching portfolios:', error);
    throw error;
  }

  return data as Portfolio[];
}

export async function fetchPortfolioHoldings(portfolioId: string) {
  const { data, error } = await supabase
    .from('portfolio_holdings')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching holdings:', error);
    throw error;
  }

  return data as PortfolioHolding[];
}

// Watchlist functions
export async function fetchWatchlist(userId: string) {
  const { data, error } = await supabase
    .from('watchlists')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching watchlist:', error);
    throw error;
  }

  return data as Watchlist[];
}

export async function addToWatchlist(userId: string, assetId: string, symbol: string) {
  const { data, error } = await supabase
    .from('watchlists')
    .insert({
      user_id: userId,
      asset_id: assetId,
      symbol,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error adding to watchlist:', error);
    throw error;
  }

  return data;
}

export async function removeFromWatchlist(id: string) {
  const { error } = await supabase
    .from('watchlists')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error removing from watchlist:', error);
    throw error;
  }
}

// Trigger market data fetch (DISABLED - use manual Edge Function triggers)
export async function triggerMarketDataFetch(assetType: AssetType, symbols?: string[]) {
  // Edge Function 'fetch-market-data' is not available in this Supabase project
  // Data should be fetched manually via Edge Functions:
  // - fetch-bist-full-list
  // - fetch-tcmb-data
  // - fetch-tuik-data
  // - fetch-iab-prices
  console.warn(`triggerMarketDataFetch called for ${assetType} but function is disabled. Use manual Edge Function triggers.`);
  return { success: false, message: 'Function disabled' };
}


// Fetch all funds
export async function fetchFunds(fundType?: string) {
  let query = supabase
    .from('funds')
    .select('*')
    .eq('is_active', true)
    .order('symbol', { ascending: true });

  if (fundType) {
    query = query.eq('fund_type', fundType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching funds:', error);
    throw error;
  }

  return data as Fund[];
}

// Fetch single fund
export async function fetchFundBySymbol(symbol: string) {
  const { data, error } = await supabase
    .from('funds')
    .select('*')
    .eq('symbol', symbol)
    .maybeSingle();

  if (error) {
    console.error('Error fetching fund:', error);
    throw error;
  }

  return data as Fund | null;
}

// Sample macro data for global economic indicators (TÜİK Güncel Veriler - Kasım 2025)
const sampleMacroData: MacroData[] = [
  // TÜRKİYE (Güncel TÜİK Verileri)
  { id: '1', country: 'Türkiye', indicator: 'inflation', value: 32.87, previous_value: 48.58, change_percent: -15.71, unit: '%', date: '2025-10-01', source: 'TÜİK', metadata: { period: 'Ekim 2025', type: 'yillik' } },
  { id: '2', country: 'Türkiye', indicator: 'inflation_monthly', value: 2.55, previous_value: 2.88, change_percent: -0.33, unit: '%', date: '2025-10-01', source: 'TÜİK', metadata: { period: 'Ekim 2025', type: 'aylık' } },
  { id: '3', country: 'Türkiye', indicator: 'unemployment', value: 8.6, previous_value: 8.6, change_percent: 0, unit: '%', date: '2025-09-01', source: 'TÜİK', metadata: { period: 'Eylül 2025' } },
  { id: '4', country: 'Türkiye', indicator: 'gdp_growth', value: 4.8, previous_value: 3.2, change_percent: 1.6, unit: '%', date: '2025-06-01', source: 'TÜİK', metadata: { period: '2. Çeyrek 2025' } },
  { id: '5', country: 'Türkiye', indicator: 'export_value', value: 24000, previous_value: 22575, change_percent: 6.32, unit: 'Milyon $', date: '2025-10-01', source: 'TÜİK', metadata: { period: 'Ekim 2025' } },
  { id: '6', country: 'Türkiye', indicator: 'import_value', value: 31363, previous_value: 29423, change_percent: 6.6, unit: 'Milyon $', date: '2025-10-01', source: 'TÜİK', metadata: { period: 'Ekim 2025' } },
  { id: '7', country: 'Türkiye', indicator: 'producer_price_index', value: 27.00, previous_value: 32.24, change_percent: -5.24, unit: '%', date: '2025-10-01', source: 'TÜİK', metadata: { period: 'Ekim 2025' } },
  { id: '8', country: 'Türkiye', indicator: 'financial_investment_gold', value: 12.61, previous_value: -4.82, change_percent: 17.43, unit: '%', date: '2025-10-01', source: 'TÜİK', metadata: { period: 'Ekim 2025', type: 'reel_getiri' } },
  
  // ABD
  { id: '9', country: 'Amerika Birleşik Devletleri', indicator: 'gdp_growth', value: 2.4, previous_value: 2.1, change_percent: 0.3, unit: '%', date: '2024-12-01', source: 'BEA' },
  { id: '10', country: 'Amerika Birleşik Devletleri', indicator: 'inflation', value: 3.2, previous_value: 3.7, change_percent: -0.5, unit: '%', date: '2024-12-01', source: 'BLS' },
  { id: '11', country: 'Amerika Birleşik Devletleri', indicator: 'unemployment', value: 3.7, previous_value: 3.9, change_percent: -0.2, unit: '%', date: '2024-12-01', source: 'BLS' },
  { id: '12', country: 'Amerika Birleşik Devletleri', indicator: 'interest_rate', value: 4.25, previous_value: 4.50, change_percent: -0.25, unit: '%', date: '2025-11-01', source: 'Fed' },
  
  // Eurozone
  { id: '13', country: 'Avrupa Birliği', indicator: 'gdp_growth', value: 0.8, previous_value: 0.6, change_percent: 0.2, unit: '%', date: '2024-12-01', source: 'Eurostat' },
  { id: '14', country: 'Avrupa Birliği', indicator: 'inflation', value: 2.9, previous_value: 3.2, change_percent: -0.3, unit: '%', date: '2024-12-01', source: 'Eurostat' },
  { id: '15', country: 'Avrupa Birliği', indicator: 'unemployment', value: 6.5, previous_value: 6.6, change_percent: -0.1, unit: '%', date: '2024-12-01', source: 'Eurostat' },
  { id: '16', country: 'Avrupa Birliği', indicator: 'interest_rate', value: 2.75, previous_value: 3.00, change_percent: -0.25, unit: '%', date: '2025-11-01', source: 'ECB' },
  
  // BIST 100 ve TCMB
  { id: '17', country: 'Türkiye', indicator: 'bist_100', value: 10924.53, previous_value: 10821.64, change_percent: 0.95, unit: 'Puan', date: '2025-11-07', source: 'BIST' },
  { id: '18', country: 'Türkiye', indicator: 'usd_try', value: 42.21, previous_value: 42.12, change_percent: 0.21, unit: 'TL', date: '2025-11-08', source: 'TCMB' },
  { id: '19', country: 'Türkiye', indicator: 'eur_try', value: 48.90, previous_value: 45.87, change_percent: 6.61, unit: 'TL', date: '2025-11-08', source: 'TCMB' },
  { id: '20', country: 'Türkiye', indicator: 'tcmb_interest_rate', value: 39.5, previous_value: 40.5, change_percent: -1.0, unit: '%', date: '2025-10-01', source: 'TCMB' },
];

// Fetch macro data
export async function fetchMacroData(country?: string, indicator?: string) {
  try {
    let query = supabase
      .from('macro_data')
      .select('*')
      .order('date', { ascending: false });

    if (country) {
      query = query.eq('country', country);
    }

    if (indicator) {
      query = query.eq('indicator', indicator);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Error fetching macro data from Supabase, using sample data:', error);
      return filterSampleData(country, indicator);
    }

    if (!data || data.length === 0) {
      console.log('No macro data found in Supabase, using sample data');
      return filterSampleData(country, indicator);
    }

    return data as MacroData[];
  } catch (error) {
    console.warn('Error fetching macro data, using sample data:', error);
    return filterSampleData(country, indicator);
  }
}

// Helper function to filter sample data
function filterSampleData(country?: string, indicator?: string): MacroData[] {
  let filtered = sampleMacroData;
  
  if (country) {
    filtered = filtered.filter(d => d.country.toLowerCase().includes(country.toLowerCase()));
  }
  
  if (indicator) {
    filtered = filtered.filter(d => d.indicator === indicator);
  }
  
  return filtered;
}

// Add holding to portfolio
export async function addHoldingToPortfolio(
  portfolioId: string,
  assetId: string,
  symbol: string,
  quantity: number,
  purchasePrice: number,
  purchaseDate: string,
  notes?: string
) {
  const { data, error } = await supabase
    .from('portfolio_holdings')
    .insert({
      portfolio_id: portfolioId,
      asset_id: assetId,
      symbol,
      quantity,
      purchase_price: purchasePrice,
      purchase_date: purchaseDate,
      current_price: purchasePrice,
      current_value: quantity * purchasePrice,
      gain_loss: 0,
      gain_loss_percent: 0,
      notes,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error adding holding:', error);
    throw error;
  }

  return data;
}

// Remove holding from portfolio
export async function removeHoldingFromPortfolio(holdingId: string) {
  const { error } = await supabase
    .from('portfolio_holdings')
    .delete()
    .eq('id', holdingId);

  if (error) {
    console.error('Error removing holding:', error);
    throw error;
  }
}

// Fetch risk metrics
export async function fetchRiskMetrics(portfolioId: string) {
  const { data, error } = await supabase
    .from('risk_metrics')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('calculation_date', { ascending: false });

  if (error) {
    console.error('Error fetching risk metrics:', error);
    throw error;
  }

  return data as RiskMetric[];
}

// Fetch diversification analysis
export async function fetchDiversificationAnalysis(portfolioId: string) {
  const { data, error } = await supabase
    .from('diversification_analysis')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('analysis_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching diversification analysis:', error);
    throw error;
  }

  return data as DiversificationAnalysis | null;
}

// Trigger portfolio analytics calculation
export async function calculatePortfolioAnalytics(portfolioId: string) {
  const { data, error } = await supabase.functions.invoke('calculate-portfolio-analytics', {
    body: { portfolioId }
  });

  if (error) {
    console.error('Error calculating portfolio analytics:', error);
    throw error;
  }

  return data;
}

// Trigger TEFAS funds fetch
export async function fetchTEFASFunds() {
  const { data, error } = await supabase.functions.invoke('fetch-tefas-funds', {
    body: {}
  });

  if (error) {
    console.error('Error fetching TEFAS funds:', error);
    throw error;
  }

  return data;
}

// Trigger macro data fetch (TCMB + TÜİK)
export async function fetchMacroDataUpdate() {
  try {
    // Fetch TCMB data (döviz kurları)
    const tcmbResult = await supabase.functions.invoke('fetch-tcmb-data', {
      body: {}
    });
    
    if (tcmbResult.error) {
      console.error('Error fetching TCMB data:', tcmbResult.error);
    }

    // Fetch TÜİK data (makro göstergeler)
    const tuikResult = await supabase.functions.invoke('fetch-tuik-data', {
      body: {}
    });
    
    if (tuikResult.error) {
      console.error('Error fetching TÜİK data:', tuikResult.error);
    }

    return {
      tcmb: tcmbResult.data,
      tuik: tuikResult.data
    };
  } catch (error) {
    console.error('Error in fetchMacroDataUpdate:', error);
    throw error;
  }
}

// Trigger BIST stocks fetch
export async function fetchBISTStocks() {
  const { data, error } = await supabase.functions.invoke('fetch-bist-full-list', {
    body: {}
  });

  if (error) {
    console.error('Error fetching BIST stocks:', error);
    throw error;
  }

  return data;
}

// Trigger IAB commodities fetch
export async function fetchIABCommodities() {
  const { data, error } = await supabase.functions.invoke('fetch-iab-prices', {
    body: {}
  });

  if (error) {
    console.error('Error fetching IAB commodities:', error);
    throw error;
  }

  return data;

  return data;
}
