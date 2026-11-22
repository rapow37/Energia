'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function StudentProgress() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-surface p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <Badge variant="new">PROGRES</Badge>
          <h1 className="font-display font-black text-3xl mt-1">Pencapaian & Statistik</h1>
        </div>

        <Card className="p-8 border border-border flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center font-black text-3xl">
            {profile?.full_name ? profile.full_name[0] : 'S'}
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl">{profile?.full_name || 'Siswa'}</h2>
            <div className="flex gap-2 mt-2">
              <Badge variant="xp">⚡ {profile?.xp || 0} XP</Badge>
              <Badge variant="level">Level {profile?.level || 1}</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-border space-y-4">
          <h3 className="font-display font-bold text-lg">Koleksi Lencana</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { name: 'Pemula Energi', icon: '🌱', desc: 'Selesaikan 1 lab' },
              { name: 'Kecepatan Cahaya', icon: '⚡', desc: 'Jawab benar dalam 3 detik' },
              { name: 'Master Gravitasi', icon: '🪐', desc: 'Eksperimen g = 9.81' },
              { name: 'Juara Battle', icon: '🏆', desc: 'Menangkan sesi kelas' },
            ].map((b, i) => (
              <div key={i} className="p-4 rounded-xl bg-surface space-y-2">
                <div className="text-3xl">{b.icon}</div>
                <div className="font-bold text-xs">{b.name}</div>
                <div className="text-[10px] text-text-muted">{b.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
