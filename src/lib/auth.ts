import { supabase } from './supabaseClient';

export async function getDashboardRoute(userId: string, metadataRole?: string | null): Promise<string> {
  // 1. First check metadata role (set during sign-up/user-metadata)
  if (metadataRole === 'teacher') {
    // Update profile role from metadata so DB stays in sync
    await supabase.from('profiles').update({ role: 'teacher' }).eq('id', userId);
    return '/teacher/dashboard';
  }
  if (metadataRole === 'student') {
    await supabase.from('profiles').update({ role: 'student' }).eq('id', userId);
    return '/student/dashboard';
  }

  // 2. Fallback to DB profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  return profile?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
}