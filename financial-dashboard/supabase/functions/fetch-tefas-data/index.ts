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

    // TEFAS fon listesi - Sample data ile başlayalım
    const tefasFunds = [
      {
        fund_code: 'AAL',
        fund_name: 'Albaraka Türk Altın Katılım Fonu',
        fund_type: 'ALTIN',
        price: 23.45,
        performance_1m: 2.3,
        performance_3m: 5.8,
        performance_6m: 12.4,
        performance_1y: 18.7,
        risk_score: 3.2,
        expense_ratio: 1.25,
        volume: 1250000,
        category: 'Altın Fonları'
      },
      {
        fund_code: 'AEF',
        fund_name: 'Ak Portföy Esnek Fon',
        fund_type: 'ESNEK',
        price: 1.789,
        performance_1m: 1.2,
        performance_3m: 4.1,
        performance_6m: 8.9,
        performance_1y: 15.3,
        risk_score: 2.8,
        expense_ratio: 2.15,
        volume: 890000,
        category: 'Esnek Fonlar'
      },
      {
        fund_code: 'TGF',
        fund_name: 'Tacirler Portföy Gelişen Teknoloji Fonu',
        fund_type: 'HISSE',
        price: 3.456,
        performance_1m: 5.7,
        performance_3m: 12.3,
        performance_6m: 22.1,
        performance_1y: 35.8,
        risk_score: 4.1,
        expense_ratio: 2.85,
        volume: 2100000,
        category: 'Teknoloji Fonları'
      },
      {
        fund_code: 'IBF',
        fund_name: 'İş Portföy Birinci Fon',
        fund_type: 'HISSE',
        price: 0.234,
        performance_1m: 3.1,
        performance_3m: 7.8,
        performance_6m: 14.2,
        performance_1y: 28.6,
        risk_score: 3.7,
        expense_ratio: 2.45,
        volume: 1780000,
        category: 'Hisse Senedi Fonları'
      },
      {
        fund_code: 'YPK',
        fund_name: 'Yapı Kredi Portföy Kira Sert. Fonu',
        fund_type: 'GYO',
        price: 1.125,
        performance_1m: 0.8,
        performance_3m: 3.2,
        performance_6m: 6.7,
        performance_1y: 11.4,
        risk_score: 2.3,
        expense_ratio: 1.95,
        volume: 650000,
        category: 'Gayrimenkul Fonları'
      },
      {
        fund_code: 'ZTB',
        fund_name: 'Ziraat Portföy Tahvil ve Bono Fonu',
        fund_type: 'TAHVIL',
        price: 2.891,
        performance_1m: 1.5,
        performance_3m: 4.8,
        performance_6m: 9.3,
        performance_1y: 16.2,
        risk_score: 1.8,
        expense_ratio: 1.15,
        volume: 3200000,
        category: 'Tahvil Fonları'
      },
      {
        fund_code: 'KPF',
        fund_name: 'Kapital Portföy Para Piyasası Fonu',
        fund_type: 'PARA',
        price: 1.067,
        performance_1m: 0.9,
        performance_3m: 2.7,
        performance_6m: 5.4,
        performance_1y: 12.1,
        risk_score: 1.2,
        expense_ratio: 0.85,
        volume: 4500000,
        category: 'Para Piyasası Fonları'
      },
      {
        fund_code: 'GAR',
        fund_name: 'Garanti Portföy Agresif Fon',
        fund_type: 'KARMA',
        price: 4.567,
        performance_1m: 4.2,
        performance_3m: 9.1,
        performance_6m: 17.8,
        performance_1y: 31.4,
        risk_score: 3.9,
        expense_ratio: 2.65,
        volume: 1950000,
        category: 'Karma Fonlar'
      }
    ]

    // Fonları veritabanına kaydet (UPSERT)
    const { data, error } = await supabase
      .from('tefas_funds')
      .upsert(tefasFunds, {
        onConflict: 'fund_code',
        ignoreDuplicates: false
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // İstatistikler hesapla
    const stats = {
      total_funds: tefasFunds.length,
      best_performer_1y: tefasFunds.reduce((best, fund) => 
        fund.performance_1y > best.performance_1y ? fund : best
      ),
      avg_performance_1y: (tefasFunds.reduce((sum, fund) => 
        sum + fund.performance_1y, 0) / tefasFunds.length).toFixed(2),
      low_risk_funds: tefasFunds.filter(fund => fund.risk_score < 2).length,
      high_yield_funds: tefasFunds.filter(fund => fund.performance_1y > 25).length
    }

    return new Response(JSON.stringify({
      success: true,
      message: `${tefasFunds.length} TEFAS fonu başarıyla güncellendi`,
      data: data,
      stats: stats,
      last_updated: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('TEFAS fetch error:', error)
    return new Response(JSON.stringify({ 
      error: 'TEFAS veri çekme hatası',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})