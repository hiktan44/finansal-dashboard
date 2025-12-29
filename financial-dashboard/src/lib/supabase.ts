import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "http://supabasekong-ew8s8kw4w00csw4co448gc00.65.108.77.26.sslip.io"
const supabaseAnonKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2Njc2MzA2MCwiZXhwIjo0OTIyNDM2NjYwLCJyb2xlIjoiYW5vbiJ9.VcHE7K5yC_rofM-dZhkCy01Nvj33yGFBMh1ES9iuRZw"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Market data types
export interface MarketIndex {
  id?: number
  symbol: string
  name: string
  close_price: number
  change_value: number
  change_percent: number
  is_new_high?: boolean
  monthly_change?: number
  quarterly_change?: number
  note?: string
  data_date: string
  created_at?: string
}

export interface TechStock {
  id?: number
  symbol: string
  name: string
  close_price: number
  change_percent: number
  day_high: number
  day_low: number
  volume?: number
  note?: string
  data_date: string
  created_at?: string
}

export interface Commodity {
  id?: number
  name: string
  symbol: string
  price: number
  change_percent: number
  monthly_change?: number
  note?: string
  data_date: string
  created_at?: string
}

export interface MarketSummary {
  id?: number
  summary_text: string
  key_points: string[]
  market_sentiment: string
  data_date: string
  created_at?: string
}

// Fetch latest market data from Supabase
export async function fetchLatestMarketData() {
  try {
    // Fetch all data without date filter to get the most recent entries
    const [indicesResponse, stocksResponse, commoditiesResponse, summaryResponse] = await Promise.all([
      supabase
        .from('market_indices')
        .select('*')
        .order('data_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('tech_stocks')
        .select('*')
        .order('data_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('commodities')
        .select('*')
        .order('data_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('market_summary')
        .select('*')
        .order('data_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    ])

    // Check for errors
    if (indicesResponse.error) throw indicesResponse.error
    if (stocksResponse.error) throw stocksResponse.error
    if (commoditiesResponse.error) throw commoditiesResponse.error
    if (summaryResponse.error) throw summaryResponse.error

    // Get the latest date from the data
    const latestDate = indicesResponse.data?.[0]?.data_date || 
                       stocksResponse.data?.[0]?.data_date ||
                       commoditiesResponse.data?.[0]?.data_date

    // Filter data to only include entries from the latest date
    const indicesData = indicesResponse.data?.filter((item: any) => item.data_date === latestDate) || []
    const stocksData = stocksResponse.data?.filter((item: any) => item.data_date === latestDate) || []
    const commoditiesData = commoditiesResponse.data?.filter((item: any) => item.data_date === latestDate) || []

    return {
      indices: indicesData,
      techStocks: stocksData,
      commodities: commoditiesData,
      summary: summaryResponse.data || null
    }
  } catch (error) {
    console.error('Error fetching market data:', error)
    throw error
  }
}

// Trigger manual data sync via edge function
export async function triggerDataSync() {
  try {
    const { data, error } = await supabase.functions.invoke('market-data-sync', {
      body: {}
    })

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error triggering data sync:', error)
    throw error
  }
}

// Cache management for offline support
const CACHE_KEY = 'financial_dashboard_cache'
const CACHE_EXPIRY_MS = 15 * 60 * 1000 // 15 minutes

export function getCachedData() {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const { data, timestamp } = JSON.parse(cached)
    const now = Date.now()

    // Check if cache is expired
    if (now - timestamp > CACHE_EXPIRY_MS) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }

    return data
  } catch (error) {
    console.error('Error reading cache:', error)
    return null
  }
}

export function setCachedData(data: any) {
  try {
    const cacheObject = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject))
  } catch (error) {
    console.error('Error setting cache:', error)
  }
}

// Fetch historical data for AI analysis
export async function fetchHistoricalData(symbol: string) {
  try {
    const { data, error } = await supabase
      .from('historical_data')
      .select('*')
      .eq('symbol', symbol)
      .order('data_date', { ascending: true })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching historical data:', error)
    throw error
  }
}

// Trigger historical data fetch via edge function
export async function triggerHistoricalDataFetch(symbol: string, period: string = '1y') {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-historical-data', {
      body: { symbol, period }
    })

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching historical data from API:', error)
    throw error
  }
}

// Trigger AI analysis via edge function
export async function triggerAIAnalysis(symbol: string) {
  try {
    const { data, error } = await supabase.functions.invoke('ai-analysis', {
      body: { symbol }
    })

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error running AI analysis:', error)
    throw error
  }
}

