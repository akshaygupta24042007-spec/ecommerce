import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load .env file explicitly
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Checking environment variables...');
if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env file');
  process.exit(1);
}

console.log('Supabase URL found:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Fetching store settings...');
  const { data, error } = await supabase.from('store_settings').select('*');
  
  if (error) {
    console.error('Error fetching data:', error.message);
    return;
  }

  console.log('Data fetched successfully:');
  console.log(JSON.stringify(data, null, 2));
}

run().catch(err => {
  console.error('Unexpected error:', err);
});
