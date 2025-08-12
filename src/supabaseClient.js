import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_KEY;

console.log("Supabase URL:", supabaseUrl);
// Will log a bool, not the API key
console.log("Supabase Key present?", !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '❌ Supabase environment variables are missing. Check your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
