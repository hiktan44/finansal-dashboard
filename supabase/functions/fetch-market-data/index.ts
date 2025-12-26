Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { assetType, symbols } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceKey) {
      throw new Error('Supabase configuration missing');
    }

    let results = [];

    // Yahoo Finance için veri çekme fonksiyonu
    async function fetchYahooFinanceData(symbol: string) {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`Yahoo Finance error for ${symbol}:`, response.status);
          return null;
        }

        const data = await response.json();
        const quote = data?.chart?.result?.[0];
        
        if (!quote) return null;

        const meta = quote.meta;
        const currentPrice = meta.regularMarketPrice || 0;
        const previousClose = meta.previousClose || 0;
        const change = currentPrice - previousClose;
        const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

        return {
          symbol,
          price: currentPrice,
          previous_close: previousClose,
          change_percent: changePercent,
          volume: meta.regularMarketVolume || 0,
          market_cap: meta.marketCap || 0,
          currency: meta.currency || 'USD',
          last_updated: new Date().toISOString()
        };
      } catch (error) {
        console.error(`Error fetching Yahoo Finance data for ${symbol}:`, error);
        return null;
      }
    }

    // TCMB Döviz Kurları
    async function fetchTCMBRates() {
      try {
        // today.xml kullan (en güncel veriyi garanti eder)
        const url = 'https://www.tcmb.gov.tr/kurlar/today.xml';
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error('TCMB API error:', response.status);
          return [];
        }

        const xmlText = await response.text();
        const currencies = [];

        // USD
        const usdMatch = xmlText.match(/<Currency.*?CurrencyCode="USD".*?>(.*?)<\/Currency>/s);
        if (usdMatch) {
          const forexSellingMatch = usdMatch[1].match(/<ForexSelling>(.*?)<\/ForexSelling>/);
          if (forexSellingMatch) {
            currencies.push({
              symbol: 'USD/TRY',
              name: 'Amerikan Doları',
              price: parseFloat(forexSellingMatch[1]),
              asset_type: 'currency',
              exchange: 'TCMB',
              currency: 'TRY'
            });
          }
        }

        // EUR
        const eurMatch = xmlText.match(/<Currency.*?CurrencyCode="EUR".*?>(.*?)<\/Currency>/s);
        if (eurMatch) {
          const forexSellingMatch = eurMatch[1].match(/<ForexSelling>(.*?)<\/ForexSelling>/);
          if (forexSellingMatch) {
            currencies.push({
              symbol: 'EUR/TRY',
              name: 'Euro',
              price: parseFloat(forexSellingMatch[1]),
              asset_type: 'currency',
              exchange: 'TCMB',
              currency: 'TRY'
            });
          }
        }

        // GBP
        const gbpMatch = xmlText.match(/<Currency.*?CurrencyCode="GBP".*?>(.*?)<\/Currency>/s);
        if (gbpMatch) {
          const forexSellingMatch = gbpMatch[1].match(/<ForexSelling>(.*?)<\/ForexSelling>/);
          if (forexSellingMatch) {
            currencies.push({
              symbol: 'GBP/TRY',
              name: 'İngiliz Sterlini',
              price: parseFloat(forexSellingMatch[1]),
              asset_type: 'currency',
              exchange: 'TCMB',
              currency: 'TRY'
            });
          }
        }

        return currencies;
      } catch (error) {
        console.error('Error fetching TCMB data:', error);
        return [];
      }
    }

    // Varlık türüne göre işlem
    if (assetType === 'bist') {
      // BIST hisseleri için Yahoo Finance kullan
      const bistSymbols = symbols || ['THYAO.IS', 'GARAN.IS', 'AKBNK.IS', 'EREGL.IS', 'TCELL.IS'];
      
      for (const symbol of bistSymbols) {
        const data = await fetchYahooFinanceData(symbol);
        if (data) {
          data.asset_type = 'bist';
          data.exchange = 'BIST';
          data.name = symbol.replace('.IS', '');
          results.push(data);
        }
      }
    } else if (assetType === 'crypto') {
      // Kripto paralar için Yahoo Finance kullan
      const cryptoSymbols = symbols || ['BTC-USD', 'ETH-USD', 'BNB-USD', 'XRP-USD', 'ADA-USD'];
      
      for (const symbol of cryptoSymbols) {
        const data = await fetchYahooFinanceData(symbol);
        if (data) {
          data.asset_type = 'crypto';
          data.exchange = 'Crypto';
          data.name = symbol.replace('-USD', '');
          results.push(data);
        }
      }
    } else if (assetType === 'currency') {
      // Döviz kurları için TCMB kullan
      results = await fetchTCMBRates();
    } else if (assetType === 'metal') {
      // Altın ve değerli metaller için Yahoo Finance kullan
      const metalSymbols = symbols || ['GC=F', 'SI=F', 'PL=F', 'PA=F'];
      
      for (const symbol of metalSymbols) {
        const data = await fetchYahooFinanceData(symbol);
        if (data) {
          data.asset_type = 'metal';
          data.exchange = 'Commodity';
          const nameMap: Record<string, string> = {
            'GC=F': 'Altın',
            'SI=F': 'Gümüş',
            'PL=F': 'Platin',
            'PA=F': 'Paladyum'
          };
          data.name = nameMap[symbol] || symbol;
          results.push(data);
        }
      }
    }

    // Veritabanına kaydet veya güncelle
    if (results.length > 0) {
      for (const asset of results) {
        // Önce mevcut varlığı kontrol et
        const checkResponse = await fetch(
          `${supabaseUrl}/rest/v1/assets?symbol=eq.${asset.symbol}&select=id`,
          {
            headers: {
              'apikey': serviceKey,
              'Authorization': `Bearer ${serviceKey}`,
            }
          }
        );

        const existingAssets = await checkResponse.json();

        if (existingAssets && existingAssets.length > 0) {
          // Güncelle
          const updateResponse = await fetch(
            `${supabaseUrl}/rest/v1/assets?symbol=eq.${asset.symbol}`,
            {
              method: 'PATCH',
              headers: {
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({
                price: asset.price,
                previous_close: asset.previous_close,
                change_percent: asset.change_percent,
                volume: asset.volume,
                market_cap: asset.market_cap,
                last_updated: asset.last_updated
              })
            }
          );

          if (!updateResponse.ok) {
            console.error(`Failed to update ${asset.symbol}:`, await updateResponse.text());
          }
        } else {
          // Yeni ekle
          const insertResponse = await fetch(
            `${supabaseUrl}/rest/v1/assets`,
            {
              method: 'POST',
              headers: {
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify(asset)
            }
          );

          if (!insertResponse.ok) {
            console.error(`Failed to insert ${asset.symbol}:`, await insertResponse.text());
          }
        }

        // Fiyat geçmişine ekle
        await fetch(
          `${supabaseUrl}/rest/v1/price_history`,
          {
            method: 'POST',
            headers: {
              'apikey': serviceKey,
              'Authorization': `Bearer ${serviceKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              symbol: asset.symbol,
              price: asset.price,
              volume: asset.volume || 0,
              timestamp: asset.last_updated,
              source: 'yahoo-finance'
            })
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        data: {
          success: true,
          count: results.length,
          assets: results
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        error: {
          code: 'FETCH_ERROR',
          message: error.message
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
