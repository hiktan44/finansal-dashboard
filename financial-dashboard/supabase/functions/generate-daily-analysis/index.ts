import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const today = new Date().toISOString().split('T')[0]
    
    // Bugünün piyasa verilerini analiz et
    const marketAnalysis = await generateDailyAnalysis()
    
    // Günlük analizi veritabanına kaydet
    const { data, error } = await supabase
      .from('daily_analysis')
      .upsert({
        analysis_date: today,
        market_summary: marketAnalysis.summary,
        technical_analysis: marketAnalysis.technical,
        sector_highlights: marketAnalysis.sectors,
        top_movers: marketAnalysis.movers,
        market_forecast: marketAnalysis.forecast,
        sentiment_score: marketAnalysis.sentiment,
        volatility_index: marketAnalysis.volatility,
        is_published: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'analysis_date',
        ignoreDuplicates: false
      })
      .select()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return new Response(JSON.stringify({
      success: true,
      message: `${today} tarihli günlük analiz oluşturuldu`,
      analysis: marketAnalysis,
      data: data,
      created_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Daily analysis error:', error)
    return new Response(JSON.stringify({ 
      error: 'Günlük analiz oluşturma hatası',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function generateDailyAnalysis() {
  const today = new Date()
  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
  const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                     'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
  
  const dayName = dayNames[today.getDay()]
  const monthName = monthNames[today.getMonth()]
  const dateStr = `${today.getDate()} ${monthName} ${today.getFullYear()}, ${dayName}`

  // Mock piyasa verileri (gerçek uygulamada API'den gelecek)
  const marketData = {
    bist100: { value: 9847.23, change: 1.2 },
    usdtry: { value: 34.15, change: 0.3 },
    gold: { value: 4137.9, change: 0.4 },
    bonds: { value: 28.7, change: -0.2 }
  }

  // Günlük piyasa özeti
  const marketSummary = `${dateStr} tarihinde Türkiye piyasaları karışık seyir izledi. ` +
    `BIST 100 endeksi ${marketData.bist100.value} seviyesinde ${marketData.bist100.change > 0 ? 'yükselişle' : 'düşüşle'} kapandı. ` +
    `Dolar/TL paritesi ${marketData.usdtry.value} seviyesinde seyrediyor. ` +
    `Altın fiyatları ${marketData.gold.value} dolar seviyesinde ${marketData.gold.change > 0 ? 'pozitif' : 'negatif'} seyir gösteriyor.`

  // Teknik analiz
  const technicalAnalysis = 
    `Teknik göstergeler incelendiğinde, BIST 100 endeksi 9800-9900 aralığında yatay seyir izlemekte. ` +
    `RSI 14 göstergesi 52.3 seviyesinde nötr bölgede konumlanırken, ` +
    `MACD histogramı pozitif bölgede ancak momentum zayıf. ` +
    `9850 direnci aşılması durumunda 10000 hedefi önem kazanabilir.`

  // Sektör vurguları
  const sectorHighlights = 
    `Günün öne çıkan sektörleri arasında teknoloji ve finans yer aldı. ` +
    `Bankacılık endeksi %0.8 yükselirken, teknoloji şirketleri %1.2 oranında değer kazandı. ` +
    `Enerji sektörü ise küresel petrol fiyatlarındaki dalgalanma nedeniyle %0.3 geriledi.`

  // En çok hareket eden hisseler
  const topMovers = {
    gainers: [
      { symbol: 'THYAO', change: 3.2, reason: 'Uçak siparişi haberi' },
      { symbol: 'GARAN', change: 2.1, reason: 'Güçlü çeyrek sonuçları' },
      { symbol: 'EREGL', change: 1.8, reason: 'Çelik fiyatları' }
    ],
    losers: [
      { symbol: 'TCELL', change: -2.5, reason: 'Düzenleyici baskılar' },
      { symbol: 'AKBNK', change: -1.3, reason: 'Kar realizasyonu' }
    ]
  }

  // Piyasa öngörüsü
  const marketForecast = 
    `Yarın Federal Reserve toplantı tutanaklarının açıklanması ve yerel makro verilerin takip edileceği bir gün olacak. ` +
    `Teknik açıdan 9850 direnci test edilebilir. Hacim artışı eşliğinde bu seviyenin aşılması önemli. ` +
    `Küresel piyasalardaki risk iştahı ve TL'deki gelişmeler takip edilmesi gereken ana faktörler.`

  // Sentiment ve volatilite skorları
  const sentimentScore = 6.2 // 1-10 arası (10 en pozitif)
  const volatilityIndex = 14.7 // Volatilite endeksi

  return {
    summary: marketSummary,
    technical: technicalAnalysis,
    sectors: sectorHighlights,
    movers: topMovers,
    forecast: marketForecast,
    sentiment: sentimentScore,
    volatility: volatilityIndex
  }
}