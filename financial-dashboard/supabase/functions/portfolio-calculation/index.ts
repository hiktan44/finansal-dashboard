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
    const { portfolio_id } = await req.json();

    if (!portfolio_id) {
      return new Response(
        JSON.stringify({ error: 'portfolio_id gerekli' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Portföy holdinglerini çek
    const holdingsResponse = await fetch(
      `${supabaseUrl}/rest/v1/portfolio_holdings?portfolio_id=eq.${portfolio_id}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!holdingsResponse.ok) {
      throw new Error('Holdings çekilemedi');
    }

    const holdings = await holdingsResponse.json();

    if (!holdings || holdings.length === 0) {
      return new Response(
        JSON.stringify({ 
          total_value: 0,
          total_cost: 0,
          total_gain_loss: 0,
          total_gain_loss_percent: 0,
          holdings_with_current: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Her holding için güncel fiyatı Yahoo Finance'den çek
    const symbols = holdings.map((h: any) => h.symbol);
    const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent`;

    const yahooResponse = await fetch(yahooUrl);
    const yahooData = await yahooResponse.json();
    const quotes = yahooData.quoteResponse?.result || [];

    let totalValue = 0;
    let totalCost = 0;

    const holdingsWithCurrent = holdings.map((holding: any) => {
      const quote = quotes.find((q: any) => q.symbol === holding.symbol);
      const currentPrice = quote?.regularMarketPrice || holding.average_price;
      const marketValue = currentPrice * holding.quantity;
      const costBasis = holding.average_price * holding.quantity;
      const gainLoss = marketValue - costBasis;
      const gainLossPercent = (gainLoss / costBasis) * 100;

      totalValue += marketValue;
      totalCost += costBasis;

      return {
        ...holding,
        current_price: currentPrice,
        market_value: marketValue,
        cost_basis: costBasis,
        gain_loss: gainLoss,
        gain_loss_percent: gainLossPercent,
        change: quote?.regularMarketChange || 0,
        change_percent: quote?.regularMarketChangePercent || 0,
      };
    });

    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    const result = {
      total_value: totalValue,
      total_cost: totalCost,
      total_gain_loss: totalGainLoss,
      total_gain_loss_percent: totalGainLossPercent,
      holdings_with_current: holdingsWithCurrent,
    };

    return new Response(
      JSON.stringify({ data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Portfolio calculation error:', error);
    return new Response(
      JSON.stringify({ 
        error: {
          code: 'PORTFOLIO_CALCULATION_ERROR',
          message: error.message
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
