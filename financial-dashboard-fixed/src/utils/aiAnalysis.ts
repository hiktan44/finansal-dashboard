// AI Analiz ve Tahmin Hesaplama Fonksiyonları

import {
  PriceData,
  TrendAnalysis,
  TechnicalIndicator,
  PricePrediction,
  RiskMetrics,
  MarketSignal,
  AIInsight,
  SupportResistance,
  AnomalyDetection
} from '../types/aiAnalysis'

// ============ TREND ANALİZİ ============

export function calculateMovingAverage(prices: number[], period: number): number[] {
  const result: number[] = []
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      result.push(NaN)
    } else {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
      result.push(sum / period)
    }
  }
  
  return result
}

export function calculateEMA(prices: number[], period: number): number[] {
  const result: number[] = []
  const multiplier = 2 / (period + 1)
  
  // İlk EMA değeri SMA ile başlar
  const sma = prices.slice(0, period).reduce((a, b) => a + b, 0) / period
  result.push(sma)
  
  for (let i = 1; i < prices.length; i++) {
    const ema = (prices[i] - result[i - 1]) * multiplier + result[i - 1]
    result.push(ema)
  }
  
  return result
}

export function analyzeTrend(data: PriceData[]): TrendAnalysis {
  if (data.length < 2) {
    return {
      direction: 'yatay',
      strength: 0,
      confidence: 0,
      description: 'Yetersiz veri'
    }
  }

  const prices = data.map(d => d.price)
  const ma20 = calculateMovingAverage(prices, 20)
  const ma50 = calculateMovingAverage(prices, 50)
  
  const currentPrice = prices[prices.length - 1]
  const ma20Current = ma20[ma20.length - 1]
  const ma50Current = ma50[ma50.length - 1]
  
  // Lineer regresyon için trend hesaplama
  const n = prices.length
  const sumX = (n * (n - 1)) / 2
  const sumY = prices.reduce((a, b) => a + b, 0)
  const sumXY = prices.reduce((sum, price, i) => sum + i * price, 0)
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const avgPrice = sumY / n
  
  // Trend yönü ve gücü
  let direction: 'yukarı' | 'aşağı' | 'yatay'
  let strength = Math.min(Math.abs(slope / avgPrice) * 1000, 10)
  
  if (slope > avgPrice * 0.001) {
    direction = 'yukarı'
  } else if (slope < -avgPrice * 0.001) {
    direction = 'aşağı'
  } else {
    direction = 'yatay'
  }
  
  // Güven seviyesi hesaplama
  let confidence = 50
  if (!isNaN(ma20Current) && !isNaN(ma50Current)) {
    if (direction === 'yukarı' && currentPrice > ma20Current && ma20Current > ma50Current) {
      confidence = 85
    } else if (direction === 'aşağı' && currentPrice < ma20Current && ma20Current < ma50Current) {
      confidence = 85
    } else {
      confidence = 60
    }
  }
  
  const description = `${direction === 'yukarı' ? 'Güçlü yükseliş' : direction === 'aşağı' ? 'Güçlü düşüş' : 'Yatay'} trendi. Güç: ${strength.toFixed(1)}/10`
  
  return { direction, strength, confidence, description }
}

// ============ TEKNİK İNDİKATÖRLER ============

export function calculateRSI(prices: number[], period: number = 14): number[] {
  const result: number[] = []
  const changes = prices.slice(1).map((price, i) => price - prices[i])
  
  for (let i = 0; i < changes.length; i++) {
    if (i < period - 1) {
      result.push(NaN)
    } else {
      const gains = changes.slice(i - period + 1, i + 1).filter(c => c > 0)
      const losses = changes.slice(i - period + 1, i + 1).filter(c => c < 0).map(Math.abs)
      
      const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / period : 0
      const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / period : 0
      
      if (avgLoss === 0) {
        result.push(100)
      } else {
        const rs = avgGain / avgLoss
        const rsi = 100 - (100 / (1 + rs))
        result.push(rsi)
      }
    }
  }
  
  return result
}

export function calculateMACD(prices: number[]): { macd: number[], signal: number[], histogram: number[] } {
  const ema12 = calculateEMA(prices, 12)
  const ema26 = calculateEMA(prices, 26)
  
  const macd = ema12.map((value, i) => value - ema26[i])
  const signal = calculateEMA(macd, 9)
  const histogram = macd.map((value, i) => value - signal[i])
  
  return { macd, signal, histogram }
}

