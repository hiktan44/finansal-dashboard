import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TtsService {
    private openai: OpenAI;
    private audioDir: string;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
            dangerouslyAllowBrowser: false
        });

        this.audioDir = path.join(__dirname, '../../public/audio-cache');
        if (!fs.existsSync(this.audioDir)) {
            fs.mkdirSync(this.audioDir, { recursive: true });
        }
    }

    async generateSpeech(text: string, voice: string): Promise<string> {
        // Determine provider based on voice ID
        if (voice.startsWith('tr-TR')) {
            return this.generateGoogleSpeech(text, voice);
        } else {
            return this.generateOpenAISpeech(text, voice);
        }
    }

    private async generateOpenAISpeech(text: string, voice: string): Promise<string> {
        try {
            if (!process.env.OPENAI_API_KEY) {
                throw new Error('OPENAI_API_KEY eksik.');
            }

            const crypto = await import('crypto');
            const hash = crypto.createHash('md5').update(`openai-${voice}-${text}`).digest('hex');
            const filePath = path.join(this.audioDir, `${hash}.mp3`);

            if (fs.existsSync(filePath)) {
                return `/audio-cache/${hash}.mp3`;
            }

            const mp3 = await this.openai.audio.speech.create({
                model: "tts-1",
                voice: voice as any,
                input: text,
            });

            const buffer = Buffer.from(await mp3.arrayBuffer());
            await fs.promises.writeFile(filePath, buffer);

            return `/audio-cache/${hash}.mp3`;
        } catch (error) {
            console.error('OpenAI TTS Error:', error);
            throw error;
        }
    }

    private async generateGoogleSpeech(text: string, voice: string): Promise<string> {
        try {
            if (!process.env.GOOGLE_API_KEY) {
                throw new Error('GOOGLE_API_KEY eksik.');
            }

            const crypto = await import('crypto');
            const hash = crypto.createHash('md5').update(`google-${voice}-${text}`).digest('hex');
            const filePath = path.join(this.audioDir, `${hash}.mp3`);

            if (fs.existsSync(filePath)) {
                return `/audio-cache/${hash}.mp3`;
            }

            // Google Cloud TTS REST API
            const response = await axios.post(
                `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_API_KEY}`,
                {
                    input: { text: text },
                    voice: { languageCode: 'tr-TR', name: voice },
                    audioConfig: { audioEncoding: 'MP3' }
                }
            );

            if (response.data.audioContent) {
                const buffer = Buffer.from(response.data.audioContent, 'base64');
                await fs.promises.writeFile(filePath, buffer);
                return `/audio-cache/${hash}.mp3`;
            } else {
                throw new Error('Google TTS yanıtında ses verisi yok.');
            }

        } catch (error) {
            console.error('Google TTS Error:', error);
            throw error;
        }
    }
}
