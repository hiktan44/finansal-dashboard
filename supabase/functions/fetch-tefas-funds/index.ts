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
        console.log('=== TEFAS Fonları Fetch Başlatıldı ===');

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // TEFAS API endpoint
        const tefasUrl = 'https://www.tefas.gov.tr/api/DB/BindHistoryInfo';
        
        // Bugünün tarihi
        const today = new Date();
        const dateStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
        
        console.log(`TEFAS tarihi: ${dateStr}`);

        // TEFAS POST request
        const formData = new URLSearchParams();
        formData.append('fontip', 'YAT'); // Yatırım fonu tipi
        formData.append('sfontur', '');
        formData.append('kurucukod', '');
        formData.append('fonkod', ''); // Boş = tüm fonlar
        formData.append('bastarih', dateStr);
        formData.append('bittarih', dateStr);
        formData.append('fonturkod', '');
        formData.append('fonunvantip', '');

        console.log('TEFAS API çağrılıyor...');
        
        const tefasResponse = await fetch(tefasUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Referer': 'https://www.tefas.gov.tr/TarihselVeriler.aspx',
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': 'Mozilla/5.0'
            },
            body: formData.toString()
        });

        if (!tefasResponse.ok) {
            throw new Error(`TEFAS API failed: ${tefasResponse.status}`);
        }

        const tefasData = await tefasResponse.json();
        
        console.log(`TEFAS yanıtı alındı: ${tefasData.recordsTotal} toplam kayıt`);

        if (!tefasData.data || tefasData.data.length === 0) {
            console.warn('TEFAS fonları bulunamadı');
            return new Response(JSON.stringify({
                data: {
                    total: 0,
                    success: 0,
                    failed: 0,
                    message: 'TEFAS fonları bulunamadı'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const results = {
            success: 0,
            failed: 0,
            data: [] as any[],
            errors: [] as string[]
        };

        // Her fonu database'e ekle
        for (const fund of tefasData.data) {
            try {
                const fundCode = fund.FONKODU;
                const fundName = fund.FONUNVAN;
                const price = parseFloat(fund.FIYAT);
                
                if (!fundCode || isNaN(price)) {
                    console.warn(`Geçersiz fon: ${fundCode}`);
                    continue;
                }

                // Convert timestamp to date
                const timestamp = parseInt(fund.TARIH);
                const lastUpdated = new Date(timestamp).toISOString();

                const assetData = {
                    symbol: fundCode,
                    name: fundName,
                    asset_type: 'TEFAS',
                    price: price,
                    exchange: 'TEFAS',
                    currency: 'TRY',
                    last_updated: lastUpdated,
                    is_active: true,
                    metadata: {
                        share_count: parseFloat(fund.TEDPAYSAYISI || 0),
                        investor_count: parseFloat(fund.KISISAYISI || 0),
                        portfolio_size: parseFloat(fund.PORTFOYBUYUKLUK || 0)
                    }
                };

                // Check if exists
                const checkUrl = `${supabaseUrl}/rest/v1/assets?symbol=eq.${fundCode}&select=id`;
                const checkResponse = await fetch(checkUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                const existingRecords = await checkResponse.json();
                let operation = '';

                if (existingRecords && existingRecords.length > 0) {
                    // UPDATE
                    operation = 'UPDATE';
                    const updateUrl = `${supabaseUrl}/rest/v1/assets?symbol=eq.${fundCode}`;
                    const updateResponse = await fetch(updateUrl, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify(assetData)
                    });

                    if (!updateResponse.ok) {
                        const errorText = await updateResponse.text();
                        throw new Error(`UPDATE failed: ${errorText}`);
                    }
                } else {
                    // INSERT
                    operation = 'INSERT';
                    const insertUrl = `${supabaseUrl}/rest/v1/assets`;
                    const insertResponse = await fetch(insertUrl, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify(assetData)
                    });

                    if (!insertResponse.ok) {
                        const errorText = await insertResponse.text();
                        throw new Error(`INSERT failed: ${errorText}`);
                    }
                }

                results.success++;
                results.data.push({ code: fundCode, price: price.toFixed(4), operation });
                
                if (results.success % 100 === 0) {
                    console.log(`İşlenen fon sayısı: ${results.success}`);
                }

            } catch (error) {
                results.failed++;
                const errorMsg = `${fund.FONKODU}: ${error.message}`;
                results.errors.push(errorMsg);
                console.error(`✗ ${errorMsg}`);
            }
        }

        console.log(`\n=== İşlem Tamamlandı ===`);
        console.log(`Başarılı: ${results.success}, Başarısız: ${results.failed}`);

        return new Response(JSON.stringify({
            data: {
                total: tefasData.recordsTotal,
                processed: tefasData.data.length,
                success: results.success,
                failed: results.failed,
                date: dateStr,
                funds: results.data.slice(0, 50), // İlk 50 fonun detayı
                errors: results.errors.slice(0, 20), // İlk 20 hatanın detayı
                message: `${results.success} TEFAS fonu başarıyla güncellendi`
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('TEFAS Fetch error:', error);
        console.error('Error stack:', error.stack);

        const errorResponse = {
            error: {
                code: 'TEFAS_FETCH_FAILED',
                message: error.message,
                stack: error.stack
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
