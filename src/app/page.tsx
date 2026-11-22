'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getDashboardRoute } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace('/register');
        return;
      }

      const metaRole = (session.user as any)?.user_metadata?.role;
      const route = await getDashboardRoute(session.user.id, metaRole);
      router.replace(route);
    })();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center space-y-3">
        <div className="text-5xl">⚡</div>
        <div className="font-display font-extrabold text-2xl text-navy-deep">ENERGIA</div>
        <div className="text-sm text-text-muted">Memuat...</div>
      </div>
    </main>
  );
}
