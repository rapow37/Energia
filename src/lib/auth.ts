import { supabase } from './supabaseClient';

export async function getDashboardRoute(userId: string): Promise<string> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  return profile?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
}
