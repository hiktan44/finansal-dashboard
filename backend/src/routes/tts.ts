import { FastifyInstance } from 'fastify';
import { TtsService } from '../services/TtsService.js';

export async function TtsRoutes(fastify: FastifyInstance) {
    const ttsService = new TtsService();

    fastify.post('/api/tts/generate', async (request, reply) => {
        const { text, voice } = request.body as { text: string, voice?: string };

        if (!text) {
            return reply.status(400).send({ error: 'Text is required' });
        }

        try {
            // Map our custom roles to OpenAI and Google voices
            const voiceMap: Record<string, string> = {
                // OpenAI Voices
                'analist_erkek': 'onyx',
                'analist_kadin': 'nova',
                'gazeteci': 'alloy',
                'tv_muhabiri_erkek': 'echo',
                'tv_muhabiri_kadin': 'shimmer',
                // Google (Gemini) Voices
                'google_analist_erkek': 'tr-TR-Wavenet-B',
                'google_analist_kadin': 'tr-TR-Wavenet-A',
                'google_spiker_erkek': 'tr-TR-Wavenet-E',
                'google_spiker_kadin': 'tr-TR-Wavenet-D'
            };

            // Default to 'alloy' if mapping not found or raw voice name passed
            const targetVoice = voiceMap[voice || ''] || voice || 'alloy';

            const audioUrl = await ttsService.generateSpeech(text, targetVoice);

            // Construct full URL if needed, or just relative
            return reply.send({ url: `http://localhost:3001${audioUrl}`, success: true });
        } catch (error: any) {
            request.log.error(error);
            return reply.status(500).send({
                error: 'TTS generation failed',
                details: error.message
            });
        }
    });

    fastify.get('/api/tts/voices', async (request, reply) => {
        return reply.send({
            voices: [
                // OpenAI Voices
                { id: 'analist_erkek', name: 'OpenAI - Baş Analist (Erkek)', gender: 'male', description: 'Otoriter ve net (Premium)' },
                { id: 'analist_kadin', name: 'OpenAI - Baş Analist (Kadın)', gender: 'female', description: 'Enerjik ve akıcı (Premium)' },
                { id: 'tv_muhabiri_erkek', name: 'OpenAI - TV Muhabiri (Erkek)', gender: 'male', description: 'Dengeli ve resmi' },
                { id: 'tv_muhabiri_kadin', name: 'OpenAI - TV Muhabiri (Kadın)', gender: 'female', description: 'Berrak ve anlaşılır' },
                { id: 'gazeteci', name: 'OpenAI - Haber Spikeri (Nötr)', gender: 'neutral', description: 'Sakin ve ciddi' },
                // Google Voices
                { id: 'google_analist_erkek', name: 'Gemini - Analist (Erkek)', gender: 'male', description: 'Google Wavenet Teknolojisi' },
                { id: 'google_analist_kadin', name: 'Gemini - Analist (Kadın)', gender: 'female', description: 'Google Wavenet Teknolojisi' },
                { id: 'google_spiker_erkek', name: 'Gemini - Spiker (Erkek)', gender: 'male', description: 'Google Wavenet Teknolojisi' },
                { id: 'google_spiker_kadin', name: 'Gemini - Spiker (Kadın)', gender: 'female', description: 'Google Wavenet Teknolojisi' }
            ]
        });
    });
}
