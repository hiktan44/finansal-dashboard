// Alert Processor - Akıllı alarm işleme (adaptive thresholds, anomaly detection)
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
        const { symbol, userId } = await req.json();

        if (!symbol) {
            throw new Error('symbol gerekli');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase yapılandırması eksik');
        }

        // Yahoo Finance'den geçmiş veri al (30 gün)
        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=30d`;
        const yahooResponse = await fetch(yahooUrl);

        if (!yahooResponse.ok) {
            throw new Error('Yahoo Finance verisi alınamadı');
        }

        const yahooData = await yahooResponse.json();
        const result = yahooData?.chart?.result?.[0];

        if (!result) {
            throw new Error('Veri formatı hatalı');
        }

        const timestamps = result.timestamp || [];
        const closes = result.indicators?.quote?.[0]?.close || [];
        const volumes = result.indicators?.quote?.[0]?.volume || [];
        const currentPrice = result.meta?.regularMarketPrice;

        // 1. Volatilite Hesaplama
        const calculateVolatility = (prices: number[]) => {
            if (prices.length < 2) return 0;
            const returns = [];
            for (let i = 1; i < prices.length; i++) {
                returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
            }
            const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
            const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
            return Math.sqrt(variance) * 100; // Yüzdelik volatilite
        };

        const volatility = calculateVolatility(closes.filter((c: number) => c !== null));

        // 2. Adaptive Threshold Hesaplama
        const adaptiveThreshold = {
            low: currentPrice * (1 - volatility / 100 * 0.5),
            high: currentPrice * (1 + volatility / 100 * 0.5),
            volatility: volatility
        };

        // 3. Anomaly Detection (Z-score)
        const calculateZScore = (value: number, data: number[]) => {
            const mean = data.reduce((sum, v) => sum + v, 0) / data.length;
            const variance = data.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / data.length;
            const stdDev = Math.sqrt(variance);
            return stdDev > 0 ? (value - mean) / stdDev : 0;
        };

        const priceZScore = calculateZScore(currentPrice, closes.filter((c: number) => c !== null));
        const volumeZScore = volumes.length > 0 
            ? calculateZScore(volumes[volumes.length - 1], volumes.filter((v: number) => v !== null))
            : 0;

        const anomalies = [];
        
        if (Math.abs(priceZScore) > 2) {
            anomalies.push({
                type: 'price_anomaly',
                severity: Math.abs(priceZScore) > 3 ? 'high' : 'medium',
                message: `Fiyat normalin ${priceZScore > 0 ? 'üzerinde' : 'altında'} (Z-score: ${priceZScore.toFixed(2)})`,
                zScore: priceZScore
            });
        }

        if (Math.abs(volumeZScore) > 2) {
            anomalies.push({
                type: 'volume_anomaly',
                severity: Math.abs(volumeZScore) > 3 ? 'high' : 'medium',
                message: `İşlem hacmi normalin ${volumeZScore > 0 ? 'üzerinde' : 'altında'} (Z-score: ${volumeZScore.toFixed(2)})`,
                zScore: volumeZScore
            });
        }

        // 4. Trend Analizi (Moving Average)
        const calculateMA = (prices: number[], period: number) => {
            if (prices.length < period) return null;
            const recent = prices.slice(-period);
            return recent.reduce((sum, p) => sum + p, 0) / period;
        };

        const ma10 = calculateMA(closes.filter((c: number) => c !== null), 10);
        const ma20 = calculateMA(closes.filter((c: number) => c !== null), 20);

        let trend = 'neutral';
        if (ma10 && ma20) {
            if (ma10 > ma20 * 1.02) trend = 'bullish';
            else if (ma10 < ma20 * 0.98) trend = 'bearish';
        }

        // 5. Support/Resistance Seviyeleri
        const findSupportResistance = (prices: number[]) => {
            const sorted = [...prices].sort((a, b) => a - b);
            const support = sorted[Math.floor(sorted.length * 0.25)]; // 25. percentile
            const resistance = sorted[Math.floor(sorted.length * 0.75)]; // 75. percentile
            return { support, resistance };
        };

        const levels = findSupportResistance(closes.filter((c: number) => c !== null));

        // 6. Akıllı Alarm Önerileri
        const smartAlertSuggestions = [];

        if (volatility > 5) {
            smartAlertSuggestions.push({
                type: 'volatility_alert',
                message: `Yüksek volatilite tespit edildi (%${volatility.toFixed(2)})`,
                suggestedThreshold: volatility * 1.5,
                reason: 'Fiyat dalgalanmaları arttı, alarm eşiğinizi yükseltmeyi düşünün'
            });
        }

        if (trend === 'bullish') {
            smartAlertSuggestions.push({
                type: 'price_target',
                message: 'Yükseliş trendi tespit edildi',
                suggestedThreshold: levels.resistance,
                reason: `Direnç seviyesi $${levels.resistance.toFixed(2)} olarak belirlendi`
            });
        } else if (trend === 'bearish') {
            smartAlertSuggestions.push({
                type: 'price_target',
                message: 'Düşüş trendi tespit edildi',
                suggestedThreshold: levels.support,
                reason: `Destek seviyesi $${levels.support.toFixed(2)} olarak belirlendi`
            });
        }

        // Sonuçları kaydet veya kullanıcıya gönder
        const analysisResult = {
            symbol,
            currentPrice,
            volatility,
            adaptiveThreshold,
            anomalies,
            trend,
            supportResistance: levels,
            smartAlertSuggestions,
            technicalIndicators: {
                ma10,
                ma20,
                priceZScore,
                volumeZScore
            },
            analyzedAt: new Date().toISOString()
        };

        return new Response(JSON.stringify({
            data: analysisResult
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Alert processor error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'ALERT_PROCESSOR_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
