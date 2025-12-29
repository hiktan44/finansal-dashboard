import { FastifyInstance } from 'fastify';
import { db } from '../utils/db.js';

export default async function alertsRoutes(fastify: FastifyInstance) {
  // Alert oluştur
  fastify.post('/', async (request, reply) => {
    try {
      const alertData = request.body as any;

      if (!alertData.user_id || !alertData.symbol || !alertData.condition) {
        reply.code(400);
        return { error: 'user_id, symbol ve condition gerekli' };
      }

      const alert = await db.createAlert({
        ...alertData,
        created_at: new Date().toISOString()
      });

      return {
        success: true,
        alert
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: error instanceof Error ? error.message : 'Database error' };
    }
  });

  // Alertleri getir
  fastify.get<{ Querystring: { user_id?: string } }>('/', async (request) => {
    try {
      const { user_id } = request.query;

      if (!user_id) {
        reply.code(400);
        return { error: 'user_id gerekli' };
      }

      const alerts = await db.getAlerts(user_id);

      return {
        success: true,
        alerts
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: error instanceof Error ? error.message : 'Database error' };
    }
  });

  // Alert kontrolü (cron job tarafından çağrılır)
  fastify.post('/check', async () => {
    return {
      success: true,
      message: 'Alert check implementasyonu gerekli'
    };
  });
}
