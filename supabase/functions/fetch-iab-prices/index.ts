Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        console.log('=== İAB Emtia Fiyatları Fetch Başlatıldı ===');

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // İAB emtia fiyatları (simüle edilmiş - gerçek API entegrasyonu sonrası güncellenecek)
        // Yahoo Finance'den gerçek zamanlı altın/gümüş fiyatları
        const commodities = [
            { symbol: 'XAU/TRY', yahooSymbol: 'GC=F', name: 'Altın (Ons/TL)', multiplier: 1 },
            { symbol: 'XAG/TRY', yahooSymbol: 'SI=F', name: 'Gümüş (Ons/TL)', multiplier: 1 },
            { symbol: 'ALTIN_GR', name: 'Altın (Gram)', yahooSymbol: 'GC=F', multiplier: 0.03215 },
            { symbol: 'GUMUS_GR', name: 'Gümüş (Gram)', yahooSymbol: 'SI=F', multiplier: 0.03215 }
        ];

        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[]
        };

        // USD/TRY kurunu al (çarpan için)
        let usdTryRate = 34.20; // Default
        try {
            const fxUrl = 'https://query1.finance.yahoo.com/v8/finance/chart/TRY=X';
            const fxResponse = await fetch(fxUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            
            if (fxResponse.ok) {
                const fxData = await fxResponse.json();
                const fxPrice = fxData?.chart?.result?.[0]?.meta?.regularMarketPrice;
                if (fxPrice) {
                    usdTryRate = fxPrice;
                    console.log(`USD/TRY: ${usdTryRate}`);
                }
            }
        } catch (error) {
            console.warn(`USD/TRY alınamadı, default kullanılıyor: ${error.message}`);
        }

        // Her emtiayı işle
        for (const commodity of commodities) {
            try {
                let price = 0;

                // Yahoo Finance'den fiyat çek
                const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${commodity.yahooSymbol}`;
                const yahooResponse = await fetch(yahooUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });

                if (!yahooResponse.ok) {
                    throw new Error(`Yahoo Finance API error: ${yahooResponse.status}`);
                }

                const yahooData = await yahooResponse.json();
                const result = yahooData?.chart?.result?.[0];

                if (!result) {
                    throw new Error('No data from Yahoo Finance');
                }

                const meta = result.meta;
                const usdPrice = meta?.regularMarketPrice || meta?.previousClose || 0;

                // TL'ye çevir ve multiplier uygula
                price = usdPrice * usdTryRate * commodity.multiplier;

                const assetData = {
                    symbol: commodity.symbol,
                    name: commodity.name,
                    asset_type: 'commodity',
                    price: parseFloat(price.toFixed(2)),
                    exchange: 'IAB',
                    currency: 'TRY',
                    last_updated: new Date().toISOString(),
                    is_active: true,
                    metadata: {
                        usd_price: usdPrice,
                        usd_try_rate: usdTryRate,
                        multiplier: commodity.multiplier,
                        yahoo_symbol: commodity.yahooSymbol
                    }
                };

                // Use Supabase native UPSERT (resolution=merge-duplicates)
                const upsertResponse = await fetch(
                    `${supabaseUrl}/rest/v1/assets`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json',
                            'Prefer': 'resolution=merge-duplicates,return=minimal'
                        },
                        body: JSON.stringify(assetData)
                    }
                );

                if (!upsertResponse.ok) {
                    const errorText = await upsertResponse.text();
                    throw new Error(`Database upsert failed: ${errorText}`);
                }

                results.success++;
                console.log(`✓ ${commodity.symbol}: ${price.toFixed(2)} TRY`);

            } catch (error) {
                results.failed++;
                const errorMsg = `${commodity.symbol}: ${error.message}`;
                results.errors.push(errorMsg);
                console.error(`✗ ${errorMsg}`);
            }
        }

        console.log(`\n=== İşlem Tamamlandı ===`);
        console.log(`Başarılı: ${results.success}, Başarısız: ${results.failed}`);

        return new Response(JSON.stringify({
            data: {
                total: commodities.length,
                success: results.success,
                failed: results.failed,
                usd_try_rate: usdTryRate,
                commodities: commodities.map(c => ({ 
                    symbol: c.symbol, 
                    name: c.name 
                })),
                errors: results.errors,
                message: `${results.success} İAB emtia fiyatı başarıyla güncellendi`
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('İAB Fetch error:', error);

        const errorResponse = {
            error: {
                code: 'IAB_FETCH_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
