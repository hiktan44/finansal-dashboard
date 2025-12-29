import { FastifyInstance } from 'fastify';
import { db } from '../utils/db.js';

export default async function tuikRoutes(fastify: FastifyInstance) {
  // TÜİK verisi çek (web scraping gerekebilir)
  fastify.post('/fetch', async (request, reply) => {
    try {
      const { table_code } = request.body as any;

      if (!table_code) {
        reply.code(400);
        return { error: 'table_code gerekli' };
      }

      // TÜİK genelde POST ile HTML tablo döner
      // Buraya scraping logic'i gelecek
      const url = `https://data.tuik.gov.tr/Table/${table_code}`;

      return {
        success: true,
        message: 'TÜİK scraping implementasyonu gerekli',
        table_code
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
  fastify.get('/inflation', async () => {
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
  fastify.get('/unemployment', async () => {
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
