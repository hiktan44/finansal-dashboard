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
        console.log('=== TCMB Data Fetch başlatıldı ===');

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        console.log(`Supabase URL: ${supabaseUrl}`);
        console.log(`Service Role Key: ${serviceRoleKey.substring(0, 20)}...`);

        // TCMB official XML feed
        const tcmbUrl = 'https://www.tcmb.gov.tr/kurlar/today.xml';
        
        console.log('TCMB XML feed çekiliyor...');
        
        // Retry logic for TCMB API
        let xmlData = '';
        let retries = 3;
        
        while (retries > 0) {
            try {
                const tcmbResponse = await fetch(tcmbUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (!tcmbResponse.ok) {
                    throw new Error(`TCMB API returned status ${tcmbResponse.status}`);
                }

                xmlData = await tcmbResponse.text();
                
                if (!xmlData || xmlData.length < 100) {
                    throw new Error('Empty or invalid XML response');
                }
                
                console.log(`TCMB XML başarıyla alındı (${xmlData.length} bytes)`);
                break;
            } catch (error) {
                retries--;
                console.warn(`TCMB API attempt failed (${3 - retries}/3): ${error.message}`);
                
                if (retries === 0) {
                    throw new Error(`TCMB API failed after 3 attempts: ${error.message}`);
                }
                
                // Wait 2 seconds before retry
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        // Parse XML manually (no DOMParser in Deno)
        const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'SAR', 'CAD', 'AUD'];
        
        const results = {
            success: 0,
            failed: 0,
            data: [] as any[],
            errors: [] as string[],
            debugInfo: [] as any[]
        };

        // Extract date from XML
        const dateMatch = xmlData.match(/Tarih="([^"]+)"/);
        const bulletinDate = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
        
        // Convert DD.MM.YYYY to YYYY-MM-DD
        const dateParts = bulletinDate.split('.');
        const formattedDate = dateParts.length === 3 
            ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
            : new Date().toISOString().split('T')[0];

        console.log(`Tarih: ${bulletinDate} → ${formattedDate}`);

        for (const currency of currencies) {
            try {
                console.log(`\n--- ${currency} işleniyor ---`);
                
                // Extract currency data using regex
                const currencyPattern = new RegExp(
                    `<Currency[^>]*CrossOrder="\\d+"[^>]*Kod="${currency}"[^>]*>[\\s\\S]*?<ForexSelling>([^<]+)</ForexSelling>[\\s\\S]*?</Currency>`,
                    'i'
                );
                
                const match = xmlData.match(currencyPattern);
                
                if (!match || !match[1]) {
                    throw new Error(`Currency ${currency} not found in XML`);
                }

                const rate = parseFloat(match[1]);
                
                if (isNaN(rate) || rate <= 0) {
                    throw new Error(`Invalid rate for ${currency}: ${match[1]}`);
                }

                console.log(`${currency} kuru: ${rate.toFixed(4)} TRY`);

                const macroData = {
                    country: 'TR',
                    indicator: `Exchange Rate ${currency}/TRY`,
                    value: rate,
                    unit: 'TRY',
                    date: formattedDate,
                    source: 'TCMB',
                    metadata: {
                        currency_code: currency,
                        bulletin_date: bulletinDate,
                        data_type: 'exchange_rate'
                    }
                };

                console.log(`Macro data:`, JSON.stringify(macroData, null, 2));

                // First, check if record exists
                const checkUrl = `${supabaseUrl}/rest/v1/macro_data?indicator=eq.Exchange Rate ${currency}/TRY&date=eq.${formattedDate}&select=id`;
                console.log(`Check URL: ${checkUrl}`);
                
                const checkResponse = await fetch(checkUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    }
                });

                console.log(`Check response status: ${checkResponse.status}`);
                const existingRecords = await checkResponse.json();
                console.log(`Existing records:`, JSON.stringify(existingRecords));

                let upsertResponse;
                let operationType = '';

                if (existingRecords && existingRecords.length > 0) {
                    // Record exists - UPDATE
                    operationType = 'UPDATE';
                    const updateUrl = `${supabaseUrl}/rest/v1/macro_data?indicator=eq.Exchange Rate ${currency}/TRY&date=eq.${formattedDate}`;
                    console.log(`UPDATE URL: ${updateUrl}`);
                    
                    upsertResponse = await fetch(updateUrl, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify(macroData)
                    });
                } else {
                    // Record doesn't exist - INSERT
                    operationType = 'INSERT';
                    const insertUrl = `${supabaseUrl}/rest/v1/macro_data`;
                    console.log(`INSERT URL: ${insertUrl}`);
                    
                    upsertResponse = await fetch(insertUrl, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify(macroData)
                    });
                }

                console.log(`${operationType} response status: ${upsertResponse.status}`);
                console.log(`${operationType} response headers:`, JSON.stringify(Object.fromEntries(upsertResponse.headers.entries())));
                
                const responseText = await upsertResponse.text();
                console.log(`${operationType} response body:`, responseText);

                if (!upsertResponse.ok) {
                    throw new Error(`Database ${operationType} failed (${upsertResponse.status}): ${responseText}`);
                }

                results.success++;
                results.data.push({ currency, rate: rate.toFixed(4), operation: operationType });
                results.debugInfo.push({
                    currency,
                    operation: operationType,
                    status: upsertResponse.status,
                    response: responseText.substring(0, 200)
                });
                
                console.log(`✓ ${currency}: ${rate.toFixed(4)} TRY (${operationType} successful)`);

            } catch (error) {
                results.failed++;
                const errorMsg = `${currency}: ${error.message}`;
                results.errors.push(errorMsg);
                console.error(`✗ ${errorMsg}`);
            }
        }

        if (results.success === 0) {
            throw new Error('All currency updates failed');
        }

        console.log(`\n=== İşlem tamamlandı ===`);
        console.log(`Başarılı: ${results.success}, Başarısız: ${results.failed}`);

        return new Response(JSON.stringify({
            data: {
                total: currencies.length,
                success: results.success,
                failed: results.failed,
                date: formattedDate,
                rates: results.data,
                errors: results.errors,
                debugInfo: results.debugInfo,
                message: `${results.success} TCMB döviz kuru başarıyla güncellendi`
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('TCMB Data Fetch error:', error);
        console.error('Error stack:', error.stack);

        const errorResponse = {
            error: {
                code: 'TCMB_FETCH_FAILED',
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
