import Fastify from 'fastify';
import cors from '@fastify/cors';
import env from '@fastify/env';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import routes
import marketDataRoutes from './routes/market-data.js';
import tcmbRoutes from './routes/tcmb.js';
import tefasRoutes from './routes/tefas.js';
import fredRoutes from './routes/fred.js';
import tuikRoutes from './routes/tuik.js';
import bistRoutes from './routes/bist.js';
import portfolioRoutes from './routes/portfolio.js';
import alertsRoutes from './routes/alerts.js';

const schema = {
  type: 'object',
  required: ['PORT', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
  properties: {
    PORT: {
      type: 'string',
      default: '3001'
    },
    SUPABASE_URL: {
      type: 'string'
    },
    SUPABASE_SERVICE_ROLE_KEY: {
      type: 'string'
    },
    NODE_ENV: {
      type: 'string',
      default: 'development'
    }
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
    origin: true, // Tüm origin'lere izin ver (production'da kısıtla)
    credentials: true
  });

  // Health check
  fastify.get('/health', async () => {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
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

  return fastify;
}

async function start() {
  const fastify = await build();

  try {
    const port = parseInt(fastify.config.PORT || '3001');
    const host = '0.0.0.0';
    
    await fastify.listen({ port, host });
    console.log(`🚀 Backend sunucu çalışıyor: http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