export function calculateBollingerBands(prices: number[], period: number = 20, multiplier: number = 2): {
  upper: number[]
  middle: number[]
  lower: number[]
} {
  const middle = calculateMovingAverage(prices, period)
  const upper: number[] = []
  const lower: number[] = []
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      upper.push(NaN)
      lower.push(NaN)
    } else {
      const slice = prices.slice(i - period + 1, i + 1)
      const mean = middle[i]
      const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period
      const stdDev = Math.sqrt(variance)
      
      upper.push(mean + multiplier * stdDev)
      lower.push(mean - multiplier * stdDev)
    }
  }
  
  return { upper, middle, lower }
}

export function getTechnicalIndicators(data: PriceData[]): TechnicalIndicator[] {
  if (data.length < 20) return []
  
  const prices = data.map(d => d.price)
  const rsi = calculateRSI(prices)
  const macd = calculateMACD(prices)
  const bb = calculateBollingerBands(prices)
  
  const currentRSI = rsi[rsi.length - 1]
  const currentMACD = macd.macd[macd.macd.length - 1]
  const currentSignal = macd.signal[macd.signal.length - 1]
  const currentPrice = prices[prices.length - 1]
  const currentUpper = bb.upper[bb.upper.length - 1]
  const currentLower = bb.lower[bb.lower.length - 1]
  
  const indicators: TechnicalIndicator[] = []
  
  // RSI
  let rsiSignal: 'al' | 'sat' | 'bekle' = 'bekle'
  let rsiDesc = ''
  if (!isNaN(currentRSI)) {
    if (currentRSI < 30) {
      rsiSignal = 'al'
      rsiDesc = 'Aşırı satım bölgesinde, alım fırsatı'
    } else if (currentRSI > 70) {
      rsiSignal = 'sat'
      rsiDesc = 'Aşırı alım bölgesinde, satış sinyali'
    } else {
      rsiDesc = 'Nötr bölgede'
    }
    
    indicators.push({
      name: 'RSI (14)',
      value: currentRSI,
      signal: rsiSignal,
      description: rsiDesc
    })
  }
  
  // MACD
  let macdSignal: 'al' | 'sat' | 'bekle' = 'bekle'
  let macdDesc = ''
  if (!isNaN(currentMACD) && !isNaN(currentSignal)) {
    if (currentMACD > currentSignal) {
      macdSignal = 'al'
      macdDesc = 'MACD sinyal çizgisinin üzerinde, yükseliş'
    } else {
      macdSignal = 'sat'
      macdDesc = 'MACD sinyal çizgisinin altında, düşüş'
    }
    
    indicators.push({
      name: 'MACD',
      value: currentMACD,
      signal: macdSignal,
      description: macdDesc
    })
  }
  
  // Bollinger Bands
  let bbSignal: 'al' | 'sat' | 'bekle' = 'bekle'
  let bbDesc = ''
  if (!isNaN(currentUpper) && !isNaN(currentLower)) {
    if (currentPrice < currentLower) {
      bbSignal = 'al'
      bbDesc = 'Alt bantta, aşırı satım'
    } else if (currentPrice > currentUpper) {
      bbSignal = 'sat'
      bbDesc = 'Üst bantta, aşırı alım'
    } else {
      bbDesc = 'Bantlar arasında'
    }
    
    indicators.push({
      name: 'Bollinger Bands',
      value: (currentPrice - currentLower) / (currentUpper - currentLower) * 100,
      signal: bbSignal,
      description: bbDesc
    })
  }
  
  return indicators
}

// ============ FİYAT TAHMİNİ ============

export function predictPrices(data: PriceData[], days: number = 10): PricePrediction[] {
  if (data.length < 10) return []
  
  const prices = data.map(d => d.price)
  const n = prices.length
  
  // Lineer regresyon parametreleri
  const sumX = (n * (n - 1)) / 2
  const sumY = prices.reduce((a, b) => a + b, 0)
  const sumXY = prices.reduce((sum, price, i) => sum + i * price, 0)
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  
  // Volatilite hesaplama (standart sapma)
  const avgPrice = sumY / n
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / n
  const stdDev = Math.sqrt(variance)
  
  const today = new Date()
  
  // Array.from kullanarak kesin olarak 'days' kadar tahmin üret
  const predictions: PricePrediction[] = Array.from({ length: days }, (_, index) => {
    const i = index + 1 // 1'den başla
    const predictedPrice = slope * (n + i) + intercept
    const futureDate = new Date(today)
    futureDate.setDate(today.getDate() + i)
    
    // Güven aralığı (2 standart sapma)
    const confidenceMultiplier = 1.96 // %95 güven aralığı
    const errorMargin = confidenceMultiplier * stdDev * Math.sqrt(i)
    
    // Güven seviyesi (uzak tahminler daha düşük güven)
    const confidence = Math.max(60 - i * 2, 30)
    
    return {
      date: futureDate.toISOString().split('T')[0],
      predictedPrice: Math.max(predictedPrice, 0),
      confidenceInterval: {
        lower: Math.max(predictedPrice - errorMargin, 0),
        upper: predictedPrice + errorMargin
      },
      confidence
    }
  })
  
  console.log(`predictPrices: Generated ${predictions.length} predictions for ${days} days`)
  return predictions
}

