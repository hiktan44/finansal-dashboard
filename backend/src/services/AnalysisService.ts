import { supabase } from '../utils/db.js';
import { fetchHistoricalYahooFinanceData } from '../utils/fetch.js';

export class AnalysisService {

    // Pearson Korelasyon Katsayısı Hesaplama
    private calculateCorrelation(x: number[], y: number[]): number {
        const n = x.length;
        if (n !== y.length || n === 0) return 0;

        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        if (denominator === 0) return 0;
        return numerator / denominator;
    }

    // Veritabanından geçmiş verileri çek ve hizala
    async getCorrelationMatrix(symbols: string[], periodDays: number = 90) {
        const matrix: any = {};
        const seriesData: Record<string, { date: string, price: number }[]> = {};

        // 1. Verileri Çek (Eksikse Yahoo'dan tamamla)
        // 1. Verileri Çek (Eksikse Yahoo'dan tamamla)
        // Paralel işleme alarak hızı artır
        await Promise.all(symbols.map(async (symbol) => {
            try {
                // DB'den kontrol et
                const { data: dbData } = await supabase
                    .from('historical_data')
                    .select('data_date, price')
                    .eq('symbol', symbol)
                    .order('data_date', { ascending: true })
                    .gte('data_date', new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString());

                if (dbData && dbData.length > 20) {
                    seriesData[symbol] = dbData.map(d => ({ date: d.data_date.split('T')[0], price: d.price }));
                } else {
                    // Yahoo'dan çek (Son 6 ay - 1y)
                    console.log(`Fetching missing historical data for ${symbol}...`);
                    const yahooData = await fetchHistoricalYahooFinanceData(symbol, '1y');

                    if (yahooData.length > 0) {
                        // DB'ye kaydet (Background)
                        supabase.from('historical_data')
                            .upsert(yahooData, { onConflict: 'symbol,data_date' })
                            .then(({ error }) => {
                                if (error) console.error(`Error upserting ${symbol}:`, error.message);
                            });

                        seriesData[symbol] = yahooData
                            .filter((d: any) => new Date(d.data_date) >= new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000))
                            .map((d: any) => ({ date: d.data_date, price: d.price }));
                    } else {
                        console.warn(`No data found for ${symbol}`);
                        seriesData[symbol] = [];
                    }
                }
            } catch (err) {
                console.error(`Error processing ${symbol}:`, err);
                seriesData[symbol] = [];
            }
        }));

        // 2. Tarihleri Hizala (Intersection)
        // Tüm sembollerin ortak tarihlerini bul
        let commonDates = seriesData[symbols[0]]?.map(d => d.date) || [];
        for (let i = 1; i < symbols.length; i++) {
            const dates = new Set(seriesData[symbols[i]]?.map(d => d.date) || []);
            commonDates = commonDates.filter(d => dates.has(d));
        }

        // Yeterli ortak veri yoksa hata veya boş dön
        if (commonDates.length < 10) {
            console.error('Insufficient common data points:', commonDates.length);
            return { error: "Yeterli ortak tarihli veri bulunamadı. Lütfen daha sonra tekrar deneyin." };
        }

        // Fiyat serilerini oluştur (Sadece ortak tarihler)
        const alignedPrices: Record<string, number[]> = {};
        for (const symbol of symbols) {
            const priceMap = new Map(seriesData[symbol].map(d => [d.date, d.price]));
            alignedPrices[symbol] = commonDates.map(date => priceMap.get(date)!);
        }

        // 3. Matrisi Hesapla
        for (const sym1 of symbols) {
            matrix[sym1] = {};
            for (const sym2 of symbols) {
                if (sym1 === sym2) {
                    matrix[sym1][sym2] = 1;
                } else {
                    const corr = this.calculateCorrelation(alignedPrices[sym1], alignedPrices[sym2]);
                    matrix[sym1][sym2] = parseFloat(corr.toFixed(2));
                }
            }
        }

        return {
            matrix,
            dates: commonDates,
            sampleSize: commonDates.length
        };
    }
}
