// Check Alerts - Aktif alarmları kontrol et ve tetikle
Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase yapılandırması eksik');
        }

        // Tüm aktif alarmları çek
        const alertsResponse = await fetch(`${supabaseUrl}/rest/v1/user_alerts?is_active=eq.true&select=*`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!alertsResponse.ok) {
            throw new Error('Alarmlar alınamadı');
        }

        const alerts = await alertsResponse.json();
        const triggeredAlerts = [];

        // Her alarm için kontrol yap
        for (const alert of alerts) {
            try {
                // Yahoo Finance'den güncel fiyat al
                const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${alert.symbol}?interval=1d&range=5d`;
                const yahooResponse = await fetch(yahooUrl);
                
                if (!yahooResponse.ok) continue;

                const yahooData = await yahooResponse.json();
                const result = yahooData?.chart?.result?.[0];
                
                if (!result) continue;

                const currentPrice = result.meta?.regularMarketPrice;
                const previousClose = result.meta?.chartPreviousClose;
                const volume = result.indicators?.quote?.[0]?.volume?.slice(-1)[0];

                if (!currentPrice) continue;

                let shouldTrigger = false;
                let triggerValue = currentPrice;

                // Alarm koşulunu kontrol et
                switch (alert.alert_type) {
                    case 'price_target':
                        if (alert.condition === 'above' && currentPrice >= alert.threshold) {
                            shouldTrigger = true;
                        } else if (alert.condition === 'below' && currentPrice <= alert.threshold) {
                            shouldTrigger = true;
                        }
                        break;

                    case 'percentage_change':
                        const change = ((currentPrice - previousClose) / previousClose) * 100;
                        if (alert.condition === 'above' && change >= alert.threshold) {
                            shouldTrigger = true;
                            triggerValue = change;
                        } else if (alert.condition === 'below' && change <= alert.threshold) {
                            shouldTrigger = true;
                            triggerValue = change;
                        }
                        break;

                    case 'volume_spike':
                        const avgVolume = result.indicators?.quote?.[0]?.volume
                            ?.slice(-5)
                            ?.reduce((sum: number, v: number) => sum + v, 0) / 5;
                        
                        if (avgVolume && volume > avgVolume * (alert.threshold / 100)) {
                            shouldTrigger = true;
                            triggerValue = volume;
                        }
                        break;

                    case 'volatility':
                        // Basit volatilite hesaplama (son 5 günün standart sapması)
                        const prices = result.indicators?.quote?.[0]?.close?.slice(-5) || [];
                        if (prices.length >= 5) {
                            const avg = prices.reduce((sum: number, p: number) => sum + p, 0) / prices.length;
                            const variance = prices.reduce((sum: number, p: number) => sum + Math.pow(p - avg, 2), 0) / prices.length;
                            const volatility = Math.sqrt(variance) / avg * 100;
                            
                            if (volatility >= alert.threshold) {
                                shouldTrigger = true;
                                triggerValue = volatility;
                            }
                        }
                        break;
                }

                // Rate limiting kontrolü (son 5 dakikada tetiklendi mi?)
                const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
                const recentTriggerResponse = await fetch(
                    `${supabaseUrl}/rest/v1/alert_triggers?alert_id=eq.${alert.id}&triggered_at=gte.${fiveMinutesAgo}&order=triggered_at.desc&limit=1`,
                    {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey
                        }
                    }
                );

                const recentTriggers = await recentTriggerResponse.json();
                
                if (shouldTrigger && recentTriggers.length === 0) {
                    // Alarm tetiklemesini kaydet
                    const triggerData = {
                        alert_id: alert.id,
                        user_id: alert.user_id,
                        symbol: alert.symbol,
                        trigger_value: triggerValue,
                        current_price: currentPrice,
                        triggered_at: new Date().toISOString()
                    };

                    const triggerResponse = await fetch(`${supabaseUrl}/rest/v1/alert_triggers`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify(triggerData)
                    });

                    if (triggerResponse.ok) {
                        triggeredAlerts.push({
                            alert,
                            trigger: triggerData
                        });

                        // Bildirim gönder
                        const notificationMethods = alert.notification_method || ['push'];
                        
                        for (const method of notificationMethods) {
                            if (method === 'push') {
                                await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${serviceRoleKey}`,
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        userId: alert.user_id,
                                        title: `${alert.symbol} Alarm Tetiklendi`,
                                        message: `${alert.alert_type === 'price_target' ? 'Fiyat: $' + currentPrice.toFixed(2) : 'Değer: ' + triggerValue.toFixed(2)}`,
                                        alertId: alert.id
                                    })
                                });
                            } else if (method === 'email') {
                                await fetch(`${supabaseUrl}/functions/v1/send-email`, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${serviceRoleKey}`,
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        userId: alert.user_id,
                                        subject: `${alert.symbol} Alarm Tetiklendi`,
                                        body: `Alarm koşulunuz karşılandı: ${alert.alert_type}`,
                                        alertData: triggerData
                                    })
                                });
                            }
                        }
                    }
                }

            } catch (error) {
                console.error(`Alarm kontrolü hatası (${alert.symbol}):`, error);
                continue;
            }
        }

        return new Response(JSON.stringify({
            data: {
                checked: alerts.length,
                triggered: triggeredAlerts.length,
                alerts: triggeredAlerts
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Check alerts error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'CHECK_ALERTS_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