// ============ RİSK METRİKLERİ ============

export function calculateVolatility(prices: number[], period: number = 30): number {
  if (prices.length < period) return 0
  
  const returns = prices.slice(-period).slice(1).map((price, i) => 
    (price - prices[prices.length - period + i]) / prices[prices.length - period + i]
  )
  
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
  
  return Math.sqrt(variance) * Math.sqrt(252) * 100 // Yıllıklandırılmış volatilite
}

export function calculateMaxDrawdown(prices: number[]): number {
  let maxDrawdown = 0
  let peak = prices[0]
  
  for (const price of prices) {
    if (price > peak) {
      peak = price
    }
    const drawdown = (peak - price) / peak * 100
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }
  }
  
  return maxDrawdown
}

export function calculateSharpeRatio(prices: number[], riskFreeRate: number = 0.03): number {
  if (prices.length < 2) return 0
  
  const returns = prices.slice(1).map((price, i) => (price - prices[i]) / prices[i])
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
  const stdDev = Math.sqrt(variance)
  
  const annualizedReturn = avgReturn * 252
  const annualizedStdDev = stdDev * Math.sqrt(252)
  
  return annualizedStdDev !== 0 ? (annualizedReturn - riskFreeRate) / annualizedStdDev : 0
}

export function getRiskMetrics(data: PriceData[]): RiskMetrics {
  const prices = data.map(d => d.price)
  
  const volatility = calculateVolatility(prices)
  const sharpeRatio = calculateSharpeRatio(prices)
  const maxDrawdown = calculateMaxDrawdown(prices)
  
  // VaR hesaplama (%95 güven seviyesi)
  const returns = prices.slice(1).map((price, i) => (price - prices[i]) / prices[i])
  returns.sort((a, b) => a - b)
  const varIndex = Math.floor(returns.length * 0.05)
  const valueAtRisk = Math.abs(returns[varIndex]) * 100
  
  // Beta hesaplama (basitleştirilmiş, piyasa ile 1.0 varsayımı)
  const beta = 1.0
  
  // Risk seviyesi belirleme
  let riskLevel: 'düşük' | 'orta' | 'yüksek'
  if (volatility < 20 && maxDrawdown < 15) {
    riskLevel = 'düşük'
  } else if (volatility < 40 && maxDrawdown < 30) {
    riskLevel = 'orta'
  } else {
    riskLevel = 'yüksek'
  }
  
  return {
    volatility,
    sharpeRatio,
    beta,
    maxDrawdown,
    valueAtRisk,
    riskLevel
  }
}

// ============ DESTEK VE DİRENÇ SEVİYELERİ ============

export function findSupportResistance(data: PriceData[]): SupportResistance {
  const prices = data.map(d => d.price)
  const currentPrice = prices[prices.length - 1]
  
  // Local min/max bulma
  const supports: number[] = []
  const resistances: number[] = []
  
  for (let i = 2; i < prices.length - 2; i++) {
    // Local minimum (destek)
    if (prices[i] < prices[i - 1] && prices[i] < prices[i - 2] &&
        prices[i] < prices[i + 1] && prices[i] < prices[i + 2]) {
      supports.push(prices[i])
    }
    
    // Local maximum (direnç)
    if (prices[i] > prices[i - 1] && prices[i] > prices[i - 2] &&
        prices[i] > prices[i + 1] && prices[i] > prices[i + 2]) {
      resistances.push(prices[i])
    }
  }
  
  // En yakın 3 destek ve direnç seviyesi
  supports.sort((a, b) => Math.abs(currentPrice - a) - Math.abs(currentPrice - b))
  resistances.sort((a, b) => Math.abs(currentPrice - a) - Math.abs(currentPrice - b))
  
  return {
    support: supports.filter(s => s < currentPrice).slice(0, 3),
    resistance: resistances.filter(r => r > currentPrice).slice(0, 3),
    currentPrice
  }
}

// ============ ANOMALİ TESPİTİ ============

export function detectAnomalies(data: PriceData[]): AnomalyDetection[] {
  const prices = data.map(d => d.price)
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length
  const stdDev = Math.sqrt(variance)
  
  const anomalies: AnomalyDetection[] = []
  
  data.forEach((item, i) => {
    const zScore = (item.price - mean) / stdDev
    const isAnomaly = Math.abs(zScore) > 2.5 // 2.5 sigma dışı
    
    if (isAnomaly) {
      anomalies.push({
        isAnomaly: true,
        zScore,
        description: zScore > 0 ? 
          `Olağandışı yüksek fiyat: ${item.price.toFixed(2)}` :
          `Olağandışı düşük fiyat: ${item.price.toFixed(2)}`,
        date: item.date
      })
    }
  })
  
  return anomalies
}

