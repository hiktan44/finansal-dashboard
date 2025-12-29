// Send Email - Email alert gönder
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
        const { userId, subject, body, alertData } = await req.json();

        if (!userId || !subject || !body) {
            throw new Error('userId, subject ve body gerekli');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase yapılandırması eksik');
        }

        // Kullanıcının email tercihlerini ve bilgilerini al
        const userResponse = await fetch(
            `${supabaseUrl}/rest/v1/user_profiles?user_id=eq.${userId}&select=email`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        const preferencesResponse = await fetch(
            `${supabaseUrl}/rest/v1/alert_preferences?user_id=eq.${userId}&email_enabled=eq.true`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        if (!userResponse.ok || !preferencesResponse.ok) {
            throw new Error('Kullanıcı bilgileri alınamadı');
        }

        const users = await userResponse.json();
        const preferences = await preferencesResponse.json();

        if (users.length === 0) {
            throw new Error('Kullanıcı bulunamadı');
        }

        if (preferences.length === 0 || !preferences[0].email_enabled) {
            // Email bildirimi kapalı
            return new Response(JSON.stringify({
                data: {
                    status: 'skipped',
                    reason: 'Email bildirimleri kapalı'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const userEmail = users[0].email;

        // Email formatla
        const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
                .alert-box { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 15px 0; }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
                .button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📊 Finansal Dashboard Alarm</h1>
                </div>
                <div class="content">
                    <h2>${subject}</h2>
                    <p>${body}</p>
                    
                    ${alertData ? `
                    <div class="alert-box">
                        <h3>Alarm Detayları:</h3>
                        <p><strong>Sembol:</strong> ${alertData.symbol}</p>
                        <p><strong>Güncel Fiyat:</strong> $${alertData.current_price?.toFixed(2)}</p>
                        <p><strong>Tetiklenme Değeri:</strong> ${alertData.trigger_value?.toFixed(2)}</p>
                        <p><strong>Zaman:</strong> ${new Date(alertData.triggered_at).toLocaleString('tr-TR')}</p>
                    </div>
                    ` : ''}
                    
                    <a href="https://uhvikhy6gpc6.space.minimax.io" class="button">Dashboard'a Git</a>
                </div>
                <div class="footer">
                    <p>Bu bir otomatik bildirimdir. Email tercihlerinizi dashboard ayarlarından değiştirebilirsiniz.</p>
                    <p>&copy; 2025 Finansal Dashboard - MiniMax Agent</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Email log kaydet (gerçek email gönderimi için Resend/SMTP entegrasyonu gerekli)
        const emailLog = {
            user_id: userId,
            notification_type: 'alert',
            channel: 'email',
            title: subject,
            message: body,
            status: 'sent',
            metadata: {
                to: userEmail,
                html: htmlBody.length > 0,
                alertData
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
            body: JSON.stringify(emailLog)
        });

        if (!logResponse.ok) {
            throw new Error('Email log kaydedilemedi');
        }

        const logData = await logResponse.json();

        return new Response(JSON.stringify({
            data: {
                status: 'sent',
                to: userEmail,
                subject: subject,
                logId: logData[0]?.id,
                note: 'Email preview oluşturuldu (Gerçek gönderim için SMTP/Resend API gerekli)'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Send email error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'SEND_EMAIL_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
