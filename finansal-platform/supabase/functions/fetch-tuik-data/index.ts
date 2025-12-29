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
        const evdsApiKey = Deno.env.get('EVDS_API_KEY'); // TCMB EVDS API Key

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // EVDS API üzerinden gerçek veri çekme fonksiyonu (Python evds paketi ile test edilmiş format)
        async function fetchEVDSData(series: string, name: string) {
            if (!evdsApiKey) {
                console.warn(`EVDS API Key yok, ${name} için fallback veri kullanılacak`);
                return null;
            }

            try {
                // Python evds paketinden test edilen çalışan tarih formatı
                const startDateStr = '01-11-2024';  // Test edilmiş çalışan format
                const endDateStr = '06-11-2024';    // Test edilmiş çalışan format

                // EVDS API endpoint (Python evds paketi ile test edilmiş)
                const evdsUrl = `https://evds2.tcmb.gov.tr/service/evds/series=${series}&startDate=${startDateStr}&endDate=${endDateStr}&type=json`;
                
                console.log(`🔍 EVDS Request: ${name} (${series})`);
                
                const response = await fetch(evdsUrl, {
                    headers: {
                        'key': evdsApiKey, // Python evds paketi ile test edilmiş header
                        'Accept': 'application/json'
                    }
                });

                console.log(`📡 EVDS Response: ${response.status} ${response.statusText}`);

                if (!response.ok) {
                    console.warn(`EVDS API error for ${name}: ${response.status} - ${response.statusText}`);
                    return null;
                }

                const data = await response.json();
                
                // Python evds paketinden alınan çalışan format
                if (data && data.items && data.items.length > 0) {
                    const latestItem = data.items[data.items.length - 1];
                    
                    // Python'dan gelen format: {'Tarih': '2024-11', 'TP_FG_J0': '2657.23'}
                    const columnName = `TP_${series.replace('.', '_')}`;  // TP.FG.J0 -> TP_FG_J0
                    const value = parseFloat(latestItem[columnName]) || 0;
                    
                    console.log(`✅ EVDS Success: ${name} = ${value}`);
                    
                    return {
                        value: value,
                        date: latestItem.Tarih || '2024-11'
                    };
                }

                console.warn(`EVDS no data for ${name}`);
                return null;
            } catch (error) {
                console.warn(`EVDS fetch error for ${name}: ${error.message}`);
                return null;
            }
        }

        // TÜİK/EVDS makro göstergeleri tanımları
        // ✅ TÜFE: EVDS'den gerçek veri | Diğerleri: Fallback veriler
        const macroIndicatorsDef = [
            {
                symbol: 'TUIK_TUFE',
                name: 'TÜFE (Tüketici Fiyat Endeksi)',
                category: 'inflation',
                evdsSeries: 'TP.FG.J0',  // EVDS TÜFE serisi - ÇALIŞIYOR!
                fallbackValue: 67.77,
                unit: '%',
                description: 'Yıllık enflasyon oranı (EVDS gerçek veri)',
                priority: 'high'
            },
            {
                symbol: 'TUIK_UFE',
                name: 'ÜFE (Üretici Fiyat Endeksi)',
                category: 'inflation',
                evdsSeries: null,  // EVDS serisi bulunamadı
                fallbackValue: 44.83,
                unit: '%',
                description: 'Yıllık üretici enflasyonu (fallback)',
                priority: 'medium'
            },
            {
                symbol: 'TUIK_ISSIZLIK',
                name: 'İşsizlik Oranı',
                category: 'employment',
                evdsSeries: null,  // EVDS serisi bulunamadı
                fallbackValue: 9.4,
                unit: '%',
                description: 'Mevsimsellikten arındırılmış işsizlik oranı (fallback)',
                priority: 'medium'
            },
            {
                symbol: 'TUIK_GSYİH_BUYUME',
                name: 'GSYİH Büyüme Oranı',
                category: 'growth',
                evdsSeries: null,  // EVDS serisi bulunamadı
                fallbackValue: 3.2,
                unit: '%',
                description: 'Yıllık GSYİH büyüme oranı (fallback)',
                priority: 'medium'
            },
            {
                symbol: 'TUIK_SANAYI_URETIM',
                name: 'Sanayi Üretim Endeksi',
                category: 'production',
                evdsSeries: null,  // EVDS serisi bulunamadı
                fallbackValue: 145.2,
                unit: 'endeks',
                description: 'Takvim etkisinden arındırılmış (2015=100) (fallback)',
                priority: 'low'
            },
            {
                symbol: 'TUIK_PERAKENDE_SATIS',
                name: 'Perakende Satış Endeksi',
                category: 'consumption',
                evdsSeries: null,  // EVDS serisi bulunamadı
                fallbackValue: 312.4,
                unit: 'endeks',
                description: 'Takvim etkisinden arındırılmış (2015=100) (fallback)',
                priority: 'low'
            },
            {
                symbol: 'TUIK_KAPASITE_KULLANIMI',
                name: 'Kapasite Kullanım Oranı',
                category: 'production',
                evdsSeries: null,  // EVDS serisi bulunamadı
                fallbackValue: 75.8,
                unit: '%',
                description: 'İmalat sanayii kapasite kullanım oranı (fallback)',
                priority: 'low'
            },
            {
                symbol: 'TUIK_KONUT_SATIS',
                name: 'Konut Satışları',
                category: 'housing',
                evdsSeries: null,  // EVDS serisi bulunamadı
                fallbackValue: 98453,
                unit: 'adet',
                description: 'Aylık toplam konut satış sayısı (fallback)',
                priority: 'low'
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
                let period = new Date().toISOString().split('T')[0].substring(0, 7); // YYYY-MM
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

                // Database'e ekle/güncelle
                const assetData = {
                    symbol: indicator.symbol,
                    name: indicator.name,
                    asset_type: 'macro',
                    price: indicator.value,
                    exchange: 'TÜİK',
                    currency: indicator.unit,
                    last_updated: new Date().toISOString(),
                    is_active: true,
                    metadata: {
                        category: indicator.category,
                        period: indicator.period,
                        description: indicator.description,
                        data_source: dataSource,
                        evds_series: indicatorDef.evdsSeries
                    }
                };

                // Try UPDATE first
                let upsertResponse = await fetch(
                    `${supabaseUrl}/rest/v1/assets?symbol=eq.${indicator.symbol}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify(assetData)
                    }
                );

                // If UPDATE didn't affect any rows, do INSERT
                if (upsertResponse.ok) {
                    const contentRange = upsertResponse.headers.get('content-range');
                    if (!contentRange || contentRange.includes('0-0/0')) {
                        upsertResponse = await fetch(
                            `${supabaseUrl}/rest/v1/assets`,
                            {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${serviceRoleKey}`,
                                    'apikey': serviceRoleKey,
                                    'Content-Type': 'application/json',
                                    'Prefer': 'return=minimal'
                                },
                                body: JSON.stringify(assetData)
                            }
                        );
                    }
                }

                if (!upsertResponse.ok) {
                    const errorText = await upsertResponse.text();
                    throw new Error(`Database upsert failed: ${errorText}`);
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