// Fetch AI predictions from database
export async function fetchAIPredictions(symbol: string) {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('symbol', symbol)
      .order('target_date', { ascending: true })
      .limit(10)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching predictions:', error)
    return []
  }
}

// Fetch AI insights from database
export async function fetchAIInsights(symbol: string) {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('insight_date', today)
      .ilike('related_symbols', `%${symbol}%`)
      .order('confidence', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching AI insights:', error)
    return []
  }
}

// Fetch market signals from database
export async function fetchMarketSignals(symbol: string) {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('market_signals')
      .select('*')
      .eq('symbol', symbol)
      .eq('signal_date', today)
      .order('strength', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching market signals:', error)
    return []
  }
}

// ========== PORTFOLIO FUNCTIONS ==========

// Get user portfolios
export async function getUserPortfolios(userId: string) {
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching portfolios:', error)
    return []
  }
}

// Create portfolio
export async function createPortfolio(portfolioData: {
  user_id: string
  name: string
  description?: string
  initial_capital?: number
  currency?: string
}) {
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .insert(portfolioData)
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating portfolio:', error)
    throw error
  }
}

// Get portfolio holdings
export async function getPortfolioHoldings(portfolioId: string) {
  try {
    const { data, error } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('symbol', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching holdings:', error)
    return []
  }
}

// Add holding to portfolio
export async function addHolding(holdingData: {
  portfolio_id: string
  symbol: string
  quantity: number
  average_price: number
  purchase_date: string
  notes?: string
}) {
  try {
    const { data, error } = await supabase
      .from('portfolio_holdings')
      .insert(holdingData)
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error adding holding:', error)
    throw error
  }
}

// Update holding
export async function updateHolding(holdingId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('portfolio_holdings')
      .update(updates)
      .eq('id', holdingId)
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating holding:', error)
    throw error
  }
}

// Delete holding
export async function deleteHolding(holdingId: string) {
  try {
    const { error } = await supabase
      .from('portfolio_holdings')
      .delete()
      .eq('id', holdingId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting holding:', error)
    throw error
  }
}

// Calculate portfolio value (via edge function)
export async function calculatePortfolio(portfolioId: string) {
  try {
    const { data, error } = await supabase.functions.invoke('portfolio-calculation', {
      body: { portfolio_id: portfolioId }
    })

    if (error) throw error
    return data?.data || null
  } catch (error) {
    console.error('Error calculating portfolio:', error)
    return null
  }
}

// Get performance metrics (via edge function)
export async function getPerformanceMetrics(portfolioId: string, period: string = '1M') {
  try {
    const { data, error } = await supabase.functions.invoke('performance-metrics', {
      body: { portfolio_id: portfolioId, period }
    })

    if (error) throw error
    return data?.data || null
  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    return null
  }
}

// Get transactions
export async function getTransactions(portfolioId: string) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('transaction_date', { ascending: false })
      .limit(50)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return []
  }
}

// Add transaction
export async function addTransaction(transactionData: any) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error adding transaction:', error)
    throw error
  }
}

