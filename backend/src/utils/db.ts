import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ KRİTİK HATA: SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY environment variable\'ları eksik!');
  console.error('Lütfen Coolify veya Docker Dashboard üzerinden bu değişkenleri tanımlayın.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

// Database helper functions
export const db = {
  supabase, // Expose supabase client directly
  // Assets tablosu
  async upsertAsset(data: any) {
    const { error } = await supabase
      .from('assets')
      .upsert(data, { onConflict: 'symbol' });
    if (error) throw error;
  },

  async getAssets(symbol?: string) {
    let query = supabase.from('assets').select('*');
    if (symbol) query = query.eq('symbol', symbol);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Price history
  async addPriceHistory(data: any) {
    const { error } = await supabase
      .from('price_history')
      .insert(data);
    if (error) throw error;
  },

  // Macro data
  async upsertMacroData(data: any) {
    const { error } = await supabase
      .from('macro_data')
      .upsert(data, { onConflict: 'country,indicator,date' });
    if (error) throw error;
  },

  async getMacroData(indicator?: string, startDate?: string, endDate?: string) {
    let query = supabase.from('macro_data').select('*');
    if (indicator) query = query.eq('indicator', indicator);
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);
    query = query.order('date', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async upsertTurkeyEconomics(data: any) {
    const { error } = await supabase
      .from('turkey_economics')
      .upsert(data, { onConflict: 'indicator_code' });
    if (error) throw error;
  },

  async upsertEconomicData(data: any | any[]) {
    const { error } = await supabase
      .from('economic_data')
      .upsert(data, { onConflict: 'indicator_code,period_date' });
    if (error) throw error;
  },

  // Market data
  async upsertMarketData(table: string, data: any) {
    const { error } = await supabase
      .from(table)
      .upsert(data, { onConflict: 'symbol,data_date' });
    if (error) throw error;
  },

  async upsertMarketSummary(data: any) {
    const { error } = await supabase
      .from('market_summary')
      .upsert(data, { onConflict: 'data_date' });
    if (error) throw error;
  },

  async upsertHistoricalData(data: any[]) {
    const { error } = await supabase
      .from('historical_data')
      .upsert(data, { onConflict: 'symbol,data_date' });
    if (error) throw error;
  },

  async getMarketData(table: string, symbol?: string) {
    let query = supabase.from(table).select('*');
    if (symbol) query = query.eq('symbol', symbol);
    query = query.order('data_date', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Portfolio
  async getPortfolioHoldings(userId: string) {
    const { data, error } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  },

  // Alerts
  async createAlert(alert: any) {
    const { data, error } = await supabase
      .from('user_alerts')
      .insert(alert)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getAlerts(userId: string) {
    const { data, error } = await supabase
      .from('user_alerts')
      .select('*')
      .eq('user_id', userId)
      .is('triggered_at', null);
    if (error) throw error;
    return data;
  }
};
