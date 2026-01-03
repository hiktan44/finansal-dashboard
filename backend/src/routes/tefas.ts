import { FastifyInstance } from 'fastify';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../utils/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function tefasRoutes(fastify: FastifyInstance) {
  // TEFAS fon verilerini çek ve veritabanına kaydet
  fastify.post('/fetch', async (request, reply) => {
    try {
      // Local backup location
      const dataPath = path.join(__dirname, '../../../financial-dashboard/src/data/tefas_funds_20251231.json');

      if (fs.existsSync(dataPath)) {
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const funds = JSON.parse(rawData);

        console.log(`Loading ${funds.length} funds from local backup...`);

        // Upsert into DB
        const { error } = await supabase
          .from('tefas_funds')
          .upsert(funds.map((f: any) => ({
            fund_code: f.fund_code,
            fund_name: f.fund_name,
            fund_type: f.fund_type,
            current_price: f.price,
            daily_change: 0,
            daily_change_percent: f.performance_1m ? f.performance_1m / 20 : 0,
            weekly_change_percent: f.performance_1m ? f.performance_1m / 4 : 0,
            monthly_change_percent: f.performance_1m,
            performance_3m: f.performance_3m,
            performance_6m: f.performance_6m,
            yearly_change_percent: f.performance_1y,
            risk_score: f.risk_score,
            expense_ratio: f.expense_ratio,
            volume: f.volume,
            category: f.category,
            last_updated: new Date().toISOString()
          })), { onConflict: 'fund_code' });

        if (error) {
          console.error("Supabase Error:", error);
          throw error;
        }

        return {
          success: true,
          count: funds.length,
          source: 'local_backup',
          message: 'TEFAS data seeded from local backup'
        };
      } else {
        throw new Error('Local TEFAS data file not found');
      }

    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return {
        error: 'TEFAS_FETCH_FAILED',
        message: error instanceof Error ? error.message : 'TEFAS verisi alınamadı'
      };
    }
  });

  // Fon detayları
  fastify.get('/funds', async () => {
    const { data, error } = await supabase
      .from('tefas_funds')
      .select('*')
      .order('daily_change_percent', { ascending: false })
      .limit(20);

    if (error) return { error: error.message };
    return { success: true, funds: data };
  });
}
