Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { portfolioId } = await req.json();

    if (!portfolioId) {
      throw new Error('Portfolio ID is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Portföy varlıklarını çek
    const holdingsResponse = await fetch(
      `${supabaseUrl}/rest/v1/portfolio_holdings?portfolio_id=eq.${portfolioId}&select=*`,
      {
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
        },
      }
    );

    if (!holdingsResponse.ok) {
      throw new Error('Failed to fetch portfolio holdings');
    }

    const holdings = await holdingsResponse.json();

    if (!holdings || holdings.length === 0) {
      return new Response(
        JSON.stringify({
          data: {
            message: 'No holdings found in portfolio',
            analytics: null,
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Varlık türlerine göre dağılım
    const assetTypeDistribution: Record<string, number> = {};
    const symbolPrices: Record<string, number> = {};
    let totalValue = 0;

    for (const holding of holdings) {
      const value = holding.current_value || (holding.quantity * holding.current_price);
      totalValue += value;

      // Varlık türünü belirle (symbol'den)
      let assetType = 'other';
      if (holding.symbol.includes('BTC') || holding.symbol.includes('ETH')) {
        assetType = 'crypto';
      } else if (holding.symbol.includes('USD') || holding.symbol.includes('EUR')) {
        assetType = 'currency';
      } else if (holding.symbol.includes('AU') || holding.symbol.includes('AG')) {
        assetType = 'metal';
      } else if (holding.symbol.endsWith('.IS')) {
        assetType = 'bist';
      } else {
        assetType = 'fund';
      }

      assetTypeDistribution[assetType] = (assetTypeDistribution[assetType] || 0) + value;
      symbolPrices[holding.symbol] = holding.current_price;
    }

    // Yüzdelik dağılım hesapla
    const assetTypePercentages: Record<string, number> = {};
    for (const [type, value] of Object.entries(assetTypeDistribution)) {
      assetTypePercentages[type] = (value / totalValue) * 100;
    }

    // Risk metrikleri hesapla
    const priceChanges = holdings.map((h: any) => h.gain_loss_percent || 0);
    const avgReturn = priceChanges.reduce((sum: number, val: number) => sum + val, 0) / priceChanges.length;
    
    // Volatilite (standart sapma)
    const variance = priceChanges.reduce(
      (sum: number, val: number) => sum + Math.pow(val - avgReturn, 2),
      0
    ) / priceChanges.length;
    const volatility = Math.sqrt(variance);

    // Sharpe Ratio (basitleştirilmiş, risk-free rate = 2%)
    const riskFreeRate = 2;
    const sharpeRatio = volatility !== 0 ? (avgReturn - riskFreeRate) / volatility : 0;

    // Max Drawdown
    const sortedReturns = [...priceChanges].sort((a: number, b: number) => a - b);
    const maxDrawdown = sortedReturns[0] || 0;

    // Concentration score (ne kadar çeşitlendirilmiş)
    const concentrationScore = Object.values(assetTypePercentages).reduce(
      (sum, pct) => sum + Math.pow(pct / 100, 2),
      0
    );
    const diversificationScore = (1 - concentrationScore) * 100;

    // Risk metrikleri kaydet
    const riskMetrics = [
      {
        portfolio_id: portfolioId,
        metric_type: 'volatility',
        value: parseFloat(volatility.toFixed(2)),
        period: '30d',
      },
      {
        portfolio_id: portfolioId,
        metric_type: 'sharpe_ratio',
        value: parseFloat(sharpeRatio.toFixed(2)),
        period: '30d',
      },
      {
        portfolio_id: portfolioId,
        metric_type: 'max_drawdown',
        value: parseFloat(maxDrawdown.toFixed(2)),
        period: '30d',
      },
    ];

    await fetch(`${supabaseUrl}/rest/v1/risk_metrics`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(riskMetrics),
    });

    // Çeşitlendirme analizi kaydet
    const diversificationData = {
      portfolio_id: portfolioId,
      asset_type_distribution: assetTypePercentages,
      concentration_score: parseFloat(concentrationScore.toFixed(2)),
      diversification_score: parseFloat(diversificationScore.toFixed(2)),
      recommendations: diversificationScore < 50 ? 
        ['Portföyünüz yeterince çeşitlendirilmemiş', 'Farklı varlık türlerinden ekleme yapın'] :
        ['Portföyünüz iyi çeşitlendirilmiş', 'Mevcut dağılımı koruyabilirsiniz'],
    };

    await fetch(`${supabaseUrl}/rest/v1/diversification_analysis`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(diversificationData),
    });

    return new Response(
      JSON.stringify({
        data: {
          success: true,
          analytics: {
            totalValue,
            assetTypeDistribution: assetTypePercentages,
            riskMetrics: {
              volatility: parseFloat(volatility.toFixed(2)),
              sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
              maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
            },
            diversification: {
              score: parseFloat(diversificationScore.toFixed(2)),
              concentrationScore: parseFloat(concentrationScore.toFixed(2)),
            },
          },
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Portfolio analytics error:', error);
    return new Response(
      JSON.stringify({
        error: {
          code: 'ANALYTICS_CALCULATION_FAILED',
          message: error.message,
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
