
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
            this.scrapeInvestingEconomicData(),
            this.scrapeMarketIndices(),
            this.scrapeCommodities(),
            this.scrapeTechStocks(),
            this.scrapeSectorIndices()
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
     * Scrapes Investing.com for Commodities, CDS, etc.
     * Note: Investing.com protects against scraping often. 
     * This is a best-effort implementation using public pages.
     */
    /**
     * Scrapes specific economic indicators manually requested
     */
    async scrapeInvestingEconomicData(): Promise<ScrapedData[]> {
        const targets = [
            { code: 'TR_CDS', url: 'https://tr.investing.com/rates-bonds/turkey-5-years-cds-historical-data', selector: '#last_last' },
            { code: 'GL_COPPER', url: 'https://tr.investing.com/commodities/copper', selector: '[data-test="instrument-price-last"]' },
            { code: 'GL_ALUMINUM', url: 'https://tr.investing.com/commodities/aluminum', selector: '[data-test="instrument-price-last"]' },
            { code: 'GL_ZINC', url: 'https://tr.investing.com/commodities/zinc', selector: '[data-test="instrument-price-last"]' },
            { code: 'GL_LME', url: 'https://tr.investing.com/indices/lmex', selector: '[data-test="instrument-price-last"]' }
        ];
        return this.scrapeGeneric(targets, 'economic_data');
    }

    /**
     * Scrapes Market Indices (BIST, SPX, etc.)
     */
    async scrapeMarketIndices(): Promise<ScrapedData[]> {
        const targets = [
            { code: 'XU100', name: 'BIST 100', url: 'https://tr.investing.com/indices/ise-100' },
            { code: 'USD/TRY', name: 'Dolar/TL', url: 'https://tr.investing.com/currencies/usd-try' },
            { code: 'EUR/TRY', name: 'Euro/TL', url: 'https://tr.investing.com/currencies/eur-try' },
            { code: 'SPX', name: 'S&P 500', url: 'https://tr.investing.com/indices/us-spx-500' },
            { code: 'IXIC', name: 'Nasdaq', url: 'https://tr.investing.com/indices/nasdaq-composite' },
            { code: 'DJI', name: 'Dow Jones', url: 'https://tr.investing.com/indices/us-30' }
        ];
        return this.scrapeGenericInstruments(targets, 'market_indices');
    }

    /**
     * Scrapes Sector Indices (BIST Sectors)
     */
    async scrapeSectorIndices(): Promise<ScrapedData[]> {
        const targets = [
            { code: 'XBANK', name: 'Bankacılık', url: 'https://tr.investing.com/indices/ise-banka' },
            { code: 'XUSIN', name: 'Sanayi', url: 'https://tr.investing.com/indices/ise-industrials' },
            { code: 'XUTEK', name: 'Teknoloji', url: 'https://tr.investing.com/indices/ise-technology' },
            { code: 'XULAS', name: 'Ulaştırma', url: 'https://tr.investing.com/indices/ise-transportation' },
            { code: 'XTRZM', name: 'Turizm', url: 'https://tr.investing.com/indices/ise-tourism' },
            { code: 'XHOLD', name: 'Holding', url: 'https://tr.investing.com/indices/ise-investment' },
            { code: 'XGMYO', name: 'Gayrimenkul', url: 'https://tr.investing.com/indices/ise-real-estate-inv-trust' }
        ];
        // Note: We use 'market_indices' type but will save to sector_indices table in saveToDB
        // or actually let's use a new type
        return this.scrapeGenericInstruments(targets, 'sector_indices' as any);
    }

    /**
     * Scrapes Commodities (Gold, Oil)
     */
    async scrapeCommodities(): Promise<ScrapedData[]> {
        const targets = [
            { code: 'GC=F', name: 'Ons Altın', url: 'https://tr.investing.com/commodities/gold' },
            { code: 'BRENT', name: 'Brent Petrol', url: 'https://tr.investing.com/commodities/brent-oil' },
            { code: 'CL=F', name: 'Ham Petrol', url: 'https://tr.investing.com/commodities/crude-oil' },
            { code: 'SI=F', name: 'Gümüş', url: 'https://tr.investing.com/commodities/silver' }
        ];
        return this.scrapeGenericInstruments(targets, 'commodities');
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
