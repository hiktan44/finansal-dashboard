// AI Analiz ve Tahmin Türleri

export interface PriceData {
  date: string
  price: number
  volume?: number
}

export interface TrendAnalysis {
  direction: 'yukarı' | 'aşağı' | 'yatay'
  strength: number // 1-10
  confidence: number // 0-100
  description: string
}

export interface TechnicalIndicator {
  name: string
  value: number
  signal: 'al' | 'sat' | 'bekle'
  description: string
}

export interface PricePrediction {
  date: string
  predictedPrice: number
  confidenceInterval: {
    lower: number
    upper: number
  }
  confidence: number
}

export interface RiskMetrics {
  volatility: number // günlük volatilite
  sharpeRatio: number
  beta: number
  maxDrawdown: number
  valueAtRisk: number
  riskLevel: 'düşük' | 'orta' | 'yüksek'
}

export interface MarketSignal {
  type: 'trend' | 'volume' | 'volatility' | 'momentum'
  signal: 'al' | 'sat' | 'bekle'
  strength: number // 1-10
  description: string
}

export interface AIInsight {
  title: string
  content: string
  type: 'opportunity' | 'warning' | 'info'
  severity: 'low' | 'medium' | 'high'
  relatedSymbols: string[]
  confidence: number
}

export interface SupportResistance {
  support: number[]
  resistance: number[]
  currentPrice: number
}

export interface CorrelationMatrix {
  [symbol: string]: {
    [otherSymbol: string]: number
  }
}

export interface AnomalyDetection {
  isAnomaly: boolean
  zScore: number
  description: string
  date: string
}
