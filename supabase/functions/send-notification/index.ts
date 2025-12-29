// Send Notification - Push notification gönder
Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { userId, title, message, alertId, data } = await req.json();

        if (!userId || !title || !message) {
            throw new Error('userId, title ve message gerekli');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase yapılandırması eksik');
        }

        // Kullanıcının push subscription'larını al
        const subscriptionsResponse = await fetch(
            `${supabaseUrl}/rest/v1/push_subscriptions?user_id=eq.${userId}&is_active=eq.true`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        if (!subscriptionsResponse.ok) {
            throw new Error('Subscription bilgileri alınamadı');
        }

        const subscriptions = await subscriptionsResponse.json();
        const sentNotifications = [];

        // Her subscription için push notification gönder
        for (const subscription of subscriptions) {
            try {
                const pushPayload = {
                    notification: {
                        title: title,
                        body: message,
                        icon: '/favicon.ico',
                        badge: '/badge.png',
                        tag: alertId ? `alert-${alertId}` : undefined,
                        requireInteraction: true,
                        actions: [
                            { action: 'view', title: 'Görüntüle' },
                            { action: 'dismiss', title: 'Kapat' }
                        ],
                        data: {
                            alertId,
                            timestamp: new Date().toISOString(),
                            ...data
                        }
                    }
                };

                // Web Push API'ye gönder (VAPID keys gerekli - production'da implement edilecek)
                // Şimdilik sadece log kayıt
                const notificationLog = {
                    user_id: userId,
                    notification_type: 'alert',
                    channel: 'push',
                    title: title,
                    message: message,
                    status: 'sent',
                    metadata: {
                        alertId,
                        subscriptionId: subscription.id,
                        ...data
                    },
                    sent_at: new Date().toISOString()
                };

                const logResponse = await fetch(`${supabaseUrl}/rest/v1/notification_logs`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(notificationLog)
                });

                if (logResponse.ok) {
                    sentNotifications.push({
                        subscriptionId: subscription.id,
                        status: 'sent'
                    });
                }

            } catch (error) {
                console.error('Push notification gönderme hatası:', error);
                
                // Hata logla
                await fetch(`${supabaseUrl}/rest/v1/notification_logs`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        notification_type: 'alert',
                        channel: 'push',
                        title: title,
                        message: message,
                        status: 'failed',
                        error_message: error.message,
                        sent_at: new Date().toISOString()
                    })
                });

                continue;
            }
        }

        return new Response(JSON.stringify({
            data: {
                sent: sentNotifications.length,
                total: subscriptions.length,
                notifications: sentNotifications
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Send notification error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'SEND_NOTIFICATION_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
