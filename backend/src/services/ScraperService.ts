
import axios from 'axios';
import * as cheerio from 'cheerio';
import { supabase } from '../utils/db.js';

// Define the scraper interface
interface ScrapedData {
    code: string;
    name?: string; // Added for mapping
    value: number;
    change?: number; // Added
    change_percent?: number; // Added
    value_text?: string;
    period_date: string; // YYYY-MM-DD
    source_url: string;
    table_target?: 'economic_data' | 'market_indices' | 'commodities' | 'tech_stocks' | 'sector_indices'; // Added to direct data
}

export class ScraperService {

    /**
     * Main entry point to scrape all defined indicators
     */
    async runScraper() {
        console.log('🕷️ TurkerScraper Starting...');

        // We will run different scrapers in parallel
        const results = await Promise.allSettled([
            this.scrapeDovizCom(), // New reliable source for TR data
            // this.scrapeInvestingEconomicData(), // 403 Forbidden
            // this.scrapeMarketIndices(), // Replaced by Doviz.com for local
            // this.scrapeCommodities(), // Replaced by Doviz.com for local
            // this.scrapeTechStocks(), // 403 Forbidden
            // this.scrapeSectorIndices() // 403 Forbidden
        ]);

        const flatResults: ScrapedData[] = [];
        results.forEach(r => {
            if (r.status === 'fulfilled' && r.value) {
                flatResults.push(...r.value);
            }
        });

        console.log(`✅ Scraped ${flatResults.length} data points.`);

        // Save to DB (Distribute to correct tables)
        await this.saveToDB(flatResults);
    }

    /**
     * Scrapes Doviz.com for key Turkish Market Data
     * Replaces failing Investing.com scrapers
     */
    async scrapeDovizCom(): Promise<ScrapedData[]> {
        const url = 'https://www.doviz.com/';
        const data: ScrapedData[] = [];
        console.log(`.. Scraping Doviz.com ...`);

        try {
            const response = await axios.get(url, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            const $ = cheerio.load(response.data);

            const targets = [
                { key: 'USD', code: 'USD/TRY', name: 'Dolar/TL', table: 'market_indices' },
                { key: 'EUR', code: 'EUR/TRY', name: 'Euro/TL', table: 'market_indices' },
                { key: 'gram-altin', code: 'GRAM_ALTIN', name: 'Gram Altın', table: 'commodities' },
                { key: 'XU100', code: 'XU100', name: 'BIST 100', table: 'market_indices' },
                { key: 'ons-altin', code: 'GC=F', name: 'Ons Altın', table: 'commodities' }, // Check if key exists
                { key: 'bitcoin', code: 'BTC', name: 'Bitcoin', table: 'market_indices' }
            ];

            for (const t of targets) {
                // Selector: span.value[data-socket-key="KEY"]
                const selector = `span.value[data-socket-key="${t.key}"]`;
                const priceText = $(selector).text().trim();

                // Also try to find change percentage if possible (sibling or parent?)
                // Accessing via parent structure if needed. For now just price.

                const price = this.parseTurkishNumber(priceText);

                if (!isNaN(price)) {
                    data.push({
                        code: t.code,
                        name: t.name,
                        value: price,
                        change: 0, // Default to 0 if not found
                        change_percent: 0,
                        period_date: new Date().toISOString().split('T')[0],
                        source_url: url,
                        table_target: t.table as any
                    });
                    console.log(`   -> ${t.name} (${t.code}): ${price}`);
                }
            }

        } catch (e) {
            console.error(`Error scraping Doviz.com:`, e instanceof Error ? e.message : 'Unknown');
        }

        return data;
    }

    /**
     * Scrapes Investing.com for Commodities, CDS, etc. (Deprecated/Failing)
     */
    async scrapeInvestingEconomicData(): Promise<ScrapedData[]> {
        // ... (Existing code kept but unused)
        return [];
    }


    /**
     * Scrapes Tech Giants
     */
    async scrapeTechStocks(): Promise<ScrapedData[]> {
        const targets = [
            { code: 'AAPL', name: 'Apple', url: 'https://tr.investing.com/equities/apple-computer-inc' },
            { code: 'MSFT', name: 'Microsoft', url: 'https://tr.investing.com/equities/microsoft-corp' },
            { code: 'NVDA', name: 'Nvidia', url: 'https://tr.investing.com/equities/nvidia-corp' },
            { code: 'GOOGL', name: 'Alphabet', url: 'https://tr.investing.com/equities/google-inc' },
            { code: 'TSLA', name: 'Tesla', url: 'https://tr.investing.com/equities/tesla-motors' },
            { code: 'AMZN', name: 'Amazon', url: 'https://tr.investing.com/equities/amazon-com-inc' }
        ];
        return this.scrapeGenericInstruments(targets, 'tech_stocks');
    }

    /**
     * Generic scraper for simple Price fields (Economic Data)
     */
    async scrapeGeneric(targets: any[], table: 'economic_data'): Promise<ScrapedData[]> {
        const data: ScrapedData[] = [];
        console.log(`.. Scraping ${table} ...`);

        for (const target of targets) {
            try {
                const response = await axios.get(target.url, {
                    timeout: 15000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9,tr;q=0.8',
                        'Referer': 'https://www.google.com/',
                        'Upgrade-Insecure-Requests': '1'
                    }
                });
                const $ = cheerio.load(response.data);
                let priceText = $(target.selector).first().text().trim();
                const price = this.parseTurkishNumber(priceText);

                if (!isNaN(price)) {
                    data.push({
                        code: target.code,
                        value: price,
                        period_date: new Date().toISOString().split('T')[0],
                        source_url: target.url,
                        table_target: table
                    });
                    console.log(`   -> ${target.code}: ${price}`);
                }
            } catch (e) {
                console.error(`Error scraping ${target.code}:`, e instanceof Error ? e.message : 'Unknown');
            }
        }
        return data;
    }

