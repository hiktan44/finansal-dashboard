import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTuikData() {
    const { data, error } = await supabase.from('macro_data').select('*').eq('source', 'TUIK').limit(5);
    if (error) {
        console.error(error);
    } else {
        console.log('TUIK data count sample:', data.length);
        console.log('Sample TUIK data:', data);
    }
}

checkTuikData();
