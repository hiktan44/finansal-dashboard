import { FastifyInstance } from 'fastify';
import { fetchYahooFinanceData } from '../utils/fetch.js';
import { db } from '../utils/db.js';

export default async function bistRoutes(fastify: FastifyInstance) {
  // BIST100 verisi çek
  fastify.post('/fetch', async (request, reply) => {
    try {
      const { symbols } = (request.body || {}) as any;
      const bistSymbols = symbols || [
        'XU100.IS',
        'XU030.IS',
        'XU050.IS',
        'XUSIN.IS',
        'XUBANK.IS'
      ];

      const results = [];

      for (const symbol of bistSymbols) {
        const data = await fetchYahooFinanceData(symbol) as any;
        if (data) {
          data.asset_type = 'index';
          data.exchange = 'BIST';
          results.push(data);

          // Market indices tablosuna kaydet
          await db.upsertMarketData('market_indices', {
            symbol: data.symbol,
            name: data.symbol.replace('.IS', ''),
            close_price: data.price,
            change_percent: data.change_percent,
            data_date: new Date().toISOString().split('T')[0]
          });
        }
      }

      return {
        success: true,
        count: results.length,
        indices: results
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return {
        error: 'BIST_FETCH_FAILED',
        message: error instanceof Error ? error.message : 'BIST verisi alınamadı'
      };
    }
  });

  // BIST endeksleri getir
  fastify.get('/indices', async (request, reply) => {
    try {
      // Market indices tablosundan getir
      const data = await db.getMarketData('market_indices');
      return {
        success: true,
        data
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: error instanceof Error ? error.message : 'Database error' };
    }
  });
}
