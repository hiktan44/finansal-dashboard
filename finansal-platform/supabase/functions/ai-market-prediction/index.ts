Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { symbol, days = 10 } = await req.json();

    if (!symbol) {
      throw new Error('Symbol is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Yahoo Finance'den geçmiş veri çek (90 gün)
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=90d`;
    const yahooResponse = await fetch(yahooUrl);
    
    if (!yahooResponse.ok) {
      throw new Error(`Yahoo Finance API error: ${yahooResponse.statusText}`);
    }

    const yahooData = await yahooResponse.json();
    const quotes = yahooData?.chart?.result?.[0];
    
    if (!quotes) {
      throw new Error('No data available');
    }

    const indicators = quotes.indicators.quote[0];
    const timestamps = quotes.timestamp;
    const closes = indicators.close.filter((c: number | null) => c !== null);
    const highs = indicators.high.filter((h: number | null) => h !== null);
    const lows = indicators.low.filter((l: number | null) => l !== null);

    if (closes.length < 10) {
      throw new Error('Insufficient data for prediction');
    }

    const currentPrice = closes[closes.length - 1];

    // 1. Lineer Regresyon ile trend
    const n = closes.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = closes;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // 2. Moving Averages (MA10, MA20, MA50)
    const ma10 = closes.slice(-10).reduce((a, b) => a + b, 0) / 10;
    const ma20 = closes.slice(-Math.min(20, closes.length)).reduce((a, b) => a + b, 0) / Math.min(20, closes.length);
    const ma50 = closes.slice(-Math.min(50, closes.length)).reduce((a, b) => a + b, 0) / Math.min(50, closes.length);

    // 3. Volatilite hesapla
    const returns = [];
    for (let i = 1; i < closes.length; i++) {
      returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
    }
    const stdDev = Math.sqrt(returns.reduce((a, b) => a + Math.pow(b - 0, 2), 0) / returns.length);
    const volatility = stdDev * Math.sqrt(252) * 100;

    // 4. Tahminler oluştur
    const predictions = [];
    const predictionMethod = slope > 0 ? 'LINEAR_REGRESSION_UPTREND' : 'LINEAR_REGRESSION_DOWNTREND';
    
    for (let i = 1; i <= days; i++) {
      const trendPrice = slope * (n + i) + intercept;
      
      // Volatilite bazlı güven aralığı
      const upperBound = trendPrice * (1 + volatility / 100 * 0.5);
      const lowerBound = trendPrice * (1 - volatility / 100 * 0.5);
      
      // MA etkisi ile düzeltme
      const maWeight = 0.3;
      const adjustedPrice = trendPrice * (1 - maWeight) + ma10 * maWeight;

      predictions.push({
        day: i,
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        predicted_price: Math.max(0, adjustedPrice),
        upper_bound: Math.max(0, upperBound),
        lower_bound: Math.max(0, lowerBound),
        confidence: Math.max(0, 100 - volatility * 2) // Düşük volatilite = yüksek güven
      });
    }

    // Trend gücü
    const trendStrength = Math.abs(slope) / currentPrice * 100 * days;
    const trendDirection = slope > 0 ? 'UPTREND' : slope < 0 ? 'DOWNTREND' : 'SIDEWAYS';

    // Veritabanına kaydet
    const predictionData = {
      symbol,
      prediction_date: new Date().toISOString(),
      current_price: currentPrice,
      prediction_days: days,
      predicted_price: predictions[predictions.length - 1].predicted_price,
      trend_direction: trendDirection,
      trend_strength: trendStrength,
      confidence_score: predictions[0].confidence,
      method: predictionMethod,
      ma10,
      ma20,
      ma50,
      volatility_percent: volatility,
      predictions_json: predictions,
      metadata: {
        slope,
        intercept,
        data_points: n
      }
    };

    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/market_predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(predictionData)
    });

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      console.error('Database insert error:', errorText);
    }

    return new Response(JSON.stringify({
      data: {
        symbol,
        current_price: currentPrice,
        predictions,
        trend: {
          direction: trendDirection,
          strength: trendStrength
        },
        moving_averages: { ma10, ma20, ma50 },
        volatility: volatility,
        analysis_quality: predictions[0].confidence
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Market prediction error:', error);
    
    return new Response(JSON.stringify({
      error: {
        code: 'PREDICTION_FAILED',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
