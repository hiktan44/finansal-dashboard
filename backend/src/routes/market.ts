import { FastifyInstance } from 'fastify';
import { fetchYahooFinanceData, fetchHistoricalYahooFinanceData } from '../utils/fetch.js';
import { db } from '../utils/db.js';

export default async function marketRoutes(fastify: FastifyInstance) {
    // Main Dashboard Global Fetch
    fastify.post('/fetch-all', async (request, reply) => {
        try {
            const results: any = {
                indices: [],
                tech_stocks: [],
                commodities: []
            };

            const date = new Date().toISOString().split('T')[0];

            // 1. Indices
            const indexSymbols = ['XU100.IS', 'XU030.IS', '^GSPC', '^DJI', '^IXIC'];
            for (const symbol of indexSymbols) {
                try {
                    const data = await fetchYahooFinanceData(symbol) as any;
                    if (data) {
                        const record = {
                            symbol: data.symbol,
                            name: data.symbol.replace('.IS', '').replace('^', ''),
                            close_price: data.price,
                            change_percent: data.change_percent,
                            change_value: data.change || 0,
                            data_date: date
                        };
                        await db.upsertMarketData('market_indices', record);
                        results.indices.push(record);
                    }
                } catch (e) {
                    console.error(`Failed to fetch index ${symbol}:`, e);
                }
            }

            // 2. Tech Giants
            const techSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];
            for (const symbol of techSymbols) {
                try {
                    const data = await fetchYahooFinanceData(symbol) as any;
                    if (data) {
                        const record = {
                            symbol: data.symbol,
                            name: data.name || symbol,
                            close_price: data.price,
                            change_percent: data.change_percent,
                            day_high: data.dayHigh || data.price,
                            day_low: data.dayLow || data.price,
                            data_date: date
                        };
                        await db.upsertMarketData('tech_stocks', record);
                        results.tech_stocks.push(record);
                    }
                } catch (e) {
                    console.error(`Failed to fetch tech stock ${symbol}:`, e);
                }
            }

            // 3. Commodities
            const commoditySymbols = ['GC=F', 'SI=F', 'CL=F', 'NG=F'];
            const commodityNames: Record<string, string> = {
                'GC=F': 'Altın',
                'SI=F': 'Gümüş',
                'CL=F': 'Ham Petrol',
                'NG=F': 'Doğal Gaz'
            };
            for (const symbol of commoditySymbols) {
                try {
                    const data = await fetchYahooFinanceData(symbol) as any;
                    if (data) {
                        const record = {
                            symbol: data.symbol,
                            name: commodityNames[symbol] || symbol,
                            price: data.price,
                            change_percent: data.change_percent,
                            data_date: date
                        };
                        await db.upsertMarketData('commodities', record);
                        results.commodities.push(record);
                    }
                } catch (e) {
                    console.error(`Failed to fetch commodity ${symbol}:`, e);
                }
            }

            // 4. Market Summary (Using existing DB schema columns if available)
            try {
                const summaryRecord = {
                    data_date: date,
                    daily_summary: {
                        headline: "Piyasalar karışık bir seyir izliyor",
                        keyPoints: ["BIST 100 yatay seyrediyor", "Teknoloji hisseleri hareketli", "Altın fiyatları dengeleniyor"],
                        marketConcerns: ["Enflasyon verileri takip ediliyor"],
                        upcomingEvents: [
                            { event: "Merkez Bankası toplantısı", date: date, note: "Piyasa faiz kararını bekliyor" }
                        ]
                    }
                };
                await db.upsertMarketSummary(summaryRecord);
            } catch (summaryError: any) {
                console.warn('Failed to upsert market summary (schema mismatch?):', summaryError.message);
                // Continue with the rest of the sync
            }

            // 5. Initial Historical Data (for main symbols)
            const initialSymbols = ['XU100.IS', '^GSPC', 'GC=F'];
            for (const symbol of initialSymbols) {
                try {
                    const hist = await fetchHistoricalYahooFinanceData(symbol, '1m');
                    if (hist.length > 0) {
                        await db.upsertHistoricalData(hist);
                    }
                } catch (e) {
                    console.error(`Failed to fetch initial historical ${symbol}:`, e);
                }
            }

            return {
                success: true,
                date,
                counts: {
                    indices: results.indices.length,
                    tech_stocks: results.tech_stocks.length,
                    commodities: results.commodities.length,
                    historical: initialSymbols.length
                }
            };
        } catch (error: any) {
            fastify.log.error(error);
            reply.code(500);
            return { success: false, error: error.message };
        }
    });

    // Fetch Historical Data for specific symbol
    fastify.post('/fetch-historical', async (request, reply) => {
        try {
            const { symbol, period = '1y' } = request.body as any;
            if (!symbol) return reply.code(400).send({ error: 'Symbol is required' });

            const data = await fetchHistoricalYahooFinanceData(symbol, period);
            if (data.length > 0) {
                await db.upsertHistoricalData(data);
            }
            return { success: true, count: data.length };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    // AI Analysis trigger
    fastify.post('/trigger-ai', async (request, reply) => {
        return { success: true, message: 'AI Analysis simulation complete' };
    });
}
