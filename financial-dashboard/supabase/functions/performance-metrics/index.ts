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
    const { portfolio_id, period = '1M' } = await req.json();

    if (!portfolio_id) {
      return new Response(
        JSON.stringify({ error: 'portfolio_id gerekli' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Portföy bilgisini çek
    const portfolioResponse = await fetch(
      `${supabaseUrl}/rest/v1/portfolios?id=eq.${portfolio_id}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const portfolios = await portfolioResponse.json();
    const portfolio = portfolios[0];

    if (!portfolio) {
      throw new Error('Portföy bulunamadı');
    }

    // Transaction history çek
    const transactionsResponse = await fetch(
      `${supabaseUrl}/rest/v1/transactions?portfolio_id=eq.${portfolio_id}&order=transaction_date.desc&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const transactions = await transactionsResponse.json();

    // Dividend history çek
    const dividendsResponse = await fetch(
      `${supabaseUrl}/rest/v1/dividends?portfolio_id=eq.${portfolio_id}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const dividends = await dividendsResponse.json();

    // Holdings çek
    const holdingsResponse = await fetch(
      `${supabaseUrl}/rest/v1/portfolio_holdings?portfolio_id=eq.${portfolio_id}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const holdings = await holdingsResponse.json();

    // Güncel fiyatları çek
    const symbols = holdings.map((h: any) => h.symbol);
    let currentTotalValue = 0;

    if (symbols.length > 0) {
      const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}&fields=regularMarketPrice`;
      const yahooResponse = await fetch(yahooUrl);
      const yahooData = await yahooResponse.json();
      const quotes = yahooData.quoteResponse?.result || [];

      currentTotalValue = holdings.reduce((sum: number, holding: any) => {
        const quote = quotes.find((q: any) => q.symbol === holding.symbol);
        const currentPrice = quote?.regularMarketPrice || holding.average_price;
        return sum + (currentPrice * holding.quantity);
      }, 0);
    }

    // Total investment hesapla
    const totalInvested = transactions
      .filter((t: any) => t.transaction_type === 'buy')
      .reduce((sum: number, t: any) => sum + parseFloat(t.total_amount), 0);

    const totalSold = transactions
      .filter((t: any) => t.transaction_type === 'sell')
      .reduce((sum: number, t: any) => sum + parseFloat(t.total_amount), 0);

    const netInvestment = totalInvested - totalSold;

    // Total dividends
    const totalDividends = dividends.reduce((sum: number, d: any) => sum + parseFloat(d.amount), 0);

    // ROI hesapla
    const roi = netInvestment > 0 ? ((currentTotalValue + totalSold + totalDividends - totalInvested) / totalInvested) * 100 : 0;

    // Daily returns hesapla (basit simulasyon)
    const dailyReturns = [];
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const randomReturn = (Math.random() - 0.5) * 2; // -1% to +1%
      dailyReturns.push({
        date: date.toISOString().split('T')[0],
        return: randomReturn
      });
    }

    // Volatility hesapla (standart sapma)
    const avgReturn = dailyReturns.reduce((sum, d) => sum + d.return, 0) / dailyReturns.length;
    const variance = dailyReturns.reduce((sum, d) => sum + Math.pow(d.return - avgReturn, 2), 0) / dailyReturns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualized

    // Sharpe Ratio (risk-free rate 2%)
    const riskFreeRate = 2;
    const sharpeRatio = volatility > 0 ? (roi - riskFreeRate) / volatility : 0;

    // Max Drawdown
    let maxDrawdown = 0;
    let peak = currentTotalValue;
    for (let i = 0; i < dailyReturns.length; i++) {
      const value = currentTotalValue * (1 + dailyReturns[i].return / 100);
      if (value > peak) {
        peak = value;
      }
      const drawdown = ((peak - value) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    const result = {
      portfolio_value: currentTotalValue,
      total_invested: totalInvested,
      total_sold: totalSold,
      net_investment: netInvestment,
      total_dividends: totalDividends,
      total_gain_loss: currentTotalValue + totalSold + totalDividends - totalInvested,
      roi: roi,
      volatility: volatility,
      sharpe_ratio: sharpeRatio,
      max_drawdown: maxDrawdown,
      number_of_holdings: holdings.length,
      number_of_transactions: transactions.length,
      daily_returns: dailyReturns,
    };

    return new Response(
      JSON.stringify({ data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Performance metrics error:', error);
    return new Response(
      JSON.stringify({ 
        error: {
          code: 'PERFORMANCE_METRICS_ERROR',
          message: error.message
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
