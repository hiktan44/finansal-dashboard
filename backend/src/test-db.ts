
import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key Length:', supabaseKey?.length);

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    try {
        console.log('Attempting to select from assets...');
        const { data, error } = await supabase
            .from('assets')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Supabase Error:', error);
            console.error('Error Details:', JSON.stringify(error, null, 2));
        } else {
            console.log('Success! Data:', data);
        }
    } catch (err) {
        console.error('Unexpected Error:', err);
    }
}

test();
