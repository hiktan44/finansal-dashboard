import { FastifyInstance } from 'fastify';
import { db } from '../utils/db.js';

export default async function portfolioRoutes(fastify: FastifyInstance) {
  // Portföy getir
  fastify.get<{ Querystring: { user_id?: string } }>('/', async (request, reply) => {
    try {
      const { user_id } = request.query;

      if (!user_id) {
        reply.code(400);
        return { error: 'user_id gerekli' };
      }

      const holdings = await db.getPortfolioHoldings(user_id);

      return {
        success: true,
        portfolio: holdings
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: error instanceof Error ? error.message : 'Database error' };
    }
  });

  // Portföy analizi
  fastify.post('/analyze', async (request, reply) => {
    try {
      const { user_id } = request.body as any;

      if (!user_id) {
        reply.code(400);
        return { error: 'user_id gerekli' };
      }

      const holdings = await db.getPortfolioHoldings(user_id);

      // Basit analiz
      const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * h.average_price), 0);

      const analysis = {
        total_value: totalValue,
        holdings_count: holdings.length,
        top_holdings: holdings.slice(0, 5)
      };

      return {
        success: true,
        analysis
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: error instanceof Error ? error.message : 'Analysis error' };
    }
  });
}
