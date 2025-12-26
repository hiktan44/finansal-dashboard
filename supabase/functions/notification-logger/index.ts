// Notification Logger - Bildirim log kayıtları ve raporlama
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

        if (req.method === 'GET') {
            // Bildirim istatistiklerini al
            const url = new URL(req.url);
            const userId = url.searchParams.get('userId');
            const days = parseInt(url.searchParams.get('days') || '7');

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            let query = `${supabaseUrl}/rest/v1/notification_logs?sent_at=gte.${startDate.toISOString()}&order=sent_at.desc`;
            
            if (userId) {
                query += `&user_id=eq.${userId}`;
            }

            const logsResponse = await fetch(query, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });

            if (!logsResponse.ok) {
                throw new Error('Log verileri alınamadı');
            }

            const logs = await logsResponse.json();

            // İstatistikleri hesapla
            const stats = {
                total: logs.length,
                byChannel: {
                    push: logs.filter((l: any) => l.channel === 'push').length,
                    email: logs.filter((l: any) => l.channel === 'email').length,
                    sms: logs.filter((l: any) => l.channel === 'sms').length
                },
                byStatus: {
                    sent: logs.filter((l: any) => l.status === 'sent').length,
                    failed: logs.filter((l: any) => l.status === 'failed').length,
                    pending: logs.filter((l: any) => l.status === 'pending').length
                },
                byType: {
                    alert: logs.filter((l: any) => l.notification_type === 'alert').length,
                    report: logs.filter((l: any) => l.notification_type === 'report').length,
                    news: logs.filter((l: any) => l.notification_type === 'news').length,
                    system: logs.filter((l: any) => l.notification_type === 'system').length
                },
                successRate: logs.length > 0 
                    ? (logs.filter((l: any) => l.status === 'sent').length / logs.length * 100).toFixed(2)
                    : 0,
                recentLogs: logs.slice(0, 10),
                period: {
                    start: startDate.toISOString(),
                    end: new Date().toISOString(),
                    days
                }
            };

            // Günlük dağılım
            const dailyDistribution: { [key: string]: number } = {};
            logs.forEach((log: any) => {
                const date = new Date(log.sent_at).toISOString().split('T')[0];
                dailyDistribution[date] = (dailyDistribution[date] || 0) + 1;
            });

            stats['dailyDistribution'] = dailyDistribution;

            return new Response(JSON.stringify({
                data: stats
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (req.method === 'POST') {
            // Toplu log kayıt işlemi
            const { logs } = await req.json();

            if (!Array.isArray(logs) || logs.length === 0) {
                throw new Error('logs array gerekli');
            }

            // Batch insert
            const insertResponse = await fetch(`${supabaseUrl}/rest/v1/notification_logs`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(logs.map((log: any) => ({
                    ...log,
                    sent_at: log.sent_at || new Date().toISOString()
                })))
            });

            if (!insertResponse.ok) {
                const errorText = await insertResponse.text();
                throw new Error(`Batch insert failed: ${errorText}`);
            }

            const insertedLogs = await insertResponse.json();

            return new Response(JSON.stringify({
                data: {
                    inserted: insertedLogs.length,
                    logs: insertedLogs
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
        console.error('Notification logger error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'NOTIFICATION_LOGGER_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
