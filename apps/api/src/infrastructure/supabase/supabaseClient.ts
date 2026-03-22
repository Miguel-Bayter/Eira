import { createClient } from '@supabase/supabase-js';
import { loadApiEnv, requireEnv } from '../../config/env';

loadApiEnv();

const supabaseUrl = requireEnv('SUPABASE_URL');
const supabaseAnonKey = requireEnv('SUPABASE_ANON_KEY');

// Shared singleton — avoids duplicate client instantiation across the app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
