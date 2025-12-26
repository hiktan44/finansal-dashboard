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
    const { symbol, sensitivity = 2.5 } = await req.json();

    if (!symbol) {
      throw new Error('Symbol is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Yahoo Finance'den geçmiş veri çek
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
    const volumes = indicators.volume.filter((v: number | null) => v !== null);

    if (closes.length < 20) {
      throw new Error('Insufficient data for anomaly detection');
    }

    const currentPrice = closes[closes.length - 1];
    const currentVolume = volumes[volumes.length - 1];

    // 1. Z-Score Anomali Tespiti (Fiyat)
    const priceReturns = [];
    for (let i = 1; i < closes.length; i++) {
      priceReturns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
    }

    const avgReturn = priceReturns.reduce((a, b) => a + b, 0) / priceReturns.length;
    const stdDev = Math.sqrt(
      priceReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / priceReturns.length
    );

    const latestReturn = priceReturns[priceReturns.length - 1];
    const priceZScore = stdDev > 0 ? (latestReturn - avgReturn) / stdDev : 0;

    // 2. Volume Anomali Tespiti
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const volumeStdDev = Math.sqrt(
      volumes.reduce((sum, v) => sum + Math.pow(v - avgVolume, 2), 0) / volumes.length
    );
    const volumeZScore = volumeStdDev > 0 ? (currentVolume - avgVolume) / volumeStdDev : 0;

    // 3. Volatilite Spike Tespiti
    const recentVolatility = Math.sqrt(
      priceReturns.slice(-10).reduce((sum, r) => sum + Math.pow(r, 2), 0) / 10
    ) * Math.sqrt(252) * 100;

    const historicalVolatility = Math.sqrt(
      priceReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / priceReturns.length
    ) * Math.sqrt(252) * 100;

    const volatilityRatio = historicalVolatility > 0 ? recentVolatility / historicalVolatility : 1;

    // 4. Gap Detection (Büyük fiyat sıçramaları)
    const gaps = [];
    for (let i = 1; i < closes.length; i++) {
      const gapPercent = Math.abs((closes[i] - closes[i - 1]) / closes[i - 1]) * 100;
      if (gapPercent > 5) { // %5'ten büyük gap
        gaps.push({
          date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
          gap_percent: gapPercent,
          direction: closes[i] > closes[i - 1] ? 'UP' : 'DOWN'
        });
      }
    }

    // 5. Anomali Tespit ve Skorlama
    const anomalies = [];
    let anomalyScore = 0;

    // Fiyat anomalisi
    if (Math.abs(priceZScore) > sensitivity) {
      anomalies.push({
        type: 'PRICE_ANOMALY',
        severity: Math.abs(priceZScore) > 3 ? 'HIGH' : 'MEDIUM',
        description: `Olagandisi fiyat hareketi tespit edildi (Z-score: ${priceZScore.toFixed(2)})`,
        z_score: priceZScore
      });
      anomalyScore += Math.abs(priceZScore) * 10;
    }

    // Volume anomalisi
    if (Math.abs(volumeZScore) > sensitivity) {
      anomalies.push({
        type: 'VOLUME_ANOMALY',
        severity: Math.abs(volumeZScore) > 3 ? 'HIGH' : 'MEDIUM',
        description: `Olagandisi hacim tespit edildi (Z-score: ${volumeZScore.toFixed(2)})`,
        z_score: volumeZScore,
        volume_change: ((currentVolume - avgVolume) / avgVolume * 100).toFixed(1) + '%'
      });
      anomalyScore += Math.abs(volumeZScore) * 8;
    }

    // Volatilite spike
    if (volatilityRatio > 1.5) {
      anomalies.push({
        type: 'VOLATILITY_SPIKE',
        severity: volatilityRatio > 2 ? 'HIGH' : 'MEDIUM',
        description: `Volatilite artisi tespit edildi (${(volatilityRatio * 100 - 100).toFixed(1)}% artis)`,
        current_volatility: recentVolatility.toFixed(2) + '%',
        historical_volatility: historicalVolatility.toFixed(2) + '%'
      });
      anomalyScore += (volatilityRatio - 1) * 20;
    }

    // Recent gaps
    const recentGaps = gaps.slice(-3);
    if (recentGaps.length > 0) {
      anomalies.push({
        type: 'PRICE_GAP',
        severity: recentGaps.some(g => g.gap_percent > 10) ? 'HIGH' : 'LOW',
        description: `Son ${recentGaps.length} gunde buyuk fiyat sicramas tespit edildi`,
        gaps: recentGaps
      });
      anomalyScore += recentGaps.length * 5;
    }

    // Anomaly kategorisi
    anomalyScore = Math.min(100, anomalyScore);
    
    let anomalyLevel = 'NORMAL';
    if (anomalyScore > 50) anomalyLevel = 'HIGH';
    else if (anomalyScore > 25) anomalyLevel = 'MEDIUM';
    else if (anomalyScore > 10) anomalyLevel = 'LOW';

    // Öneriler
    const recommendations = [];
    
    if (Math.abs(priceZScore) > 3) {
      recommendations.push('Cok yuksek fiyat anomalisi. Dikkatli olun ve pozisyonunuzu gozden gecirin.');
    }
    if (Math.abs(volumeZScore) > 3) {
      recommendations.push('Anormal hacim artisi. Onemli bir haber veya gelisme olabilir.');
    }
    if (volatilityRatio > 2) {
      recommendations.push('Volatilite spike. Risk yonetimi stratejilerinizi guncelleyin.');
    }
    if (anomalies.length === 0) {
      recommendations.push('Normal piyasa davranisi. Anomali tespit edilmedi.');
    }

    // Veritabanına kaydet
    const anomalyData = {
      symbol,
      detection_date: new Date().toISOString(),
      anomaly_score: anomalyScore,
      anomaly_level: anomalyLevel,
      price_z_score: priceZScore,
      volume_z_score: volumeZScore,
      volatility_ratio: volatilityRatio,
      anomalies_detected: anomalies.length,
      anomalies_json: anomalies,
      recommendations: recommendations,
      metadata: {
        current_price: currentPrice,
        current_volume: currentVolume,
        avg_volume: avgVolume,
        recent_volatility: recentVolatility,
        historical_volatility: historicalVolatility,
        gaps_found: gaps.length
      }
    };

    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/anomaly_detections`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(anomalyData)
    });

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      console.error('Database insert error:', errorText);
    }

    return new Response(JSON.stringify({
      data: {
        symbol,
        anomaly_score: anomalyScore,
        anomaly_level: anomalyLevel,
        anomalies,
        metrics: {
          price_z_score: priceZScore,
          volume_z_score: volumeZScore,
          volatility_ratio: volatilityRatio
        },
        recommendations,
        is_anomalous: anomalies.length > 0
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Anomaly detection error:', error);
    
    return new Response(JSON.stringify({
      error: {
        code: 'ANOMALY_DETECTION_FAILED',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
