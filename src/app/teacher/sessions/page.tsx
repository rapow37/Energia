'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';

export default function TeacherSessions() {
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('game_sessions').select('*').eq('host_id', user.id).order('created_at', { ascending: false });
    setSessions(data || []);
  };

  return (
    <div className="min-h-screen bg-surface p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Badge variant="new">SESI</Badge>
            <h1 className="font-display font-black text-3xl mt-1">Sesi Classroom Battle</h1>
          </div>
          <Button onClick={() => router.push('/host/new')}>+ Sesi Baru</Button>
        </div>
        {sessions.length === 0 ? (
          <Card className="p-10 text-center border-dashed border-2 border-border text-text-muted space-y-3">
            <div>Belum ada sesi kuis aktif.</div>
            <Button size="sm" onClick={() => router.push('/host/new')}>Buat Sesi</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <Card key={s.id} className="p-5 flex justify-between items-center border border-border">
                <div>
                  <div className="font-mono font-bold text-lg">Kode: {s.join_code}</div>
                  <div className="text-xs text-text-muted mt-1">Dibuat: {new Date(s.created_at).toLocaleString('id-ID')}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={s.status === 'COMPLETED' ? 'done' : 'continue'}>{s.status}</Badge>
                  <Button size="sm" onClick={() => router.push(`/host/${s.id}`)}>Kelola</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
