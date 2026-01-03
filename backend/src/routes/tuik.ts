import { FastifyInstance } from 'fastify';
import { db } from '../utils/db.js';
import { TuikScraperService } from '../services/TuikScraperService.js';

export default async function tuikRoutes(fastify: FastifyInstance) {
  // TÜİK verisi çek (web scraping gerekebilir)
  fastify.post('/fetch', async (request, reply) => {
    try {
      const { table_code } = request.body as any;

      if (!table_code) {
        reply.code(400);
        return { error: 'table_code gerekli' };
      }

      // Trigger manual update
      await TuikScraperService.updateInflationData();
      await TuikScraperService.updateUnemploymentData();

      return {
        success: true,
        message: 'TÜİK verileri güncellendi (Inflation check)'
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return {
        error: 'TUIK_FETCH_FAILED',
        message: error instanceof Error ? error.message : 'TÜİK verisi alınamadı'
      };
    }
  });

  // Enflasyon verisi
  fastify.get('/inflation', async (request, reply) => {
    try {
      const data = await db.getMacroData('CPI', undefined, undefined);
      return { success: true, data };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: error instanceof Error ? error.message : 'Database error' };
    }
  });

  // İşsizlik verisi
  fastify.get('/unemployment', async (request, reply) => {
    try {
      const data = await db.getMacroData('Unemployment Rate', undefined, undefined);
      return { success: true, data };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: error instanceof Error ? error.message : 'Database error' };
    }
  });
}
