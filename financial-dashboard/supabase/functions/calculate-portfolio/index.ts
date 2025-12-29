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

    const { portfolio_id, user_id } = await req.json()

    // Kullanıcı doğrulaması
    if (!portfolio_id && !user_id) {
      return new Response(JSON.stringify({ 
        error: 'Portfolio ID veya User ID gerekli' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Portföy itemlerini getir
    let portfolioItemsQuery = supabase
      .from('portfolio_items')
      .select('*')

    if (portfolio_id) {
      portfolioItemsQuery = portfolioItemsQuery.eq('portfolio_id', portfolio_id)
    }

    const { data: portfolioItems, error: itemsError } = await portfolioItemsQuery

    if (itemsError) {
      throw new Error(`Portföy items hatası: ${itemsError.message}`)
    }

    // Mock güncel fiyatları (gerçek uygulamada Yahoo Finance/Alpha Vantage kullanılacak)
    const mockPrices: { [key: string]: number } = {
      'THYAO': 85.50,
      'GARAN': 112.75,
      'AKBNK': 58.90,
      'EREGL': 42.15,
      'BIST30': 1847.23,
      'AAL': 24.12,    // TEFAS altın fonu
      'TGF': 3.678,    // Teknoloji fonu
      'IBF': 0.245,    // Hisse fonu
      'BTCUSD': 67850,
      'ETHUSD': 3420
    }

    // Her item için hesaplama yap
    const updatedItems = await Promise.all(
      portfolioItems.map(async (item: any) => {
        const currentPrice = mockPrices[item.symbol] || item.avg_purchase_price
        const currentValue = currentPrice * item.quantity
        const totalInvestment = item.avg_purchase_price * item.quantity + (item.commission || 0)
        const profitLoss = currentValue - totalInvestment
        const profitLossPercent = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0

        const updatedItem = {
          ...item,
          current_price: currentPrice,
          current_value: currentValue,
          total_investment: totalInvestment,
          profit_loss: profitLoss,
          profit_loss_percent: profitLossPercent,
          updated_at: new Date().toISOString()
        }

        // Database'i güncelle
        const { error: updateError } = await supabase
          .from('portfolio_items')
          .update({
            current_price: currentPrice,
            current_value: currentValue,
            total_investment: totalInvestment,
            profit_loss: profitLoss,
            profit_loss_percent: profitLossPercent,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id)

        if (updateError) {
          console.error(`Item ${item.id} güncelleme hatası:`, updateError)
        }

        return updatedItem
      })
    )

    // Portfolio toplam hesaplamaları
    const totalInvestment = updatedItems.reduce((sum, item) => sum + item.total_investment, 0)
    const totalCurrentValue = updatedItems.reduce((sum, item) => sum + item.current_value, 0)
    const totalProfitLoss = totalCurrentValue - totalInvestment
    const totalProfitLossPercent = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0

    // Portfolio ana tablosunu güncelle (eğer portfolio_id varsa)
    if (portfolio_id) {
      const { error: portfolioUpdateError } = await supabase
        .from('user_portfolios')
        .update({
          total_investment: totalInvestment,
          current_value: totalCurrentValue,
          profit_loss: totalProfitLoss,
          profit_loss_percent: totalProfitLossPercent,
          updated_at: new Date().toISOString()
        })
        .eq('id', portfolio_id)

      if (portfolioUpdateError) {
        console.error('Portfolio güncelleme hatası:', portfolioUpdateError)
      }
    }

    // Risk ve analiz metrikleri hesapla
    const riskMetrics = {
      diversification_score: calculateDiversificationScore(updatedItems),
      volatility_estimate: calculateVolatilityEstimate(updatedItems),
      sector_exposure: calculateSectorExposure(updatedItems),
      top_positions: getTopPositions(updatedItems, 3)
    }

    return new Response(JSON.stringify({
      success: true,
      portfolio_summary: {
        total_investment: totalInvestment,
        current_value: totalCurrentValue,
        profit_loss: totalProfitLoss,
        profit_loss_percent: totalProfitLossPercent,
        total_positions: updatedItems.length
      },
      risk_metrics: riskMetrics,
      items: updatedItems,
      last_updated: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Portfolio calculation error:', error)
    return new Response(JSON.stringify({ 
      error: 'Portföy hesaplama hatası',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// Yardımcı fonksiyonlar
function calculateDiversificationScore(items: any[]): number {
  const uniqueSymbols = new Set(items.map(item => item.symbol))
  const uniqueAssetTypes = new Set(items.map(item => item.asset_type))
  
  // Basit diversification skoru: unique sembol sayısı / toplam pozisyon sayısı
  const symbolScore = uniqueSymbols.size / Math.max(items.length, 1)
  const typeScore = uniqueAssetTypes.size / 5 // 5 farklı asset tipi varsayılıyor
  
  return Math.min(((symbolScore + typeScore) / 2) * 100, 100)
}

function calculateVolatilityEstimate(items: any[]): number {
  // Mock volatilite hesaplaması (gerçek uygulamada historical data gerekli)
  const avgVolatility = items.reduce((sum, item) => {
    const volatility = item.asset_type === 'CRYPTO' ? 8.5 : 
                     item.asset_type === 'STOCK' ? 3.2 :
                     item.asset_type === 'FUND' ? 2.1 : 1.5
    return sum + volatility
  }, 0)
  
  return items.length > 0 ? avgVolatility / items.length : 0
}

function calculateSectorExposure(items: any[]): { [key: string]: number } {
  const sectorMap: { [key: string]: string } = {
    'THYAO': 'Havacılık',
    'GARAN': 'Bankacılık',
    'AKBNK': 'Bankacılık', 
    'EREGL': 'Demir-Çelik',
    'BIST30': 'Endeks',
    'AAL': 'Altın',
    'BTCUSD': 'Kripto',
    'ETHUSD': 'Kripto'
  }

  const exposure: { [key: string]: number } = {}
  const totalValue = items.reduce((sum, item) => sum + item.current_value, 0)

  items.forEach(item => {
    const sector = sectorMap[item.symbol] || 'Diğer'
    exposure[sector] = (exposure[sector] || 0) + (item.current_value / totalValue) * 100
  })

  return exposure
}

function getTopPositions(items: any[], count: number) {
  return items
    .sort((a, b) => b.current_value - a.current_value)
    .slice(0, count)
    .map(item => ({
      symbol: item.symbol,
      asset_name: item.asset_name,
      current_value: item.current_value,
      profit_loss_percent: item.profit_loss_percent
    }))
}