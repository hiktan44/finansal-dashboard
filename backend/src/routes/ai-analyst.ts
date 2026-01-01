
import { FastifyInstance } from 'fastify';
import { MarketAgent } from '../services/MarketAgent.js';

export default async function aiAnalystRoutes(fastify: FastifyInstance) {
    const agent = new MarketAgent();

    fastify.post('/generate', async (request, reply) => {
        try {
            fastify.log.info('Running On-Demand AI Analysis...');
            const result = await agent.runDailyAnalysis();

            return {
                success: true,
                data: result
            };
        } catch (error) {
            fastify.log.error(error);
            reply.code(500);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Analysis failed'
            };
        }
    });

    fastify.get('/latest', async (request, reply) => {
        // This could fetch the latest from DB if we wanted to separate generation from fetching
        // But frontend usually fetches from supabase client directly.
        return { message: "Use Supabase client to fetch 'daily_analysis' table directly." }
    });
}
