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
    const { symbol, portfolioId } = await req.json();

    if (!symbol) {
      throw new Error('Symbol is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Yahoo Finance'den geçmiş veri çek
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1y`;
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
    const closes = indicators.close.filter((c: number | null) => c !== null);

    if (closes.length < 30) {
      throw new Error('Insufficient data for risk assessment');
    }

    const currentPrice = closes[closes.length - 1];

    // 1. Volatilite (Standart Sapma - Annualized)
    const returns = [];
    for (let i = 1; i < closes.length; i++) {
      returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
    }
    
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100; // Annualized

    // 2. Sharpe Ratio (Risk-free rate varsayılan %5)
    const riskFreeRate = 0.05;
    const annualizedReturn = avgReturn * 252;
    const sharpeRatio = volatility > 0 ? (annualizedReturn - riskFreeRate) / (volatility / 100) : 0;

    // 3. Maximum Drawdown
    let peak = closes[0];
    let maxDrawdown = 0;
    
    for (const price of closes) {
      if (price > peak) {
        peak = price;
      }
      const drawdown = (peak - price) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    maxDrawdown = maxDrawdown * 100;

    // 4. Value at Risk (VaR) - %95 güven aralığı
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const varIndex = Math.floor(returns.length * 0.05);
    const var95 = Math.abs(sortedReturns[varIndex]) * currentPrice;

    // 5. Beta (Piyasa korelasyonu - BIST100 benzeri simülasyon)
    // Basitleştirilmiş beta hesabı (gerçek uygulamada piyasa indeksi gerekli)
    const beta = volatility / 30; // Ortalama piyasa volatilitesi %30 varsayımı

    // 6. Risk Skorlama
    let riskScore = 50; // Orta risk başlangıç

    // Volatilite etkisi
    if (volatility > 50) riskScore += 20;
    else if (volatility > 30) riskScore += 10;
    else if (volatility < 15) riskScore -= 10;

    // Sharpe ratio etkisi
    if (sharpeRatio < 0) riskScore += 15;
    else if (sharpeRatio < 1) riskScore += 5;
    else if (sharpeRatio > 2) riskScore -= 10;

    // Max drawdown etkisi
    if (maxDrawdown > 30) riskScore += 15;
    else if (maxDrawdown > 20) riskScore += 10;
    else if (maxDrawdown < 10) riskScore -= 5;

    // Skoru 0-100 aralığına sınırla
    riskScore = Math.max(0, Math.min(100, riskScore));

    // Risk kategorisi
    let riskCategory = 'MEDIUM';
    let riskLabel = 'Orta Risk';
    
    if (riskScore >= 70) {
      riskCategory = 'VERY_HIGH';
      riskLabel = 'Cok Yuksek Risk';
    } else if (riskScore >= 55) {
      riskCategory = 'HIGH';
      riskLabel = 'Yuksek Risk';
    } else if (riskScore >= 35) {
      riskCategory = 'MEDIUM';
      riskLabel = 'Orta Risk';
    } else if (riskScore >= 20) {
      riskCategory = 'LOW';
      riskLabel = 'Dusuk Risk';
    } else {
      riskCategory = 'VERY_LOW';
      riskLabel = 'Cok Dusuk Risk';
    }

    // Risk önerileri
    const recommendations = [];
    
    if (volatility > 40) {
      recommendations.push('Yuksek volatilite tespit edildi. Pozisyon boyutunu azaltmayi dusunun.');
    }
    if (sharpeRatio < 0) {
      recommendations.push('Negatif Sharpe orani. Risksiz getiri oraninin altinda performans.');
    }
    if (maxDrawdown > 25) {
      recommendations.push('Buyuk degerden dusus riski. Stop-loss seviyelerini gozden gecirin.');
    }
    if (riskScore > 60) {
      recommendations.push('Genel risk seviyesi yuksek. Portfoy diversifikasyonu onerilir.');
    }
    if (beta > 1.5) {
      recommendations.push('Piyasaya gore yuksek volatilite. Dikkatli olun.');
    }

    // Veritabanına kaydet
    const riskData = {
      symbol,
      portfolio_id: portfolioId || null,
      assessment_date: new Date().toISOString(),
      risk_score: riskScore,
      risk_category: riskCategory,
      risk_label: riskLabel,
      volatility_percent: volatility,
      sharpe_ratio: sharpeRatio,
      max_drawdown_percent: maxDrawdown,
      value_at_risk: var95,
      beta: beta,
      confidence_level: 95,
      recommendations: recommendations,
      metadata: {
        data_points: closes.length,
        annualized_return: annualizedReturn * 100,
        risk_free_rate: riskFreeRate * 100
      }
    };

    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/risk_assessments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(riskData)
    });

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      console.error('Database insert error:', errorText);
    }

    return new Response(JSON.stringify({
      data: {
        symbol,
        risk_assessment: riskData,
        metrics: {
          volatility,
          sharpe_ratio: sharpeRatio,
          max_drawdown: maxDrawdown,
          var_95: var95,
          beta
        },
        recommendations
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Risk assessment error:', error);
    
    return new Response(JSON.stringify({
      error: {
        code: 'RISK_ASSESSMENT_FAILED',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
