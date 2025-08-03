import { createClient } from '@supabase/supabase-js';

// Project ID will be auto-injected during deployment
const SUPABASE_URL = 'https://project-id.supabase.co';
const SUPABASE_ANON_KEY = 'anon-key';

if(SUPABASE_URL == 'https://project-id.supabase.co' || SUPABASE_ANON_KEY == 'anon-key'){
  console.warn('Missing Supabase variables. Using localStorage for demo purposes.');
}

export default createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});