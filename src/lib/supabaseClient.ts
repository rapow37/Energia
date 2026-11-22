import { createClient } from '@supabase/supabase-js';

// Fallback placeholders keep server-side prerendering from crashing when the
// env vars are not present (e.g. during CI build before they are configured).
// At runtime the real NEXT_PUBLIC_* values must be set in the hosting env.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
