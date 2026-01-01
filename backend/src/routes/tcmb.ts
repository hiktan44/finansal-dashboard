import { FastifyInstance } from 'fastify';
import { db } from '../utils/db.js';

export default async function tcmbRoutes(fastify: FastifyInstance) {
  // TCMB verilerini çek ve macro_data tablosuna kaydet
  fastify.post('/fetch', async (request, reply) => {
    try {
      const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF'];
      const results = {
        success: 0,
        failed: 0,
        data: [] as any[],
        errors: [] as string[]
      };

      // TCMB XML'i çek
      const url = 'https://www.tcmb.gov.tr/kurlar/today.xml';
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`TCMB API error: ${response.status}`);
      }

      const xmlText = await response.text();

      // Tarihi al
      const dateMatch = xmlText.match(/Tarih="([^"]+)"/);
      const bulletinDate = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
      const dateParts = bulletinDate.split('.');
      const formattedDate = dateParts.length === 3
        ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
        : new Date().toISOString().split('T')[0];

      // Her para birimi için
      for (const currency of currencies) {
        try {
          const pattern = new RegExp(
            `<Currency[^>]*Kod="${currency}"[^>]*>[\\s\\S]*?<ForexSelling>([^<]+)</ForexSelling>`,
            'i'
          );

          const match = xmlText.match(pattern);
          if (!match || !match[1]) {
            console.log(`Failed to match regex for ${currency}. XML excerpt:`, xmlText.substring(0, 500)); // Debug log
            throw new Error(`Currency ${currency} not found`);
          }

          const rate = parseFloat(match[1]);
          if (isNaN(rate) || rate <= 0) {
            throw new Error(`Invalid rate: ${match[1]}`);
          }

          const macroData = {
            country: 'TR',
            indicator: `Exchange Rate ${currency}/TRY`,
            value: rate,
            unit: 'TRY',
            date: formattedDate,
            source: 'TCMB',
            metadata: {
              currency_code: currency,
              bulletin_date: bulletinDate
            }
          };

          await db.upsertMacroData(macroData);


          // Calculate YoY Change for Currencies
          // Fetch value from 1 year ago for accurate annual change
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
          const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];

          // Try to find a rate close to 1 year ago from database
          const { data: histData } = await db.supabase
            .from('economic_data')
            .select('value')
            .eq('indicator_code', `${currency}_TRY`)
            .lte('period_date', oneYearAgoStr)
            .order('period_date', { ascending: false })
            .limit(1)
            .single();

          let previousValue = 0;
          let changePercent = 0;

          if (histData && histData.value) {
            previousValue = histData.value;
            changePercent = ((rate - previousValue) / previousValue) * 100;
          }

          // Also update turkey_economics for dashboard visibility
          await db.upsertTurkeyEconomics({
            indicator_code: `${currency}_TRY`,
            indicator_name: `${currency}/TL Kuru`,
            indicator_category: 'Para Politikası',
            current_value: rate,
            previous_value: previousValue, // Store actual previous year value
            change_percent: Number(changePercent.toFixed(2)),
            period_date: formattedDate,
            unit: 'TL',
            source: 'TCMB',
            last_updated: new Date().toISOString()
          });

          results.success++;
          results.data.push({ currency, rate: rate.toFixed(4) });
        } catch (error: any) {
          console.error(`TCMB Loop Error for ${currency}:`, error); // Log raw error
          results.failed++;
          results.errors.push(`${currency}: ${error.message || JSON.stringify(error)}`);
        }
      }

      return {
        success: true,
        total: currencies.length,
        success_count: results.success,
        failed_count: results.failed,
        date: formattedDate,
        rates: results.data,
        errors: results.errors
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return {
        error: 'TCMB_FETCH_FAILED',
        message: error instanceof Error ? error.message : 'Bilinmeyen hata'
      };
    }
  });

  // Macro data getir
  fastify.get('/data', async (request, reply) => {
    try {
      const { indicator, start_date, end_date } = request.query as any;
      const data = await db.getMacroData(indicator, start_date, end_date);
      return { success: true, data };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: error instanceof Error ? error.message : 'Database error' };
    }
  });
}
