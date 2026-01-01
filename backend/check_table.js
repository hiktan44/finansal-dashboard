import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('--- Database Check ---');

async function checkTable(tableName) {
    console.log(`Checking ${tableName} table...`);
    const { data, error } = await supabase.from(tableName).select('*').limit(1);
    if (error) {
        console.error(`Error selecting from ${tableName}:`, error.message);
    } else {
        console.log(`Success selecting from ${tableName}:`, data ? `Found ${data.length} rows` : 'No data');
    }
}

await checkTable('economic_data');
await checkTable('market_indices');
await checkTable('tech_stocks');
await checkTable('commodities');
await checkTable('turkey_economics');

console.log('--- Check Complete ---');
