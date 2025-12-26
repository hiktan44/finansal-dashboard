// Supabase Edge Function: ai-analysis
// Gerçek geçmiş verilerle AI analizi yapar ve sonuçları döner

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { symbol } = await req.json()

    if (!symbol) {
      throw new Error('Symbol parametresi gerekli')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    // Geçmiş verileri çek
    const response = await fetch(
      `${supabaseUrl}/rest/v1/historical_data?symbol=eq.${symbol}&order=data_date.asc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    )

    if (!response.ok) {
      throw new Error('Geçmiş veriler çekilemedi')
    }

    const historicalData = await response.json()

    if (historicalData.length < 30) {
      throw new Error('Yeterli geçmiş veri yok (minimum 30 gün)')
    }

    console.log(`${symbol} için ${historicalData.length} kayıt bulundu`)

    // AI analizi yap
    const prices = historicalData.map(d => d.price)
    const analysis = performAIAnalysis(prices, symbol)

    // Tahminleri kaydet
    const predictions = generatePredictions(prices, symbol)
    await savePredictions(predictions, supabaseUrl, supabaseKey)

    // AI insights kaydet
    const insights = generateInsights(analysis, symbol)
    await saveInsights(insights, supabaseUrl, supabaseKey)

    // Market signals kaydet
    const signals = generateSignals(analysis, symbol)
    await saveSignals(signals, supabaseUrl, supabaseKey)

    return new Response(
      JSON.stringify({
        success: true,
        symbol: symbol,
        analysis: analysis,
        predictions: predictions.slice(0, 10),
        insights: insights,
        signals: signals
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Yardımcı fonksiyonlar
function performAIAnalysis(prices, symbol) {
  const n = prices.length
  
  // Trend analizi
  const sumX = (n * (n - 1)) / 2
  const sumY = prices.reduce((a, b) => a + b, 0)
  const sumXY = prices.reduce((sum, price, i) => sum + i * price, 0)
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const avgPrice = sumY / n
  
  let direction = 'yatay'
  let trendStrength = Math.min(Math.abs(slope / avgPrice) * 1000, 10)
  
  if (slope > avgPrice * 0.001) direction = 'yukarı'
  else if (slope < -avgPrice * 0.001) direction = 'aşağı'
  
  // Volatilite
  const returns = prices.slice(1).map((p, i) => (p - prices[i]) / prices[i])
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
  const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100
  
  // RSI
  const rsi = calculateRSI(prices, 14)
  
  // Risk level
  let riskLevel = 'düşük'
  if (volatility > 40) riskLevel = 'yüksek'
  else if (volatility > 20) riskLevel = 'orta'
  
  return {
    trend: {
      direction,
      strength: trendStrength,
      confidence: direction === 'yatay' ? 60 : 80
    },
    risk: {
      volatility,
      riskLevel
    },
    indicators: {
      rsi: rsi[rsi.length - 1]
    },
    currentPrice: prices[prices.length - 1]
  }
}

function calculateRSI(prices, period) {
  const changes = prices.slice(1).map((p, i) => p - prices[i])
  const rsiValues = []
  
  for (let i = period - 1; i < changes.length; i++) {
    const slice = changes.slice(i - period + 1, i + 1)
    const gains = slice.filter(c => c > 0)
    const losses = slice.filter(c => c < 0).map(Math.abs)
    
    const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / period : 0
    const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / period : 0
    
    if (avgLoss === 0) {
      rsiValues.push(100)
    } else {
      const rs = avgGain / avgLoss
      rsiValues.push(100 - (100 / (1 + rs)))
    }
  }
  
  return rsiValues
}

function generatePredictions(prices, symbol) {
  const n = prices.length
  const sumX = (n * (n - 1)) / 2
  const sumY = prices.reduce((a, b) => a + b, 0)
  const sumXY = prices.reduce((sum, price, i) => sum + i * price, 0)
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  
  const predictions = []
  const today = new Date()
  
  for (let i = 1; i <= 10; i++) {
    const predictedPrice = slope * (n + i) + intercept
    const futureDate = new Date(today)
    futureDate.setDate(today.getDate() + i)
    
    predictions.push({
      symbol,
      prediction_type: 'linear_regression',
      predicted_price: Math.max(predictedPrice, 0),
      confidence_level: Math.max(70 - i * 3, 40),
      prediction_date: today.toISOString().split('T')[0],
      target_date: futureDate.toISOString().split('T')[0],
      algorithm: 'linear_regression'
    })
  }
  
  return predictions
}

function generateInsights(analysis, symbol) {
  const insights = []
  const today = new Date().toISOString().split('T')[0]
  
  if (analysis.trend.confidence > 75) {
    insights.push({
      insight_type: 'trend',
      title: `${symbol} için ${analysis.trend.direction === 'yukarı' ? 'Yükseliş' : 'Düşüş'} Trendi`,
      content: `Güçlü ${analysis.trend.direction} trendi tespit edildi. Güven: %${analysis.trend.confidence}`,
      severity: analysis.trend.strength > 7 ? 'high' : 'medium',
      related_symbols: symbol,
      confidence: analysis.trend.confidence,
      insight_date: today
    })
  }
  
  if (analysis.risk.riskLevel === 'yüksek') {
    insights.push({
      insight_type: 'risk',
      title: 'Yüksek Volatilite Uyarısı',
      content: `Volatilite: %${analysis.risk.volatility.toFixed(1)}. Dikkatli olunmalı.`,
      severity: 'high',
      related_symbols: symbol,
      confidence: 85,
      insight_date: today
    })
  }
  
  if (analysis.indicators.rsi < 30) {
    insights.push({
      insight_type: 'opportunity',
      title: 'Aşırı Satım Fırsatı',
      content: `RSI: ${analysis.indicators.rsi.toFixed(1)}. Potansiyel alım fırsatı.`,
      severity: 'medium',
      related_symbols: symbol,
      confidence: 75,
      insight_date: today
    })
  }
  
  return insights
}

function generateSignals(analysis, symbol) {
  const signals = []
  const today = new Date().toISOString().split('T')[0]
  
  signals.push({
    symbol,
    signal_type: 'trend',
    signal_value: analysis.trend.direction === 'yukarı' ? 'buy' : analysis.trend.direction === 'aşağı' ? 'sell' : 'hold',
    strength: analysis.trend.strength,
    description: `${analysis.trend.direction} trendi`,
    signal_date: today
  })
  
  signals.push({
    symbol,
    signal_type: 'volatility',
    signal_value: analysis.risk.volatility > 40 ? 'hold' : 'buy',
    strength: Math.min(analysis.risk.volatility / 10, 10),
    description: `Volatilite: %${analysis.risk.volatility.toFixed(1)}`,
    signal_date: today
  })
  
  return signals
}

async function savePredictions(predictions, supabaseUrl, supabaseKey) {
  const response = await fetch(`${supabaseUrl}/rest/v1/predictions`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(predictions)
  })
  
  if (!response.ok) {
    console.error('Tahminler kaydedilemedi')
  }
}

async function saveInsights(insights, supabaseUrl, supabaseKey) {
  const response = await fetch(`${supabaseUrl}/rest/v1/ai_insights`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(insights)
  })
  
  if (!response.ok) {
    console.error('Insights kaydedilemedi')
  }
}

async function saveSignals(signals, supabaseUrl, supabaseKey) {
  const response = await fetch(`${supabaseUrl}/rest/v1/market_signals`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(signals)
  })
  
  if (!response.ok) {
    console.error('Sinyaller kaydedilemedi')
  }
}
