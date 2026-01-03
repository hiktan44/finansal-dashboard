
import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import env from '@fastify/env';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cron from 'node-cron';

// Routes
import marketDataRoutes from './routes/market-data.js';
import tcmbRoutes from './routes/tcmb.js';
import tefasRoutes from './routes/tefas.js';
import fredRoutes from './routes/fred.js';
import tuikRoutes from './routes/tuik.js';
import bistRoutes from './routes/bist.js';
import portfolioRoutes from './routes/portfolio.js';
import alertsRoutes from './routes/alerts.js';
import turkeyRoutes from './routes/turkey.js';
import marketRoutes from './routes/market.js';
import aiAnalystRoutes from './routes/ai-analyst.js';
import analysisRoutes from './routes/analysis.js';
import { TtsRoutes } from './routes/tts.js';

// Services
import { MarketAgent } from './services/MarketAgent.js';
import { ScraperService } from './services/ScraperService.js';
import { TuikScraperService } from './services/TuikScraperService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const schema = {
  type: 'object',
  required: ['PORT', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
  properties: {
    PORT: { type: 'string', default: '3001' },
    SUPABASE_URL: { type: 'string' },
    SUPABASE_SERVICE_ROLE_KEY: { type: 'string' },
    NODE_ENV: { type: 'string', default: 'development' },
    OPENROUTER_API_KEY: { type: 'string' }
  }
};

async function build() {
  const fastify = Fastify({
    logger: true
  });

  // Register env plugin
  await fastify.register(env, {
    confKey: 'config',
    schema: schema,
    dotenv: true
  });


  // Register CORS
  await fastify.register(cors, {
    origin: true,
    credentials: true
  });

  // Register Static Files (Audio Cache)
  await fastify.register(fastifyStatic, {
    root: path.join(__dirname, '../public'),
    prefix: '/', // Serve directly from root/audio-cache/...
  });

  // Health check
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  });

  // CRON JOBS
  // TÜİK Inflation: 3rd of month at 10:05 AM
  cron.schedule('5 10 3 * *', async () => {
    console.log('⏰ Cron: Starting TUIK Inflation Update...');
    await TuikScraperService.updateInflationData();
  });

  // Daily check at 10:30 AM (backup for other data)
  cron.schedule('30 10 * * *', async () => {
    console.log('⏰ Cron: Daily TUIK Check...');
    // Future: TuikScraperService.checkOtherIndicators();
    await TuikScraperService.updateInflationData(); // Robustness: Check daily too in case of delays
  });

  // API routes
  await fastify.register(marketDataRoutes, { prefix: '/api/market' });
  await fastify.register(tcmbRoutes, { prefix: '/api/tcmb' });
  await fastify.register(tefasRoutes, { prefix: '/api/tefas' });
  await fastify.register(fredRoutes, { prefix: '/api/fred' });
  await fastify.register(tuikRoutes, { prefix: '/api/tuik' });
  await fastify.register(bistRoutes, { prefix: '/api/bist' });
  await fastify.register(portfolioRoutes, { prefix: '/api/portfolio' });
  await fastify.register(alertsRoutes, { prefix: '/api/alerts' });
  await fastify.register(turkeyRoutes, { prefix: '/api/turkey' });
  await fastify.register(marketRoutes, { prefix: '/api/market' });
  await fastify.register(aiAnalystRoutes, { prefix: '/api/agent' });
  await fastify.register(analysisRoutes, { prefix: '/api/analysis' });
  await fastify.register(TtsRoutes);

  // Global Sync Route
  fastify.post('/api/sync-all', async (request, reply) => {
    const results: any = {};
    try {
      const baseUrl = `http://localhost:${fastify.config.PORT}`;

      // Trigger Background Processes (Fire and Forget)
      console.log('🔄 Sync-All: Triggering Background Scraper & AI Agent...');
      const scraper = new ScraperService();
      scraper.runScraper().catch(e => console.log('Sync Scraper Error:', e));

      const agent = new MarketAgent();
      agent.runDailyAnalysis().catch(e => console.log('Sync Agent Error:', e));

      // Trigger various fetch endpoints
      // Note: We use fetch to trigger our own endpoints to leverage their logic
      const [tcmb, fred, market, turkey] = await Promise.all([
        fetch(`${baseUrl}/api/tcmb/fetch`, { method: 'POST' }).then(r => r.json()).catch(e => ({ error: e.message })),
        fetch(`${baseUrl}/api/fred/fetch-all`, { method: 'POST' }).then(r => r.json()).catch(e => ({ error: e.message })),
        fetch(`${baseUrl}/api/market/fetch-all`, { method: 'POST' }).then(r => r.json()).catch(e => ({ error: e.message })),
        fetch(`${baseUrl}/api/turkey/init`, { method: 'POST' }).then(r => r.json()).catch(e => ({ error: e.message }))
      ]);

      return {
        success: true,
        message: "All sync processes started (Agent & Scraper running in background)",
        results: { tcmb, fred, market, turkey }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 404 handler
  fastify.setNotFoundHandler(async () => {
    return { error: 'Not Found', message: 'Endpoint bulunamadı' };
  });

  // Error handler
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);
    reply.code(error.statusCode || 500).send({
      error: error.message,
      code: error.code || 'INTERNAL_SERVER_ERROR'
    });
  });

  // Manual Scraper Trigger
  fastify.post('/api/scraper/run', async (request, reply) => {
    const scraper = new ScraperService();
    // Run async, don't block response
    scraper.runScraper().catch(e => console.error(e));
    return { success: true, message: 'Scraper triggered in background' };
  });

  return fastify;
}

// Scheduler Setup function
function setupScheduler() {
  console.log('📅 Setting up Cron Jobs...');

  // Run AI Analyst every 4 hours: 09:00, 13:00, 17:00, ...
  cron.schedule('0 */4 * * *', async () => {
    console.log('⏰ Cron Job: Triggering Scheduled AI Analysis...');
    const agent = new MarketAgent();
    try {
      await agent.runDailyAnalysis();
    } catch (err) {
      console.error('Scheduled Analysis Failed:', err);
    }
  });

  // Run Data Scraper every day at 18:30 (Market Close + buffer)
  cron.schedule('30 18 * * *', async () => {
    console.log('⏰ Cron Job: Triggering Daily Data Scraper...');
    const scraper = new ScraperService();
    try {
      await scraper.runScraper();
    } catch (err) {
      console.error('Scraper Failed:', err);
    }
  });
}

async function start() {
  const fastify = await build();

  try {
    const port = parseInt(fastify.config.PORT || '3001');
    const host = '0.0.0.0';

    await fastify.listen({ port, host });
    console.log(`🚀 Backend sunucu çalışıyor: http://localhost:${port}`);

    // Start Scheduler after server is up
    setupScheduler();

    // RUN ON STARTUP (Initial Sync)
    console.log('🔄 Startup: Triggering Initial Data Scrape & AI Analysis...');
    const scraper = new ScraperService();
    scraper.runScraper().catch(e => console.error('Startup Scraper Error:', e));

    const agent = new MarketAgent();
    agent.runDailyAnalysis().catch(e => console.error('Startup Agent Error:', e));

  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
