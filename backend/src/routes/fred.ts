import { FastifyInstance } from 'fastify';
import { db } from '../utils/db.js';

export default async function fredRoutes(fastify: FastifyInstance) {
  const apiKey = process.env.FRED_API_KEY;

  // FRED verisi çek
  fastify.post('/fetch', async (request, reply) => {
    try {
      const { series_id } = request.body as any;

      if (!series_id) {
        reply.code(400);
        return { error: 'series_id gerekli' };
      }

      if (!apiKey) {
        reply.code(500);
        return { error: 'FRED_API_KEY environment variable gerekli' };
      }

      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series_id}&api_key=${apiKey}&file_type=json`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`FRED API error: ${response.status}`);
      }

      const data = await response.json();

      // Macro data'ya kaydet
      if (data.observations) {
        for (const obs of data.observations) {
          if (obs.value !== '.') {
            await db.upsertMacroData({
              country: 'US',
              indicator: series_id,
              value: parseFloat(obs.value),
              unit: 'USD',
              date: obs.date,
              source: 'FRED',
              metadata: {
                series_id: series_id,
                realtime_start: obs.realtime_start,
                realtime_end: obs.realtime_end
              }
            });
          }
        }
      }

      return {
        success: true,
        series_id,
        count: data.observations?.length || 0,
        data: data.observations
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return {
        error: 'FRED_FETCH_FAILED',
        message: error instanceof Error ? error.message : 'FRED verisi alınamadı'
      };
    }
  });
}
