// TCMB EVDS API Integration Edge Function
// Fetches economic data from Central Bank of Turkey

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
        const { indicators, startDate, endDate } = await req.json();

        if (!indicators || !Array.isArray(indicators) || indicators.length === 0) {
            throw new Error('Indicators array is required');
        }

        const evdsApiKey = Deno.env.get('EVDS_API_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!evdsApiKey) {
            throw new Error('EVDS_API_KEY not configured');
        }

        const results = [];
        const startTime = Date.now();

        // TCMB EVDS API Indicator Codes
        const indicatorMap = {
            'TUFE': 'TP.FG.J0', // TÜFE Yıllık % Değişim
            'UFE': 'TP.FG.G01', // ÜFE Yıllık % Değişim
            'USD': 'TP.DK.USD.A', // USD/TL Kuru
            'EUR': 'TP.DK.EUR.A', // EUR/TL Kuru
            'POLICY_RATE': 'TP.TCMB.PP', // Politika Faizi
            'CDS': 'TP.TCMB.CDS', // CDS Primi (5 yıllık)
            'RESERVES': 'TP.MB.B1', // Brüt Rezervler
            'M3': 'TP.M3.Y01' // M3 Para Arzı
        };

        // Fetch data for each indicator
        for (const indicator of indicators) {
            const seriesCode = indicatorMap[indicator];
            if (!seriesCode) {
                console.log(`Unknown indicator: ${indicator}`);
                continue;
            }

            try {
                // EVDS API request
                const evdsUrl = new URL('https://evds2.tcmb.gov.tr/service/evds/');
                evdsUrl.searchParams.append('key', evdsApiKey);
                evdsUrl.searchParams.append('type', 'json');
                evdsUrl.searchParams.append('series', seriesCode);
                
                if (startDate) {
                    evdsUrl.searchParams.append('startDate', startDate.replace(/-/g, ''));
                }
                if (endDate) {
                    evdsUrl.searchParams.append('endDate', endDate.replace(/-/g, ''));
                }

                const evdsResponse = await fetch(evdsUrl.toString());
                
                if (!evdsResponse.ok) {
                    throw new Error(`EVDS API error: ${evdsResponse.status}`);
                }

                const evdsData = await evdsResponse.json();
                
                if (evdsData && evdsData.items && evdsData.items.length > 0) {
                    // Save to database
                    const records = evdsData.items.map(item => ({
                        indicator_code: indicator,
                        period_date: item.Tarih || item.DATE,
                        value: parseFloat(item[seriesCode] || item.Value),
                        metadata: { series_code: seriesCode, raw_data: item },
                        source_url: evdsUrl.toString(),
                        fetched_at: new Date().toISOString()
                    }));

                    // Insert into database
                    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/economic_data`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json',
                            'Prefer': 'resolution=merge-duplicates'
                        },
                        body: JSON.stringify(records)
                    });

                    if (!insertResponse.ok) {
                        const errorText = await insertResponse.text();
                        console.error(`Database insert failed for ${indicator}:`, errorText);
                    }

                    results.push({
                        indicator,
                        records_count: records.length,
                        status: 'success'
                    });

                    // Log fetch operation
                    await fetch(`${supabaseUrl}/rest/v1/data_fetch_logs`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            source: 'TCMB_EVDS',
                            indicator_code: indicator,
                            status: 'success',
                            records_fetched: records.length,
                            fetch_duration_ms: Date.now() - startTime
                        })
                    });
                }
            } catch (error) {
                console.error(`Error fetching ${indicator}:`, error);
                results.push({
                    indicator,
                    status: 'error',
                    error: error.message
                });

                // Log error
                await fetch(`${supabaseUrl}/rest/v1/data_fetch_logs`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        source: 'TCMB_EVDS',
                        indicator_code: indicator,
                        status: 'error',
                        error_message: error.message,
                        fetch_duration_ms: Date.now() - startTime
                    })
                });
            }
        }

        return new Response(JSON.stringify({
            data: {
                results,
                total_duration_ms: Date.now() - startTime,
                timestamp: new Date().toISOString()
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('EVDS fetch error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'EVDS_FETCH_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
