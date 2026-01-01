
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load env vars from backend root
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { supabase } from '../utils/db.js';
import { fetchHistoricalYahooFinanceData } from '../utils/fetch.js';

const SYMBOLS = [
    'XU100.IS',
    'USDTRY=X',
    'GC=F',
    'CL=F',
    '^GSPC',
    'BTC-USD'
];

async function backfillHistory() {
    console.log('Starting historical data backfill...');
    console.log(`Target Symbols: ${SYMBOLS.join(', ')}`);

    for (const symbol of SYMBOLS) {
        console.log(`Fetching 6 months of data for ${symbol}...`);
        try {
            const data = await fetchHistoricalYahooFinanceData(symbol, '6m');

            if (data && data.length > 0) {
                console.log(`Fetched ${data.length} records for ${symbol}. Upserting to DB...`);

                // Process in chunks to avoid large payload errors if any
                const { error } = await supabase
                    .from('historical_data')
                    .upsert(data, { onConflict: 'symbol,data_date' });

                if (error) {
                    console.error(`Error saving data for ${symbol}:`, error);
                } else {
                    console.log(`Successfully saved data for ${symbol}.`);
                }
            } else {
                console.warn(`No data returned for ${symbol}`);
            }
        } catch (err) {
            console.error(`Failed to process ${symbol}:`, err);
        }

        // Brief pause to avoid rate limits
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log('Backfill completed.');
    process.exit(0);
}

backfillHistory().catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
});
