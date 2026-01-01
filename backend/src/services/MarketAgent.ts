
import Parser from 'rss-parser';
import { supabase } from '../utils/db.js';
import dotenv from 'dotenv';

dotenv.config();

const RSS_FEEDS = [
    { name: 'Bloomberg HT', url: 'https://www.bloomberght.com/rss' },
    { name: 'TRT Haber Ekonomi', url: 'https://www.trthaber.com/xml_mobile.php?tur=xml_genel&kategori=ekonomi' },
    { name: 'Dünya Gazetesi', url: 'https://www.dunya.com/rss' },
    { name: 'Investing.com TR', url: 'https://tr.investing.com/rss/news.rss' }, // Genel Finans
    { name: 'Investing TR Forex', url: 'https://tr.investing.com/rss/news_1.rss' }, // Forex
    { name: 'Anadolu Ajansı Ekonomi', url: 'https://www.aa.com.tr/tr/rss/default?cat=ekonomi' },
    { name: 'CNBC-e', url: 'https://www.cnbce.com/rss' }, // CNBC Türkiye (Eğer aktifse)
    { name: 'BigPara', url: 'https://bigpara.hurriyet.com.tr/rss' } // Reuters verilerini sıkça kullanır
];

const parser = new Parser();

interface NewsItem {
    title: string;
    link: string;
    source: string;
    pubDate: string;
    contentSnippet?: string;
}

export class MarketAgent {

    /**
     * 1. Collects Real-time News via RSS
     */
    async collectNews(): Promise<NewsItem[]> {
        console.log('📰 Agent Scanning News Sources...');
        let allNews: NewsItem[] = [];

        for (const feed of RSS_FEEDS) {
            try {
                const feedData = await parser.parseURL(feed.url);
                const items = feedData.items.slice(0, 5).map(item => ({
                    title: item.title || '',
                    link: item.link || '',
                    source: feed.name,
                    pubDate: item.pubDate || new Date().toISOString(),
                    contentSnippet: item.contentSnippet
                }));
                allNews = [...allNews, ...items];
                console.log(`✅ Collected ${items.length} news from ${feed.name}`);
            } catch (error) {
                console.error(`❌ Failed to fetch RSS from ${feed.name}:`, error);
            }
        }
        return allNews;
    }

    /**
     * 2. Collects Latest Market Data from DB
     */
    async collectMarketData() {
        console.log('📊 Agent Fetching Market Data...');
        // Fetch latest BIST, USD, Gold, etc. from database
        // This assumes we have these tables populated by the other cron jobs
        const { data: indices } = await supabase
            .from('market_indices')
            .select('*')
            .order('data_date', { ascending: false })
            .limit(5);

        const { data: commodities } = await supabase
            .from('commodities')
            .select('*')
            .order('data_date', { ascending: false })
            .limit(5);

        return { indices, commodities };
    }

