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
    const { symbol } = await req.json();

    if (!symbol) {
      throw new Error('Symbol is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Yahoo Finance API'den veri çek
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=30d`;
    const yahooResponse = await fetch(yahooUrl);
    
    if (!yahooResponse.ok) {
      throw new Error(`Yahoo Finance API error: ${yahooResponse.statusText}`);
    }

    const yahooData = await yahooResponse.json();
    const quotes = yahooData?.chart?.result?.[0];
    
    if (!quotes) {
      throw new Error('No data available from Yahoo Finance');
    }

    const indicators = quotes.indicators.quote[0];
    const closes = indicators.close.filter((c: number | null) => c !== null);
    const volumes = indicators.volume.filter((v: number | null) => v !== null);
    
    // Sentiment Analizi
    const priceChange = closes.length >= 2 
      ? ((closes[closes.length - 1] - closes[closes.length - 2]) / closes[closes.length - 2]) * 100 
      : 0;
    
    // Volume trend analizi
    const avgVolume = volumes.reduce((a: number, b: number) => a + b, 0) / volumes.length;
    const recentVolume = volumes.slice(-5).reduce((a: number, b: number) => a + b, 0) / 5;
    const volumeRatio = recentVolume / avgVolume;

    // Volatilite hesapla
    const returns = [];
    for (let i = 1; i < closes.length; i++) {
      returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
    }
    const volatility = Math.sqrt(returns.reduce((a, b) => a + Math.pow(b, 2), 0) / returns.length) * Math.sqrt(252) * 100;

    // RSI hesaplama (14 gün)
    let gains = 0;
    let losses = 0;
    const period = Math.min(14, returns.length);
    
    for (let i = returns.length - period; i < returns.length; i++) {
      if (returns[i] > 0) gains += returns[i];
      else losses += Math.abs(returns[i]);
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    // Sentiment skorlama
    let sentimentScore = 50; // Neutral başlangıç
    
    // Fiyat değişimi etkisi
    if (priceChange > 5) sentimentScore += 20;
    else if (priceChange > 2) sentimentScore += 10;
    else if (priceChange < -5) sentimentScore -= 20;
    else if (priceChange < -2) sentimentScore -= 10;

    // RSI etkisi
    if (rsi > 70) sentimentScore -= 10; // Aşırı alım
    else if (rsi < 30) sentimentScore += 10; // Aşırı satım

    // Volume etkisi
    if (volumeRatio > 1.5) sentimentScore += 10;
    else if (volumeRatio < 0.5) sentimentScore -= 5;

    // Volatilite etkisi (yüksek volatilite = belirsizlik)
    if (volatility > 50) sentimentScore -= 10;
    else if (volatility < 20) sentimentScore += 5;

    // Skoru 0-100 aralığına sınırla
    sentimentScore = Math.max(0, Math.min(100, sentimentScore));

    // Sentiment kategorisi
    let sentimentCategory = 'NEUTRAL';
    let sentimentLabel = 'Notr';
    
    if (sentimentScore >= 70) {
      sentimentCategory = 'VERY_BULLISH';
      sentimentLabel = 'Cok Alis';
    } else if (sentimentScore >= 60) {
      sentimentCategory = 'BULLISH';
      sentimentLabel = 'Alis';
    } else if (sentimentScore >= 40) {
      sentimentCategory = 'NEUTRAL';
      sentimentLabel = 'Notr';
    } else if (sentimentScore >= 30) {
      sentimentCategory = 'BEARISH';
      sentimentLabel = 'Satis';
    } else {
      sentimentCategory = 'VERY_BEARISH';
      sentimentLabel = 'Cok Satis';
    }

    // Fear & Greed Index benzeri
    const fearGreedIndex = Math.round(sentimentScore);

    // Veritabanına kaydet
    const sentimentData = {
      symbol,
      sentiment_score: sentimentScore,
      sentiment_category: sentimentCategory,
      sentiment_label: sentimentLabel,
      fear_greed_index: fearGreedIndex,
      rsi_value: rsi,
      volatility_percent: volatility,
      volume_ratio: volumeRatio,
      price_change_percent: priceChange,
      analysis_date: new Date().toISOString(),
      metadata: {
        data_points: closes.length,
        avg_volume: avgVolume,
        recent_volume: recentVolume
      }
    };

    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/sentiment_analysis`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(sentimentData)
    });

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      console.error('Database insert error:', errorText);
      // Hata olsa bile analiz sonucunu döndür
    }

    return new Response(JSON.stringify({
      data: {
        sentiment: sentimentData,
        recommendation: sentimentCategory,
        confidence: Math.abs(sentimentScore - 50) * 2 // 0-100 confidence
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Sentiment analysis error:', error);
    
    return new Response(JSON.stringify({
      error: {
        code: 'SENTIMENT_ANALYSIS_FAILED',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
