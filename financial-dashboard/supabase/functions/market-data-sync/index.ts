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
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        console.log('Starting market data sync...');

        // Fetch data from Yahoo Finance API
        const symbols = {
            indices: [
                { symbol: '^DJI', name: 'Dow Jones Sanayi Ortalaması' },
                { symbol: '^GSPC', name: 'S&P 500 Endeksi' },
                { symbol: '^IXIC', name: 'NASDAQ Bileşik Endeksi' }
            ],
            techStocks: [
                { symbol: 'TSLA', name: 'Tesla' },
                { symbol: 'AAPL', name: 'Apple' },
                { symbol: 'MSFT', name: 'Microsoft' },
                { symbol: 'GOOGL', name: 'Alphabet (Google)' },
                { symbol: 'AMZN', name: 'Amazon' },
                { symbol: 'META', name: 'Meta Platforms' },
                { symbol: 'NVDA', name: 'NVIDIA' }
            ],
            commodities: [
                { symbol: 'GC=F', name: 'Altın' },
                { symbol: 'CL=F', name: 'Ham Petrol (WTI)' }
            ]
        };

        const today = new Date().toISOString().split('T')[0];

        // Function to fetch quote from Yahoo Finance
        async function fetchYahooQuote(symbol: string) {
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(`Failed to fetch ${symbol}: ${response.status}`);
                return null;
            }
            
            const data = await response.json();
            return data;
        }

        // Process market indices
        console.log('Fetching market indices...');
        const indicesData = [];
        
        for (const index of symbols.indices) {
            const quoteData = await fetchYahooQuote(index.symbol);
            
            if (quoteData && quoteData.chart && quoteData.chart.result && quoteData.chart.result[0]) {
                const result = quoteData.chart.result[0];
                const meta = result.meta;
                const quote = result.indicators.quote[0];
                
                const closePrice = meta.regularMarketPrice || quote.close[quote.close.length - 1];
                const previousClose = meta.previousClose || meta.chartPreviousClose;
                const change = closePrice - previousClose;
                const changePercent = (change / previousClose) * 100;
                
                indicesData.push({
                    symbol: index.symbol,
                    name: index.name,
                    close_price: closePrice,
                    change_value: change,
                    change_percent: changePercent,
                    is_new_high: meta.regularMarketPrice >= (meta.fiftyTwoWeekHigh || 0),
                    data_date: today
                });
            }
        }

        // Process tech stocks
        console.log('Fetching tech stocks...');
        const techStocksData = [];
        
        for (const stock of symbols.techStocks) {
            const quoteData = await fetchYahooQuote(stock.symbol);
            
            if (quoteData && quoteData.chart && quoteData.chart.result && quoteData.chart.result[0]) {
                const result = quoteData.chart.result[0];
                const meta = result.meta;
                const quote = result.indicators.quote[0];
                
                const closePrice = meta.regularMarketPrice || quote.close[quote.close.length - 1];
                const previousClose = meta.previousClose || meta.chartPreviousClose;
                const change = closePrice - previousClose;
                const changePercent = (change / previousClose) * 100;
                
                techStocksData.push({
                    symbol: stock.symbol,
                    name: stock.name,
                    close_price: closePrice,
                    change_percent: changePercent,
                    day_high: meta.regularMarketDayHigh || quote.high[quote.high.length - 1],
                    day_low: meta.regularMarketDayLow || quote.low[quote.low.length - 1],
                    volume: meta.regularMarketVolume,
                    data_date: today
                });
            }
        }

        // Process commodities
        console.log('Fetching commodities...');
        const commoditiesData = [];
        
        for (const commodity of symbols.commodities) {
            const quoteData = await fetchYahooQuote(commodity.symbol);
            
            if (quoteData && quoteData.chart && quoteData.chart.result && quoteData.chart.result[0]) {
                const result = quoteData.chart.result[0];
                const meta = result.meta;
                
                const closePrice = meta.regularMarketPrice;
                const previousClose = meta.previousClose || meta.chartPreviousClose;
                const change = closePrice - previousClose;
                const changePercent = (change / previousClose) * 100;
                
                commoditiesData.push({
                    symbol: commodity.symbol,
                    name: commodity.name,
                    price: closePrice,
                    change_percent: changePercent,
                    data_date: today
                });
            }
        }

        // Insert data into Supabase
        console.log('Inserting data into database...');
        
        // Insert market indices
        if (indicesData.length > 0) {
            const insertIndicesResponse = await fetch(`${supabaseUrl}/rest/v1/market_indices`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(indicesData)
            });

            if (!insertIndicesResponse.ok) {
                const errorText = await insertIndicesResponse.text();
                console.error('Failed to insert indices:', errorText);
            } else {
                console.log(`Inserted ${indicesData.length} market indices`);
            }
        }

        // Insert tech stocks
        if (techStocksData.length > 0) {
            const insertStocksResponse = await fetch(`${supabaseUrl}/rest/v1/tech_stocks`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(techStocksData)
            });

            if (!insertStocksResponse.ok) {
                const errorText = await insertStocksResponse.text();
                console.error('Failed to insert tech stocks:', errorText);
            } else {
                console.log(`Inserted ${techStocksData.length} tech stocks`);
            }
        }

        // Insert commodities
        if (commoditiesData.length > 0) {
            const insertCommoditiesResponse = await fetch(`${supabaseUrl}/rest/v1/commodities`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(commoditiesData)
            });

            if (!insertCommoditiesResponse.ok) {
                const errorText = await insertCommoditiesResponse.text();
                console.error('Failed to insert commodities:', errorText);
            } else {
                console.log(`Inserted ${commoditiesData.length} commodities`);
            }
        }

        // Create market summary
        const summaryData = {
            summary_text: `Piyasa Özeti - ${today}: Güncel finansal veriler başarıyla senkronize edildi.`,
            key_points: [
                `${indicesData.length} endeks güncellendi`,
                `${techStocksData.length} teknoloji hissesi güncellendi`,
                `${commoditiesData.length} emtia fiyatı güncellendi`
            ],
            market_sentiment: 'Nötr',
            data_date: today
        };

        const insertSummaryResponse = await fetch(`${supabaseUrl}/rest/v1/market_summary`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(summaryData)
        });

        if (!insertSummaryResponse.ok) {
            const errorText = await insertSummaryResponse.text();
            console.error('Failed to insert summary:', errorText);
        } else {
            console.log('Market summary inserted');
        }

        return new Response(JSON.stringify({
            data: {
                success: true,
                message: 'Market data synchronized successfully',
                stats: {
                    indices: indicesData.length,
                    techStocks: techStocksData.length,
                    commodities: commoditiesData.length
                }
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Market data sync error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'MARKET_SYNC_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
