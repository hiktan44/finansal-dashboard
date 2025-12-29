import { FastifyInstance } from 'fastify';
import { fetchYahooFinanceData, fetchTCMBRates } from '../utils/fetch.js';
import { db } from '../utils/db.js';

export default async function marketDataRoutes(fastify: FastifyInstance) {
  // Market verisi çek ve kaydet
  fastify.post('/fetch', async (request, reply) => {
    try {
      const { assetType, symbols } = request.body as any;
      let results: any[] = [];

      if (assetType === 'bist') {
        const bistSymbols = symbols || ['THYAO.IS', 'GARAN.IS', 'AKBNK.IS', 'EREGL.IS', 'TCELL.IS'];
        
        for (const symbol of bistSymbols) {
          const data = await fetchYahooFinanceData(symbol);
          if (data) {
            data.asset_type = 'bist';
            data.exchange = 'BIST';
            data.name = symbol.replace('.IS', '');
            results.push(data);
            
            // DB'ye kaydet
            await db.upsertAsset(data);
            await db.addPriceHistory({
              symbol: data.symbol,
              price: data.price,
              volume: data.volume || 0,
              timestamp: data.last_updated,
              source: 'yahoo-finance'
            });
          }
        }
      } else if (assetType === 'crypto') {
        const cryptoSymbols = symbols || ['BTC-USD', 'ETH-USD', 'BNB-USD'];
        
        for (const symbol of cryptoSymbols) {
          const data = await fetchYahooFinanceData(symbol);
          if (data) {
            data.asset_type = 'crypto';
            data.exchange = 'Crypto';
            results.push(data);
            
            await db.upsertAsset(data);
            await db.addPriceHistory({
              symbol: data.symbol,
              price: data.price,
              volume: data.volume || 0,
              timestamp: data.last_updated,
              source: 'yahoo-finance'
            });
          }
        }
      } else if (assetType === 'currency') {
        results = await fetchTCMBRates();
        
        for (const asset of results) {
          await db.upsertAsset(asset);
        }
      } else if (assetType === 'metal') {
        const metalSymbols = symbols || ['GC=F', 'SI=F'];
        const nameMap: Record<string, string> = {
          'GC=F': 'Altın',
          'SI=F': 'Gümüş'
        };
        
        for (const symbol of metalSymbols) {
          const data = await fetchYahooFinanceData(symbol);
          if (data) {
            data.asset_type = 'metal';
            data.exchange = 'Commodity';
            data.name = nameMap[symbol] || symbol;
            results.push(data);
            
            await db.upsertAsset(data);
            await db.addPriceHistory({
              symbol: data.symbol,
              price: data.price,
              volume: data.volume || 0,
              timestamp: data.last_updated,
              source: 'yahoo-finance'
            });
          }
        }
      }

      return {
        success: true,
        count: results.length,
        assets: results
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return {
        error: 'FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Bilinmeyen hata'
      };
    }
  });

  // Tüm varlıkları getir
  fastify.get('/assets', async () => {
    try {
      const assets = await db.getAssets();
      return { success: true, data: assets };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: error instanceof Error ? error.message : 'Database error' };
    }
  });

  // Belirli bir varlık getir
  fastify.get<{ Params: { symbol: string } }>('/assets/:symbol', async (request) => {
    try {
      const { symbol } = request.params;
      const assets = await db.getAssets(symbol);
      return { success: true, data: assets[0] || null };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: error instanceof Error ? error.message : 'Database error' };
    }
  });
}
