const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addConstraint() {
    console.log('Adding unique constraint to market_indices...');
    // Since we don't have rpc('exec_sql'), we'll try to use the query builder if possible
    // but adding a constraint REQUIRES raw SQL. 
    // Let's try to run it via a simple POST to the REST API if we can find an endpoint, 
    // or just tell the user to run it in Supabase Dashboard.

    // Wait, I can try to use the 'db' utility in the project which is already set up.
    console.log('Please run this in your Supabase SQL Editor:');
    console.log('ALTER TABLE market_indices ADD CONSTRAINT unique_market_indices UNIQUE (symbol, data_date);');
    console.log('ALTER TABLE tech_stocks ADD CONSTRAINT unique_tech_stocks UNIQUE (symbol, data_date);');
    console.log('ALTER TABLE commodities ADD CONSTRAINT unique_commodities UNIQUE (symbol, data_date);');
    console.log('ALTER TABLE turkey_economics ADD CONSTRAINT unique_turkey_economics UNIQUE (indicator_code);');
}

addConstraint();
