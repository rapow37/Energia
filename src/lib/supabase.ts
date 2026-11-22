import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://detzoxktaqewiumyuwdd.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_XCUrtysC227CjSiQrIA1ng_JyZFkWlX';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
