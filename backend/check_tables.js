import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    const tables = [
        'macro_data',
        'economic_data',
        'market_indices',
        'assets',
        'price_history',
        'portfolio_holdings',
        'user_alerts',
        'turkey_economics',
        'tefas_funds'
    ];

    console.log('Checking tables...');
    for (const table of tables) {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (!error) {
            console.log(`✅ ${table} exists`);
        } else {
            console.log(`❌ ${table} error: ${error.message} (code: ${error.code})`);
        }
    }
}

listTables();
