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
        console.log('=== TÜİK Makro Verileri Fetch Başlatıldı ===');

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const evdsApiKey = Deno.env.get('EVDS_API_KEY') || Deno.env.get('evds_api_key'); // TCMB EVDS API Key
        
        console.log('Environment check:', {
            hasServiceRoleKey: !!serviceRoleKey,
            hasSupabaseUrl: !!supabaseUrl,
            hasEvdsApiKey: !!evdsApiKey,
            evdsKeyLength: evdsApiKey ? evdsApiKey.length : 0
        });

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // EVDS API üzerinden gerçek veri çekme fonksiyonu
        async function fetchEVDSData(series: string, name: string) {
            if (!evdsApiKey) {
                console.warn(`EVDS API Key yok, ${name} için fallback veri kullanılacak`);
                return null;
            }

            try {
                const today = new Date();
                const startDate = new Date(today);
                startDate.setMonth(startDate.getMonth() - 1); // Son 1 ay

                const startDateStr = startDate.toISOString().split('T')[0];
                const endDateStr = today.toISOString().split('T')[0];

                // EVDS API endpoint (JSON format) - 5 Nisan 2024 değişikliği: API key header'da
                const evdsUrl = `https://evds2.tcmb.gov.tr/service/evds/series=${series}&startDate=${startDateStr}&endDate=${endDateStr}&type=json`;
                
                const response = await fetch(evdsUrl, {
                    headers: {
                        'Accept': 'application/json',
                        'key': evdsApiKey  // 5 Nisan 2024 değişikliği: API key header'da gönderiliyor
                    }
                });

                if (!response.ok) {
                    console.warn(`EVDS API error for ${name}: ${response.status}`);
                    return null;
                }

                const data = await response.json();
                
                // Son veriyi al
                if (data && data.items && data.items.length > 0) {
                    const latestItem = data.items[data.items.length - 1];
                    return {
                        value: parseFloat(latestItem[series]) || 0,
                        date: latestItem.Tarih || latestItem.UNIXTIME
                    };
                }

                return null;
            } catch (error) {
                console.warn(`EVDS fetch error for ${name}: ${error.message}`);
                return null;
            }
        }

        // TÜİK/EVDS makro göstergeleri tanımları
        const macroIndicatorsDef = [
            {
                symbol: 'TUIK_TUFE',
                name: 'TÜFE (Tüketici Fiyat Endeksi)',
                category: 'inflation',
                evdsSeries: 'TP.FG.J0',  // EVDS TÜFE serisi
                fallbackValue: 67.77,
                unit: '%',
                description: 'Yıllık enflasyon oranı'
            },
            {
                symbol: 'TUIK_UFE',
                name: 'ÜFE (Üretici Fiyat Endeksi)',
                category: 'inflation',
                evdsSeries: 'TP.FG.G1',  // EVDS ÜFE serisi
                fallbackValue: 44.83,
                unit: '%',
                description: 'Yıllık üretici enflasyonu'
            },
            {
                symbol: 'TUIK_ISSIZLIK',
                name: 'İşsizlik Oranı',
                category: 'employment',
                evdsSeries: 'bie_yssk021',  // EVDS işsizlik serisi
                fallbackValue: 9.4,
                unit: '%',
                description: 'Mevsimsellikten arındırılmış işsizlik oranı'
            },
            {
                symbol: 'TUIK_GSYİH_BUYUME',
                name: 'GSYİH Büyüme Oranı',
                category: 'growth',
                evdsSeries: 'bie_gsyih',  // EVDS GSYİH serisi
                fallbackValue: 3.2,
                unit: '%',
                description: 'Yıllık GSYİH büyüme oranı'
            },
            {
                symbol: 'TUIK_SANAYI_URETIM',
                name: 'Sanayi Üretim Endeksi',
                category: 'production',
                evdsSeries: 'TP.SAN.INDEX',  // EVDS sanayi üretim endeksi
                fallbackValue: 145.2,
                unit: 'endeks',
                description: 'Takvim etkisinden arındırılmış (2015=100)'
            },
            {
                symbol: 'TUIK_PERAKENDE_SATIS',
                name: 'Perakende Satış Endeksi',
                category: 'consumption',
                evdsSeries: 'TP.PERSAN.INDEX',  // Fallback - gerçek seri kodu güncellenecek
                fallbackValue: 312.4,
                unit: 'endeks',
                description: 'Takvim etkisinden arındırılmış (2015=100)'
            },
            {
                symbol: 'TUIK_KAPASITE_KULLANIMI',
                name: 'Kapasite Kullanım Oranı',
                category: 'production',
                evdsSeries: 'TP.KKULLAN',  // Fallback - gerçek seri kodu güncellenecek
                fallbackValue: 75.8,
                unit: '%',
                description: 'İmalat sanayii kapasite kullanım oranı'
            },
            {
                symbol: 'TUIK_KONUT_SATIS',
                name: 'Konut Satışları',
                category: 'housing',
                evdsSeries: 'TP.KONUT.SATIS',  // Fallback - gerçek seri kodu güncellenecek
                fallbackValue: 98453,
                unit: 'adet',
                description: 'Aylık toplam konut satış sayısı'
            }
        ];

        const results = {
            success: 0,
            failed: 0,
            evdsUsed: 0,
            fallbackUsed: 0,
            errors: [] as string[]
        };

        const macroIndicators = [];

        // Her gösterge için veri çek
        for (const indicatorDef of macroIndicatorsDef) {
            try {
                let value = indicatorDef.fallbackValue;
                let period = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
                let dataSource = 'fallback';

                // EVDS'den gerçek veri çekmeyi dene
                if (evdsApiKey && indicatorDef.evdsSeries) {
                    const evdsData = await fetchEVDSData(indicatorDef.evdsSeries, indicatorDef.name);
                    if (evdsData && evdsData.value) {
                        value = evdsData.value;
                        period = evdsData.date;
                        dataSource = 'EVDS';
                        results.evdsUsed++;
                    } else {
                        results.fallbackUsed++;
                    }
                } else {
                    results.fallbackUsed++;
                }

                const indicator = {
                    symbol: indicatorDef.symbol,
                    name: indicatorDef.name,
                    category: indicatorDef.category,
                    value: value,
                    unit: indicatorDef.unit,
                    period: period,
                    description: indicatorDef.description,
                    dataSource: dataSource
                };

                macroIndicators.push(indicator);

                // Database'e ekle/güncelle (macro_data tablosuna)
                const macroData = {
                    country: 'TR',
                    indicator: indicator.name,
                    value: indicator.value,
                    unit: indicator.unit,
                    date: period, // Already in YYYY-MM-DD format
                    source: 'TÜİK',
                    metadata: {
                        symbol: indicator.symbol,
                        category: indicator.category,
                        description: indicator.description,
                        data_source: dataSource,
                        evds_series: indicatorDef.evdsSeries
                    }
                };

                // Use Supabase UPSERT with on_conflict parameter
                const upsertResponse = await fetch(
                    `${supabaseUrl}/rest/v1/macro_data?on_conflict=country,indicator,date`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json',
                            'Prefer': 'resolution=merge-duplicates,return=minimal'
                        },
                        body: JSON.stringify(macroData)
                    }
                );

                if (!upsertResponse.ok) {
                    const errorText = await upsertResponse.text();
                    console.warn(`Database upsert warning for ${indicator.symbol}: ${errorText}`);
                    // Don't throw error for duplicate keys, just log
                    if (!errorText.includes('23505')) {
                        throw new Error(`Database upsert failed: ${errorText}`);
                    }
                }

                results.success++;
                console.log(`✓ ${indicator.symbol}: ${indicator.value} ${indicator.unit} [${dataSource}]`);

            } catch (error) {
                results.failed++;
                const errorMsg = `${indicatorDef.symbol}: ${error.message}`;
                results.errors.push(errorMsg);
                console.error(`✗ ${errorMsg}`);
            }
        }

        console.log(`\n=== İşlem Tamamlandı ===`);
        console.log(`Başarılı: ${results.success}, Başarısız: ${results.failed}`);
        console.log(`EVDS: ${results.evdsUsed}, Fallback: ${results.fallbackUsed}`);

        return new Response(JSON.stringify({
            data: {
                total: macroIndicatorsDef.length,
                success: results.success,
                failed: results.failed,
                evds_used: results.evdsUsed,
                fallback_used: results.fallbackUsed,
                indicators: macroIndicators.map(i => ({ 
                    symbol: i.symbol, 
                    value: i.value, 
                    unit: i.unit,
                    source: i.dataSource
                })),
                errors: results.errors,
                message: `${results.success} TÜİK göstergesi başarıyla güncellendi`,
                note: evdsApiKey ? 'EVDS API aktif' : 'EVDS API Key yok, fallback veri kullanıldı'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('TÜİK Fetch error:', error);

        const errorResponse = {
            error: {
                code: 'TUIK_FETCH_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
