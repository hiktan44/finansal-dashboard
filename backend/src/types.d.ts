import { FastifyInstance } from 'fastify';

declare module 'fastify' {
    interface FastifyInstance {
        config: {
            PORT: string;
            SUPABASE_URL: string;
            SUPABASE_SERVICE_ROLE_KEY: string;
            NODE_ENV: string;
            OPENROUTER_API_KEY?: string; // Optional since it might not be set in all envs
        };
    }
}
