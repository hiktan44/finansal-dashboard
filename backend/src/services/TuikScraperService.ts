import axios from 'axios';
import * as cheerio from 'cheerio';
import { supabase } from '../utils/db.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TuikBulletin {
    date: string;
    title: string;
    summary: string;
    url: string;
}

export class TuikScraperService {
    private static BASE_URL = 'https://data.tuik.gov.tr';

    public static CATEGORIES = {
        INFLATION: 106,
        LABOR: 108,
        TRADE: 104,
        GROWTH: 101
    };

    static async getLatestBulletins(categoryId: number, count: number = 5, page?: number, useCurl: boolean = false, years?: number[]): Promise<TuikBulletin[]> {
        try {
            const formData = new URLSearchParams();
            formData.append('UstId', categoryId.toString());
            formData.append('DilId', '1');
            if (page !== undefined) formData.append('Page', page.toString());
            formData.append('Count', count.toString());

            if (years && years.length > 0) {
                years.forEach(year => formData.append('VeriYillari', year.toString()));
            }

            console.log(`fetching bulletins for category ${categoryId}, page ${page ?? 'default'}, years: ${years ? years.join(',') : 'all'}...`);
            let htmlContent = '';

            if (useCurl) {
                console.log(`Forcing CURL for category ${categoryId}...`);
                htmlContent = await this.fetchWithCurl(categoryId, count, page, years);
            } else {
                try {
                    const response = await axios.post(`${this.BASE_URL}/Kategori/GetHaberBultenleri`, formData, {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Origin': 'https://data.tuik.gov.tr',
                            'Referer': `https://data.tuik.gov.tr/Kategori/GetKategori?p=enflasyon-ve-fiyat-${categoryId}&dil=1`
                        },
                        timeout: 20000
                    });
                    console.log(`Received response from TUIK (Status: ${response.status})`);
                    htmlContent = response.data;
                } catch (axiosError) {
                    console.warn(`Axios failed for category ${categoryId}, trying CURL fallback... (${axiosError instanceof Error ? axiosError.message : 'Unknown'})`);
                    htmlContent = await this.fetchWithCurl(categoryId, count, page, years);
                }
            }

            if (!htmlContent) throw new Error('No content retrieved from TUIK');

            const $ = cheerio.load(htmlContent);
            const bulletins: TuikBulletin[] = [];

            $('div.bulletin').each((_, element) => {
                const dateText = $(element).find('small span').text().trim();
                const link = $(element).find('a');
                const title = link.text().trim();
                const url = link.attr('href') || '';
                const summary = $(element).find('p.text-secondary').text().trim();

                bulletins.push({
                    date: dateText,
                    title,
                    summary,
                    url: url.startsWith('/') ? `${this.BASE_URL}${url}` : url
                });
            });
            console.log(`Parsed ${bulletins.length} bulletins.`);
            return bulletins;
        } catch (error) {
            console.error(`Error fetching TUIK bulletins for category ${categoryId}:`, error instanceof Error ? error.message : error);
            return [];
        }
    }

    private static async fetchWithCurl(categoryId: number, count: number, page?: number, years?: number[]): Promise<string> {
        try {
            let body = `UstId=${categoryId}&DilId=1&Count=${count}`;
            if (page !== undefined) body += `&Page=${page}`;
            if (years && years.length > 0) years.forEach(year => body += `&VeriYillari=${year}`);

            // Important: Use single quotes for outer wrapping of command arguments to handle special chars
            const cmd = `curl -s -X POST '${this.BASE_URL}/Kategori/GetHaberBultenleri' \
                -d '${body}' \
                -H 'Content-Type: application/x-www-form-urlencoded' \
                -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' \
                -H 'Origin: https://data.tuik.gov.tr' \
                -H 'Referer: https://data.tuik.gov.tr'`;

            console.log(`Executing failover CURL command for category ${categoryId}...`);
            const { stdout, stderr } = await execAsync(cmd, { maxBuffer: 10 * 1024 * 1024 });
            if (stderr && !stdout) console.warn('CURL stderr:', stderr);
            return stdout;
        } catch (e) {
            console.error('CURL fallback failed:', e);
            return '';
        }
    }

    private static async upsertIndicator(code: string, name: string, value: number, dateStr: string, category: string = 'Para Politikası') {
        const monthMap: { [key: string]: string } = {
            'Ocak': '01', 'Şubat': '02', 'Mart': '03', 'Nisan': '04', 'Mayıs': '05', 'Haziran': '06',
            'Temmuz': '07', 'Ağustos': '08', 'Eylül': '09', 'Ekim': '10', 'Kasım': '11', 'Aralık': '12'
        };

        const parts = dateStr.split(' ');
        let formattedDate = new Date().toISOString().split('T')[0];

        if (parts.length >= 3) {
            const day = parts[0].padStart(2, '0');
            const month = monthMap[parts[1]] || '01';
            const year = parts[2];
            formattedDate = `${year}-${month}-${day}`;
        }

        const { error } = await supabase.from('turkey_economics').upsert({
            indicator_code: code,
            indicator_name: name,
            current_value: value,
            period_date: formattedDate,
            source: 'TÜİK',
            last_updated: new Date().toISOString(),
            indicator_category: category
        }, { onConflict: 'indicator_code' });

        if (error) console.error('Supabase upsert error:', error);
        else console.log(`Successfully updated ${category} data: ${name} - ${value}% (${formattedDate})`);
    }

    static async updateInflationData() {
        console.log('Starting TUIK Inflation update...');
        const bulletins = await this.getLatestBulletins(this.CATEGORIES.INFLATION, 20);

        // Match for Tüketici Fiyat Endeksi using simple includes + lower case fallback
        const inflationBulletin = bulletins.find(b => {
            const title = b.title;
            // Try strict match first then lowercase
            return title.includes('Tüketici Fiyat Endeksi') && !title.includes('Üretici');
        });

        if (!inflationBulletin) {
            console.log('No recent Inflation bulletin found. Available:', bulletins.map(b => b.title));
        } else {
            console.log('Found Bulletin:', inflationBulletin.title);
            console.log('Summary:', inflationBulletin.summary);

            const annualMatch = inflationBulletin.summary.match(/yıllık %([\d,]+)/);
            const monthlyMatch = inflationBulletin.summary.match(/aylık %([\d,]+)/);

            if (annualMatch) {
                const value = parseFloat(annualMatch[1].replace(',', '.'));
                await this.upsertIndicator('TUFE', 'Tüketici Enflasyonu (Yıllık)', value, inflationBulletin.date, 'Para Politikası');
                console.log(`✅ Updated TUFE (Yearly): ${value}%`);
            } else {
                console.log('❌ Could not parse Annual Inflation rate from summary');
            }

            if (monthlyMatch) {
                const value = parseFloat(monthlyMatch[1].replace(',', '.'));
                await this.upsertIndicator('TUFE_MONTHLY', 'Tüketici Enflasyonu (Aylık)', value, inflationBulletin.date, 'Para Politikası');
                console.log(`✅ Updated TUFE (Monthly): ${value}%`);
            }
        }
    }

    static async updateUnemploymentData() {
        console.log('Starting TUIK Unemployment update...');

        const currentYear = new Date().getFullYear();
        const years = [currentYear + 1, currentYear, currentYear - 1];

        const bulletins = await this.getLatestBulletins(this.CATEGORIES.LABOR, 20, undefined, true, years);
        console.log(`Received ${bulletins.length} bulletins for Unemployment.`);

        // SIMPLE MATCH: "İşgücü İstatistikleri" (Exact Case or check first word)
        const laborBulletin = bulletins.find(b => b.title.includes('İşgücü İstatistikleri'));

        if (!laborBulletin) {
            console.log('No recent Labor bulletin found. Available:', bulletins.map(b => b.title));
            // Fallback: log hex codes of titles to debug
            bulletins.forEach(b => {
                console.log(`Title: ${b.title}, Hex: ${Buffer.from(b.title).toString('hex')}`);
            });
            return;
        }

        console.log('Found Bulletin:', laborBulletin.title);
        console.log('Summary:', laborBulletin.summary);

        const unemploymentMatch = laborBulletin.summary.match(/işsizlik oranı %([\d,]+)/i);

        if (unemploymentMatch) {
            const value = parseFloat(unemploymentMatch[1].replace(',', '.'));
            await this.upsertIndicator('UNEMPLOYMENT_RATE', 'İşsizlik Oranı', value, laborBulletin.date, 'İstihdam');
            console.log(`✅ Updated UNEMPLOYMENT_RATE: ${value}%`);
        } else {
            console.log('❌ Could not parse Unemployment rate from summary');
        }
    }
}
