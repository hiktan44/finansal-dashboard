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
    // FRED API anahtarini environment'tan al
    const fredApiKey = Deno.env.get('FRED_API_KEY') || '0df5797f9ebff69b4661c6276618042d';
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!fredApiKey) {
      throw new Error('FRED_API_KEY bulunamadi');
    }

    // Request'ten parametreleri al
    const { seriesIds, startDate, endDate } = await req.json();

    // Varsayilan FRED serileri
    const defaultSeriesIds = seriesIds || [
      'FEDFUNDS',    // Federal Funds Rate
      'GDP',         // Gross Domestic Product
      'CPIAUCSL',    // Consumer Price Index
      'UNRATE',      // Unemployment Rate
      'DGS10',       // 10-Year Treasury
      'DGS2',        // 2-Year Treasury
      'DGS1',        // 1-Year Treasury
      'DEXUSAL',     // USD/AUD
      'DEXCHUS',     // USD/CNY
      'DEXDEUS',     // USD/EUR
      'DEXJPUS',     // USD/JPY
      'DEXUKUS',     // USD/GBP
    ];

    // Tarih araligini belirle
    const today = new Date();
    const end = endDate || today.toISOString().split('T')[0];
    const start = startDate || new Date(today.getFullYear() - 5, today.getMonth(), today.getDate()).toISOString().split('T')[0];

    console.log(`FRED API veri toplama basladi: ${start} - ${end}`);

    // Tum serileri paralel olarak topla
    const seriesPromises = defaultSeriesIds.map(async (seriesId) => {
      try {
        // 1. Seri bilgilerini al
        const seriesInfoUrl = `https://api.stlouisfed.org/fred/series?series_id=${seriesId}&api_key=${fredApiKey}&file_type=json`;
        const seriesInfoResponse = await fetch(seriesInfoUrl);
        
        if (!seriesInfoResponse.ok) {
          console.error(`${seriesId} seri bilgisi alinamadi:`, await seriesInfoResponse.text());
          return null;
        }

        const seriesInfoData = await seriesInfoResponse.json();
        const seriesInfo = seriesInfoData.seriess?.[0];

        if (!seriesInfo) {
          console.error(`${seriesId} seri bilgisi bulunamadi`);
          return null;
        }

        // 2. Gozlem verilerini al
        const observationsUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${fredApiKey}&file_type=json&observation_start=${start}&observation_end=${end}&frequency=m`;
        const observationsResponse = await fetch(observationsUrl);

        if (!observationsResponse.ok) {
          console.error(`${seriesId} gozlem verileri alinamadi:`, await observationsResponse.text());
          return null;
        }

        const observationsData = await observationsResponse.json();
        const observations = observationsData.observations || [];

        // Gecerli verileri filtrele
        const validData = observations
          .filter((obs: any) => obs.value && obs.value !== '.' && !isNaN(parseFloat(obs.value)))
          .map((obs: any) => ({
            date: obs.date,
            value: parseFloat(obs.value),
          }));

        console.log(`${seriesId}: ${validData.length} veri noktasi toplandı`);

        // Rate limiting icin kisa bekleme
        await new Promise(resolve => setTimeout(resolve, 100));

        return {
          series_id: seriesId,
          title: seriesInfo.title,
          description: seriesInfo.notes || '',
          frequency: seriesInfo.frequency || 'Monthly',
          units: seriesInfo.units || '',
          seasonal_adjustment: seriesInfo.seasonal_adjustment || '',
          last_updated: seriesInfo.last_updated || '',
          observation_start: seriesInfo.observation_start || start,
          observation_end: seriesInfo.observation_end || end,
          record_count: validData.length,
          data: validData,
        };
      } catch (error) {
        console.error(`${seriesId} hatasi:`, error);
        return null;
      }
    });

    // Tum isteklerin tamamlanmasini bekle
    const results = await Promise.all(seriesPromises);
    const successfulResults = results.filter((r) => r !== null);

    // Sonuc verisini hazirlayalim
    const responseData = {
      collection_info: {
        collection_date: new Date().toISOString(),
        start_date: start,
        end_date: end,
        total_series: defaultSeriesIds.length,
        successful_series: successfulResults.length,
        failed_series: defaultSeriesIds.length - successfulResults.length,
        total_records: successfulResults.reduce((sum, s) => sum + (s?.record_count || 0), 0),
      },
      series: successfulResults.reduce((acc, series) => {
        if (series) {
          acc[series.series_id] = series;
        }
        return acc;
      }, {} as Record<string, any>),
    };

    console.log(`FRED veri toplama tamamlandi: ${successfulResults.length}/${defaultSeriesIds.length} basarili`);

    return new Response(JSON.stringify({ data: responseData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('FRED API hatasi:', error);

    const errorResponse = {
      error: {
        code: 'FRED_API_ERROR',
        message: error instanceof Error ? error.message : 'Bilinmeyen hata',
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
