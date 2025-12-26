export interface UserProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface Portfolio {
  id: string
  user_id: string
  name: string
  description: string | null
  initial_capital: number
  currency: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PortfolioHolding {
  id: string
  portfolio_id: string
  symbol: string
  quantity: number
  average_price: number
  purchase_date: string
  notes: string | null
  created_at: string
  updated_at: string
  // Runtime hesaplanan değerler
  current_price?: number
  market_value?: number
  cost_basis?: number
  gain_loss?: number
  gain_loss_percent?: number
  change?: number
  change_percent?: number
}

export interface Transaction {
  id: string
  portfolio_id: string
  holding_id: string | null
  transaction_type: 'buy' | 'sell'
  symbol: string
  quantity: number
  price: number
  commission: number
  total_amount: number
  transaction_date: string
  notes: string | null
  created_at: string
}

export interface Dividend {
  id: string
  portfolio_id: string
  holding_id: string | null
  symbol: string
  amount: number
  payment_date: string
  currency: string
  notes: string | null
  created_at: string
}

export interface PortfolioCalculation {
  total_value: number
  total_cost: number
  total_gain_loss: number
  total_gain_loss_percent: number
  holdings_with_current: PortfolioHolding[]
}

export interface PerformanceMetrics {
  portfolio_value: number
  total_invested: number
  total_sold: number
  net_investment: number
  total_dividends: number
  total_gain_loss: number
  roi: number
  volatility: number
  sharpe_ratio: number
  max_drawdown: number
  number_of_holdings: number
  number_of_transactions: number
  daily_returns: { date: string; return: number }[]
}

export interface AddHoldingFormData {
  symbol: string
  quantity: number
  average_price: number
  purchase_date: string
  notes?: string
}
