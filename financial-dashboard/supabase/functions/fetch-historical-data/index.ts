// Supabase Edge Function: fetch-historical-data
// Yahoo Finance'den geçmiş verileri çeker ve historical_data tablosuna kaydeder

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
    const { symbol, period = '1y' } = await req.json()

    if (!symbol) {
      throw new Error('Symbol parametresi gerekli')
    }

    // Yahoo Finance API URL
    const yahooSymbol = symbol.replace('^', '%5E')
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=${period}&interval=1d`

    console.log('Fetching historical data for:', symbol)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`)
    }

    const data = await response.json()
    const result = data.chart.result[0]

    if (!result || !result.timestamp) {
      throw new Error('Geçerli veri bulunamadı')
    }

    const timestamps = result.timestamp
    const quotes = result.indicators.quote[0]
    const closes = quotes.close
    const volumes = quotes.volume

    // Verileri hazırla
    const historicalData = []
    for (let i = 0; i < timestamps.length; i++) {
      const date = new Date(timestamps[i] * 1000)
      const dateStr = date.toISOString().split('T')[0]
      
      if (closes[i] !== null && volumes[i] !== null) {
        historicalData.push({
          symbol: symbol,
          data_type: 'daily',
          price: closes[i],
          volume: volumes[i],
          data_date: dateStr
        })
      }
    }

    console.log(`Toplam ${historicalData.length} kayıt bulundu`)

    // Supabase'e kaydet
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials bulunamadı')
    }

    // Önce mevcut verileri sil
    const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/historical_data?symbol=eq.${symbol}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('Eski veriler silindi')

    // Yeni verileri ekle (batch insert)
    const batchSize = 100
    for (let i = 0; i < historicalData.length; i += batchSize) {
      const batch = historicalData.slice(i, i + batchSize)
      
      const insertResponse = await fetch(`${supabaseUrl}/rest/v1/historical_data`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(batch)
      })

      if (!insertResponse.ok) {
        const error = await insertResponse.text()
        throw new Error(`Veritabanı hatası: ${error}`)
      }
    }

    console.log('Veriler başarıyla kaydedildi')

    return new Response(
      JSON.stringify({
        success: true,
        symbol: symbol,
        recordCount: historicalData.length,
        dateRange: {
          start: historicalData[0].data_date,
          end: historicalData[historicalData.length - 1].data_date
        }
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