    /**
     * 3. Brain: Analyzes Data using OpenRouter (Gemini)
     */
    async analyze(news: NewsItem[], marketData: any) {
        console.log('🧠 Agent Analyzing Data...');

        if (!process.env.OPENROUTER_API_KEY) {
            throw new Error('OPENROUTER_API_KEY is missing');
        }

        const context = `
      MARKET DATA:
      ${JSON.stringify(marketData, null, 2)}

      LATEST FINANCIAL NEWS HEADLINES:
      ${news.map(n => `- [${n.source}] ${n.title} (${n.pubDate})`).join('\n')}
    `;

        const systemPrompt = `
      You are an expert Senior Financial Analyst for the Turkish Market.
      Your job is to produce a "Daily Market Analysis" report based REAL-TIME data provided.
      
      Requirements:
      1. analyze the provided Market Data and News.
      2. Act as a professional analyst working for a major bank.
      3. CITE YOUR SOURCES. When mentioning a news item, cite the source (e.g. "Bloomberg HT'nin haberine göre...").
      4. Discuss:
         - BIST 100 Technical & Fundamental Outlook
         - Precious Metals (Gold/Silver) & Commodities
         - Global Markets & Geopolitics
         - Macro Data Impact (Inflation, Fed/TCMB decisions)
      5. Output MUST be valid JSON in the following format:
      {
        "market_summary": "General summary of the day...",
        "technical_analysis": "Technical levels, supports/resistances for BIST/USDTRY...",
        "sector_highlights": "Which sectors are moving and why?",
        "market_forecast": "Predictions for the next session...",
        "sentiment_score": "7.5", // 0-10 string
        "volatility_index": "High", // or number string
        "top_movers": {
          "gainers": [{"symbol": "X", "change": 2.5, "reason": "why"}],
          "losers": [{"symbol": "Y", "change": -1.2, "reason": "why"}]
        }
      }
      
      IMPORTANT:
      - Reply ONLY with the JSON.
      - Language: TURKISH (Türkçe).
      - Be realistic and analytical.
    `;

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "google/gemini-3-flash-preview", // Upgraded to Gemini 3 Flash Preview as requested
                    "messages": [
                        { "role": "system", "content": systemPrompt },
                        { "role": "user", "content": context }
                    ],
                    "temperature": 0.4
                })
            });

            const json = await response.json() as any;
            const content = json.choices[0].message.content;

            // Clean JSON if md blocks exist
            const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJson);

        } catch (error) {
            console.error('AI Analysis Failed:', error);
            throw error;
        }
    }

    /**
     * 4. GENERATES "WHAT-IF" SCENARIO SIMULATION
     * Uses Generative AI to predict market impact of a hypothetical scenario
     */
    async generateScenarioSimulation(scenario: string) {
        console.log(`🧠 Agent Simulating Scenario: "${scenario}"`);

        if (!process.env.OPENROUTER_API_KEY) {
            throw new Error('OPENROUTER_API_KEY is missing');
        }

        const systemPrompt = `
      You are an advanced AI Financial Risk Simulator.
      Your job is to simulate the impact of a hypothetical economic/geopolitical scenario on Turkish and Global markets.
      
      SCENARIO: "${scenario}"
      
      Requirements:
      1. Analyze the scenario's potential impact on:
         - BIST 100 & Major Turkish Stocks
         - USD/TRY & EUR/TRY
         - Gold (XAU) & Commodities
         - Turkish CDS & Bond Rates
      2. Provide a realistic "Confidence Score" (0-100%) regarding the likelihood of these outcomes.
      3. Assign an overall Risk Level (Low, Medium, High, Extreme).
      4. Output MUST be valid JSON in the following format:
      {
        "scenario": "${scenario}",
        "summary": "Detailed explanation of the chain reaction...",
        "riskLevel": "High", 
        "predictions": [
          { "asset": "BIST 100", "predictedChange": "-5%", "confidence": 85, "reasoning": "Foreign outflow..." },
          { "asset": "USD/TRY", "predictedChange": "+3%", "confidence": 90, "reasoning": "Central bank reaction..." }
        ],
        "opportunities": ["Sector X might benefit...", "Safe haven assets..."],
        "disclaimer": "This is an AI simulation for educational purposes only."
      }
      
      IMPORTANT:
      - Reply ONLY with the JSON.
      - Language: TURKISH (Türkçe).
      - Be analytical and precise.
    `;

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "google/gemini-3-flash-preview",
                    "messages": [
                        { "role": "system", "content": systemPrompt },
                        { "role": "user", "content": `Simulate this scenario: ${scenario}` }
                    ],
                    "temperature": 0.5
                })
            });

            const json = await response.json() as any;
            const content = json.choices[0].message.content;

            // Clean JSON
            const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJson);

        } catch (error) {
            console.error('AI Simulation Failed:', error);
            throw error;
        }
    }

    /**
     * Main Orchestrator
     */
    async runDailyAnalysis() {
        const news = await this.collectNews();
        const marketData = await this.collectMarketData();

        const analysisResult = await this.analyze(news, marketData);

        // Save to DB
        const { data, error } = await supabase
            .from('daily_analysis')
            .insert({
                analysis_date: new Date().toISOString(),
                market_summary: analysisResult.market_summary,
                technical_analysis: analysisResult.technical_analysis,
                sector_highlights: analysisResult.sector_highlights,
                market_forecast: analysisResult.market_forecast,
                sentiment_score: analysisResult.sentiment_score,
                volatility_index: analysisResult.volatility_index,
                top_movers: analysisResult.top_movers,
                raw_news_sources: news // Store sources for transparency
            })
            .select()
            .single();

        if (error) {
            console.error('Failed to save analysis to DB:', error);
            throw error;
        }

        console.log('✅ Daily Analysis Generated & Saved:', data.id);
        return data;
    }
}
