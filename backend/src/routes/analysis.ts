import { FastifyInstance } from 'fastify';
import { AnalysisService } from '../services/AnalysisService.js';
import { MarketAgent } from '../services/MarketAgent.js';

export default async function analysisRoutes(fastify: FastifyInstance) {
    const service = new AnalysisService();

    fastify.post('/correlations', async (request, reply) => {
        try {
            const {
                symbols = ['XU100.IS', 'USDTRY=X', 'GC=F', '^GSPC', 'BTC-USD', 'CL=F'],
                period = 90
            } = request.body as any;

            const result = await service.getCorrelationMatrix(symbols, period);
            return result;

        } catch (error: any) {
            fastify.log.error(error);
            return { error: error.message };
        }
    });

    const marketAgent = new MarketAgent();

    fastify.post('/simulate', async (request, reply) => {
        try {
            const { scenario } = request.body as any;
            if (!scenario) return { error: "Scenario is required" };

            const result = await marketAgent.generateScenarioSimulation(scenario);
            return result;
        } catch (error: any) {
            fastify.log.error(error);
            return { error: error.message };
        }
    });
}
