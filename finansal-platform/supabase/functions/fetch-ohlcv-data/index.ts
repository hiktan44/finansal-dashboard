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
    const { symbol, interval = '1d', range = '1mo' } = await req.json();

    if (!symbol) {
      throw new Error('Symbol is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Yahoo Finance OHLC data
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
    const yahooResponse = await fetch(yahooUrl);
    
    if (!yahooResponse.ok) {
      throw new Error(`Yahoo Finance API error: ${yahooResponse.statusText}`);
    }

    const yahooData = await yahooResponse.json();
    const result = yahooData?.chart?.result?.[0];
    
    if (!result) {
      throw new Error('No data available');
    }

    const timestamps = result.timestamp;
    const indicators = result.indicators.quote[0];
    
    // Format OHLCV data
    const ohlcvData = timestamps.map((timestamp: number, index: number) => ({
      timestamp,
      date: new Date(timestamp * 1000).toISOString(),
      open: indicators.open[index],
      high: indicators.high[index],
      low: indicators.low[index],
      close: indicators.close[index],
      volume: indicators.volume[index]
    })).filter((d: any) => d.open !== null && d.close !== null);

    // Save to database
    const insertData = ohlcvData.map((item: any) => ({
      symbol,
      timestamp: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
      interval,
      metadata: { source: 'yahoo_finance' }
    }));

    // Batch insert
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/ohlcv_data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=ignore-duplicates'
      },
      body: JSON.stringify(insertData)
    });

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      console.error('Database insert error:', errorText);
    }

    return new Response(JSON.stringify({
      data: {
        symbol,
        interval,
        range,
        data_points: ohlcvData.length,
        ohlcv: ohlcvData,
        metadata: {
          currency: result.meta.currency,
          exchange: result.meta.exchangeName,
          current_price: result.meta.regularMarketPrice
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('OHLCV fetch error:', error);
    
    return new Response(JSON.stringify({
      error: {
        code: 'OHLCV_FETCH_FAILED',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