// ============ PİYASA SİNYALLERİ ============

export function generateMarketSignals(data: PriceData[]): MarketSignal[] {
  const signals: MarketSignal[] = []
  
  // Trend sinyali
  const trend = analyzeTrend(data)
  signals.push({
    type: 'trend',
    signal: trend.direction === 'yukarı' ? 'al' : trend.direction === 'aşağı' ? 'sat' : 'bekle',
    strength: trend.strength,
    description: trend.description
  })
  
  // Volatilite sinyali
  const prices = data.map(d => d.price)
  const volatility = calculateVolatility(prices)
  signals.push({
    type: 'volatility',
    signal: volatility > 40 ? 'bekle' : 'al',
    strength: Math.min(volatility / 10, 10),
    description: `Volatilite: %${volatility.toFixed(1)} ${volatility > 40 ? '(Yüksek risk)' : '(Uygun)'}`
  })
  
  // Volume sinyali (varsa)
  if (data[0].volume && data.length > 1) {
    const avgVolume = data.slice(-20).reduce((sum, d) => sum + (d.volume || 0), 0) / 20
    const lastVolume = data[data.length - 1].volume || 0
    const volumeRatio = lastVolume / avgVolume
    
    signals.push({
      type: 'volume',
      signal: volumeRatio > 1.5 ? 'al' : 'bekle',
      strength: Math.min(volumeRatio * 5, 10),
      description: `Hacim ${volumeRatio > 1.5 ? 'ortalamanın üzerinde' : 'normal seviyede'}`
    })
  }
  
  return signals
}

// ============ AI INSIGHTS ÜRETİMİ ============

export function generateAIInsights(data: PriceData[], symbol: string): AIInsight[] {
  const insights: AIInsight[] = []
  const trend = analyzeTrend(data)
  const riskMetrics = getRiskMetrics(data)
  const indicators = getTechnicalIndicators(data)
  const anomalies = detectAnomalies(data)
  
  // Trend insight
  if (trend.confidence > 75) {
    insights.push({
      title: `${symbol} için ${trend.direction === 'yukarı' ? 'Güçlü Yükseliş' : 'Güçlü Düşüş'} Trendi`,
      content: `${trend.description}. Güven seviyesi: %${trend.confidence}`,
      type: trend.direction === 'yukarı' ? 'opportunity' : 'warning',
      severity: trend.strength > 7 ? 'high' : 'medium',
      relatedSymbols: [symbol],
      confidence: trend.confidence
    })
  }
  
  // Risk insight
  if (riskMetrics.riskLevel === 'yüksek') {
    insights.push({
      title: 'Yüksek Risk Uyarısı',
      content: `${symbol} için yüksek volatilite tespit edildi: %${riskMetrics.volatility.toFixed(1)}. Maksimum düşüş: %${riskMetrics.maxDrawdown.toFixed(1)}`,
      type: 'warning',
      severity: 'high',
      relatedSymbols: [symbol],
      confidence: 85
    })
  }
  
  // RSI aşırı satım/alım
  const rsiIndicator = indicators.find(ind => ind.name.includes('RSI'))
  if (rsiIndicator) {
    if (rsiIndicator.value < 30) {
      insights.push({
        title: 'Aşırı Satım Fırsatı',
        content: `${symbol} RSI değeri ${rsiIndicator.value.toFixed(1)}. Potansiyel alım fırsatı.`,
        type: 'opportunity',
        severity: 'medium',
        relatedSymbols: [symbol],
        confidence: 75
      })
    } else if (rsiIndicator.value > 70) {
      insights.push({
        title: 'Aşırı Alım Uyarısı',
        content: `${symbol} RSI değeri ${rsiIndicator.value.toFixed(1)}. Düzeltme olasılığı.`,
        type: 'warning',
        severity: 'medium',
        relatedSymbols: [symbol],
        confidence: 75
      })
    }
  }
  
  // Anomali uyarısı
  if (anomalies.length > 0) {
    const recentAnomalies = anomalies.slice(-3)
    insights.push({
      title: 'Olağandışı Fiyat Hareketi',
      content: `Son dönemde ${recentAnomalies.length} olağandışı fiyat hareketi tespit edildi.`,
      type: 'info',
      severity: 'medium',
      relatedSymbols: [symbol],
      confidence: 80
    })
  }
  
  return insights
}