// Get dividends
export async function getDividends(portfolioId: string) {
  try {
    const { data, error } = await supabase
      .from('dividends')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('payment_date', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching dividends:', error)
    return []
  }
}


// ============================================
// ALARM VE BİLDİRİM SİSTEMİ
// ============================================

import type { 
  UserAlert, 
  AlertTrigger, 
  NotificationLog, 
  AlertPreferences, 
  CreateAlertInput,
  AlertAnalysis,
  NotificationStats
} from '../types/alerts'

// Kullanıcının alarmlarını getir
export async function getUserAlerts(userId: string): Promise<UserAlert[]> {
  try {
    const { data, error } = await supabase
      .from('user_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching user alerts:', error)
    return []
  }
}

// Yeni alarm oluştur
export async function createAlert(userId: string, input: CreateAlertInput): Promise<UserAlert | null> {
  try {
    const { data, error } = await supabase
      .from('user_alerts')
      .insert([{
        user_id: userId,
        ...input,
        is_active: true
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating alert:', error)
    throw error
  }
}

// Alarm güncelle
export async function updateAlert(alertId: string, updates: Partial<UserAlert>): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_alerts')
      .update(updates)
      .eq('id', alertId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating alert:', error)
    throw error
  }
}

// Alarm sil
export async function deleteAlert(alertId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_alerts')
      .delete()
      .eq('id', alertId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting alert:', error)
    throw error
  }
}

// Alarm tetiklemelerini getir
export async function getAlertTriggers(userId: string, limit: number = 50): Promise<AlertTrigger[]> {
  try {
    const { data, error } = await supabase
      .from('alert_triggers')
      .select('*')
      .eq('user_id', userId)
      .order('triggered_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching alert triggers:', error)
    return []
  }
}

// Akıllı alarm analizi
export async function getAlertAnalysis(symbol: string): Promise<AlertAnalysis | null> {
  try {
    const { data, error } = await supabase.functions.invoke('alert-processor', {
      body: { symbol }
    })

    if (error) throw error
    return data?.data || null
  } catch (error) {
    console.error('Error getting alert analysis:', error)
    return null
  }
}

// Bildirim tercihlerini getir
export async function getAlertPreferences(userId: string): Promise<AlertPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('alert_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
    return data
  } catch (error) {
    console.error('Error fetching alert preferences:', error)
    return null
  }
}

// Bildirim tercihlerini güncelle
export async function updateAlertPreferences(
  userId: string, 
  preferences: Partial<AlertPreferences>
): Promise<void> {
  try {
    const existing = await getAlertPreferences(userId)

    if (existing) {
      const { error } = await supabase
        .from('alert_preferences')
        .update({
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('alert_preferences')
        .insert([{
          user_id: userId,
          email_enabled: true,
          push_enabled: true,
          sms_enabled: false,
          ...preferences
        }])

      if (error) throw error
    }
  } catch (error) {
    console.error('Error updating alert preferences:', error)
    throw error
  }
}

// Bildirim loglarını getir
export async function getNotificationLogs(
  userId: string, 
  limit: number = 50
): Promise<NotificationLog[]> {
  try {
    const { data, error } = await supabase
      .from('notification_logs')
      .select('*')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching notification logs:', error)
    return []
  }
}

// Bildirim istatistiklerini getir
export async function getNotificationStats(
  userId?: string,
  days: number = 7
): Promise<NotificationStats | null> {
  try {
    const url = new URL('http://supabasekong-ew8s8kw4w00csw4co448gc00.65.108.77.26.sslip.io/functions/v1/notification-logger')
    if (userId) url.searchParams.set('userId', userId)
    url.searchParams.set('days', days.toString())

    const { data, error } = await supabase.functions.invoke('notification-logger', {
      body: {},
      method: 'GET'
    })

    if (error) throw error
    return data?.data || null
  } catch (error) {
    console.error('Error fetching notification stats:', error)
    return null
  }
}

// Push subscription kaydet
export async function savePushSubscription(
  userId: string,
  subscription: PushSubscriptionJSON
): Promise<void> {
  try {
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert([{
        user_id: userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        is_active: true,
        user_agent: navigator.userAgent
      }])

    if (error) throw error
  } catch (error) {
    console.error('Error saving push subscription:', error)
    throw error
  }
}

// Manuel alarm kontrolü tetikle
export async function triggerAlertCheck(): Promise<void> {
  try {
    await supabase.functions.invoke('check-alerts', {
      body: {}
    })
  } catch (error) {
    console.error('Error triggering alert check:', error)
  }
}

// TEFAS Funds data types
export interface TEFASFund {
  id?: number
  fund_code: string
  fund_name: string
  fund_type: string
  current_price: number
  daily_change: number
  daily_change_percent: number
  weekly_change_percent?: number
  monthly_change_percent?: number
  yearly_change_percent?: number
  total_value?: number
  unit_count?: number
  inception_date?: string
  risk_rating?: string
  management_fee?: number
  last_updated: string
  created_at?: string
}

// Daily Analysis data types
export interface DailyAnalysis {
  id?: number
  analysis_date: string
  market_summary: string
  technical_analysis: string
  sector_highlights: string
  top_movers: {
    gainers: Array<{symbol: string, change: number, reason: string}>
    losers: Array<{symbol: string, change: number, reason: string}>
  }
  market_forecast: string
  sentiment_score: string
  volatility_index: string
  audio_file_path?: string
  is_published: boolean
  created_at?: string
  updated_at?: string
}

// Turkey Economics data types
export interface TurkeyEconomicIndicator {
  id?: number
  indicator_code: string
  indicator_name: string
  indicator_category: string
  current_value: number
  previous_value?: number
  change_percent?: number
  period_date: string
  data_frequency: string
  unit: string
  source: string
  last_updated: string
  created_at?: string
}

// Fetch TEFAS funds data
export async function fetchTEFASFunds(limit = 50): Promise<TEFASFund[]> {
  try {
    const { data, error } = await supabase
      .from('tefas_funds')
      .select('*')
      .order('daily_change_percent', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching TEFAS funds:', error)
    return []
  }
}

// Fetch daily analysis
export async function fetchDailyAnalysis(limit = 5): Promise<DailyAnalysis[]> {
  try {
    const { data, error } = await supabase
      .from('daily_analysis')
      .select('*')
      .order('analysis_date', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching daily analysis:', error)
    return []
  }
}

// Fetch latest daily analysis
export async function fetchLatestDailyAnalysis(): Promise<DailyAnalysis | null> {
  try {
    const { data, error } = await supabase
      .from('daily_analysis')
      .select('*')
      .order('analysis_date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching latest daily analysis:', error)
    return null
  }
}

// Fetch Turkey economic indicators
export async function fetchTurkeyEconomicIndicators(): Promise<TurkeyEconomicIndicator[]> {
  try {
    // First try to fetch from database
    const { data, error } = await supabase
      .from('turkey_economics')
      .select('*')
      .order('indicator_category', { ascending: true })
      .order('indicator_name', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      // Trigger edge function to get fresh data
      await triggerTurkeyEconomicsDataFetch()
    }

    // Check if we have data
    if (!data || data.length === 0) {
      // No data found, trigger edge function
      console.log('No data found, triggering edge function...')
      await triggerTurkeyEconomicsDataFetch()
      
      // Retry after a short delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { data: retryData, error: retryError } = await supabase
        .from('turkey_economics')
        .select('*')
        .order('indicator_category', { ascending: true })
        .order('indicator_name', { ascending: true })

      if (!retryError && retryData && retryData.length > 0) {
        // Get unique indicators by indicator_code to prevent duplicates
        const uniqueRetryIndicators = retryData.filter((indicator, index, self) => 
          index === self.findIndex(i => i.indicator_code === indicator.indicator_code)
        )

        console.log(`Retry: Found ${retryData.length} total indicators, ${uniqueRetryIndicators.length} unique indicators`)
        return uniqueRetryIndicators.map(row => ({
          id: row.id,
          indicator_code: row.indicator_code,
          indicator_name: row.indicator_name || 'Türkiye Ekonomik Gösterge',
          indicator_category: row.indicator_category || 'Genel',
          current_value: row.current_value || 0,
          previous_value: row.previous_value,
          change_percent: row.change_percent,
          period_date: row.period_date || new Date().toISOString().split('T')[0],
          data_frequency: row.data_frequency || 'monthly',
          unit: row.unit || 'Birimi',
          source: row.source || 'TCMB',
          last_updated: row.last_updated || new Date().toISOString(),
          created_at: row.created_at
        }))
      }
    } else {
      // Get unique indicators by indicator_code to prevent duplicates
      const uniqueIndicators = data.filter((indicator, index, self) => 
        index === self.findIndex(i => i.indicator_code === indicator.indicator_code)
      )

      console.log(`Found ${data.length} total indicators, ${uniqueIndicators.length} unique indicators`)
      return uniqueIndicators.map(row => ({
        id: row.id,
        indicator_code: row.indicator_code,
        indicator_name: row.indicator_name || 'Türkiye Ekonomik Gösterge',
        indicator_category: row.indicator_category || 'Genel',
        current_value: row.current_value || 0,
        previous_value: row.previous_value,
        change_percent: row.change_percent,
        period_date: row.period_date || new Date().toISOString().split('T')[0],
        data_frequency: row.data_frequency || 'monthly',
        unit: row.unit || 'Birimi',
        source: row.source || 'TCMB',
        last_updated: row.last_updated || new Date().toISOString(),
        created_at: row.created_at
      }))
    }

    // Return empty array if still no data
    console.warn('No Turkey economic data available after fetch attempt')
    return []
  } catch (error) {
    console.error('Error fetching Turkey economic indicators:', error)
    return []
  }
}

// Trigger daily analysis generation
export async function triggerDailyAnalysisGeneration(): Promise<void> {
  try {
    await supabase.functions.invoke('generate-daily-analysis', {
      body: {}
    })
  } catch (error) {
    console.error('Error triggering daily analysis generation:', error)
  }
}

// Trigger TEFAS data fetch
export async function triggerTEFASDataFetch(): Promise<void> {
  try {
    await supabase.functions.invoke('fetch-tefas-data', {
      body: {}
    })
  } catch (error) {
    console.error('Error triggering TEFAS data fetch:', error)
  }
}

// Trigger Turkey economics data fetch
export async function triggerTurkeyEconomicsDataFetch(): Promise<void> {
  try {
    await supabase.functions.invoke('fetch-turkey-economics', {
      body: {}
    })
    console.log('Turkey economics data fetch triggered successfully')
  } catch (error) {
    console.error('Error triggering Turkey economics data fetch:', error)
  }
}
