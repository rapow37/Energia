'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';

export default function TeacherGames() {
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('game_sessions').select('*').eq('host_id', user.id).order('created_at', { ascending: false });
      setSessions(data || []);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-surface p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Badge variant="new">GAME</Badge>
            <h1 className="font-display font-black text-3xl mt-1">Classroom Battle</h1>
            <p className="text-sm text-text-muted mt-1">Kelola sesi kuis live untuk kelas Anda.</p>
          </div>
          <Button onClick={() => router.push('/host/new')}>+ Mulai Battle</Button>
        </div>

        <Card className="p-6 border border-border space-y-4">
          <h2 className="font-display font-bold text-lg">Riwayat Sesi</h2>
          {sessions.length === 0 ? (
            <div className="text-sm text-text-muted py-6 text-center">Belum ada sesi. Mulai battle pertama Anda.</div>
          ) : (
            sessions.map((s) => (
              <div key={s.id} className="flex justify-between items-center p-3 rounded-xl bg-surface">
                <div className="font-mono font-bold">Kode: {s.join_code}</div>
                <Badge variant={s.status === 'COMPLETED' ? 'done' : 'continue'}>{s.status}</Badge>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
