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
    const { portfolioId, userId } = await req.json();

    if (!portfolioId && !userId) {
      throw new Error('portfolioId or userId is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Fetch portfolio holdings
    let query = `${supabaseUrl}/rest/v1/portfolio_holdings?select=*,portfolios(*)`;
    if (portfolioId) {
      query += `&portfolio_id=eq.${portfolioId}`;
    }

    const holdingsResponse = await fetch(query, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      }
    });

    if (!holdingsResponse.ok) {
      throw new Error('Failed to fetch portfolio holdings');
    }

    const holdings = await holdingsResponse.json();

    if (holdings.length === 0) {
      return new Response(JSON.stringify({
        data: {
          performance_data: [],
          total_value: 0,
          total_gain_loss: 0,
          total_gain_loss_percent: 0
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Calculate historical performance (last 30 days)
    const performanceData = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      let totalValue = 0;
      
      for (const holding of holdings) {
        // Simplified: use current price for demo
        // In production, fetch historical price for each date
        totalValue += holding.current_value;
      }
      
      performanceData.push({
        date: dateStr,
        value: totalValue,
        date_formatted: date.toLocaleDateString('tr-TR')
      });
    }

    // Calculate metrics
    const startValue = performanceData[0].value;
    const endValue = performanceData[performanceData.length - 1].value;
    const totalGainLoss = endValue - startValue;
    const totalGainLossPercent = (totalGainLoss / startValue) * 100;

    // Asset allocation
    const assetAllocation = holdings.reduce((acc: any, holding: any) => {
      const assetType = holding.symbol.includes('.IS') ? 'BIST' : 
                       holding.symbol.includes('-USD') ? 'Crypto' : 'Other';
      
      if (!acc[assetType]) {
        acc[assetType] = 0;
      }
      acc[assetType] += holding.current_value;
      return acc;
    }, {});

    const allocationData = Object.entries(assetAllocation).map(([type, value]) => ({
      name: type,
      value: value as number,
      percentage: ((value as number) / endValue * 100).toFixed(2)
    }));

    // Monthly returns (simplified)
    const monthlyReturns = [];
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const currentMonth = today.getMonth();
    
    for (let i = 0; i < 6; i++) {
      const monthIndex = (currentMonth - i + 12) % 12;
      monthlyReturns.unshift({
        month: months[monthIndex],
        return: (Math.random() * 20 - 10).toFixed(2) // Simulated for demo
      });
    }

    return new Response(JSON.stringify({
      data: {
        performance_data: performanceData,
        total_value: endValue,
        total_gain_loss: totalGainLoss,
        total_gain_loss_percent: totalGainLossPercent,
        asset_allocation: allocationData,
        monthly_returns: monthlyReturns,
        holdings_count: holdings.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Portfolio performance error:', error);
    
    return new Response(JSON.stringify({
      error: {
        code: 'PORTFOLIO_PERFORMANCE_FAILED',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