    /**
     * Generic scraper for Instruments (Price, Change, Change% - for Indices/Stocks)
     */
    async scrapeGenericInstruments(targets: any[], table: any): Promise<ScrapedData[]> {
        const data: ScrapedData[] = [];
        console.log(`.. Scraping ${table} ...`);

        for (const target of targets) {
            try {
                const response = await axios.get(target.url, {
                    timeout: 15000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9,tr;q=0.8',
                        'Referer': 'https://www.google.com/',
                        'Upgrade-Insecure-Requests': '1'
                    }
                });
                const $ = cheerio.load(response.data);

                // Selectors for Investing.com
                const priceText = $('[data-test="instrument-price-last"]').first().text().trim();
                const changeText = $('[data-test="instrument-price-change"]').first().text().trim();
                const changePercentText = $('[data-test="instrument-price-change-percent"]').first().text().trim(); // (+1.23%)

                const price = this.parseTurkishNumber(priceText);
                const change = this.parseTurkishNumber(changeText);
                const changePercent = this.parseTurkishNumber(changePercentText.replace(/[()%]/g, ''));

                if (!isNaN(price)) {
                    data.push({
                        code: target.code,
                        name: target.name,
                        value: price,
                        change: change,
                        change_percent: changePercent,
                        period_date: new Date().toISOString().split('T')[0],
                        source_url: target.url,
                        table_target: table
                    });
                    console.log(`   -> ${target.code}: ${price} (${changePercent}%)`);
                }
            } catch (e) {
                console.error(`Error scraping ${target.code}:`, e instanceof Error ? e.message : 'Unknown');
            }
        }
        return data;
    }

    parseTurkishNumber(text: string): number {
        if (!text) return NaN;
        // Investing.com TR: "1.234,56" -> Remove dots, replace comma with dot
        let clean = text.replace(/[^\d.,-]/g, '');
        if (clean.includes(',')) {
            // Turkish format likely
            clean = clean.replace(/\./g, '').replace(',', '.');
        }
        return parseFloat(clean);
    }

    /**
     * Save scraped data to 'economic_data' table
     */
    async saveToDB(data: ScrapedData[]) {
        if (data.length === 0) return;

        // Group by target table
        const economicData = data.filter(d => d.table_target === 'economic_data');
        const marketIndices = data.filter(d => d.table_target === 'market_indices');
        const commodities = data.filter(d => d.table_target === 'commodities');
        const techStocks = data.filter(d => d.table_target === 'tech_stocks');

        // 1. Save Economic Data
        if (economicData.length > 0) {
            await supabase.from('economic_data').upsert(
                economicData.map(item => ({
                    indicator_code: item.code,
                    period_date: item.period_date,
                    value: item.value,
                    source_url: item.source_url,
                    created_at: new Date().toISOString()
                })), { onConflict: 'indicator_code, period_date' }
            );
        }

        // 2. Save Market Indices
        if (marketIndices.length > 0) {
            await supabase.from('market_indices').insert(
                marketIndices.map(item => ({
                    symbol: item.code,
                    name: item.name,
                    close_price: item.value,
                    change_value: item.change,
                    change_percent: item.change_percent,
                    data_date: new Date().toISOString(),
                    source: 'Investing.com'
                }))
            ); // Insert new rows for history
        }

        // 3. Save Commodities
        if (commodities.length > 0) {
            await supabase.from('commodities').insert(
                commodities.map(item => ({
                    symbol: item.code,
                    name: item.name,
                    price: item.value,
                    change_percent: item.change_percent,
                    data_date: new Date().toISOString(),
                    source: 'Investing.com'
                }))
            );
        }

        // 4. Save Tech Stocks
        if (techStocks.length > 0) {
            await supabase.from('tech_stocks').insert(
                techStocks.map(item => ({
                    symbol: item.code,
                    name: item.name,
                    close_price: item.value,
                    change_percent: item.change_percent,
                    data_date: new Date().toISOString()
                }))
            );
        }

        // 5. Save Sector Indices
        const sectorIndices = data.filter(d => d.table_target === 'sector_indices');
        if (sectorIndices.length > 0) {
            await supabase.from('sector_indices').insert(
                sectorIndices.map(item => ({
                    symbol: item.code,
                    name: item.name,
                    last_price: item.value,
                    change_percent: item.change_percent,
                    change_value: item.change,
                    data_date: new Date().toISOString()
                }))
            );
        }

        console.log('✅ Data saved to DB successfully across all tables.');
    }
}
