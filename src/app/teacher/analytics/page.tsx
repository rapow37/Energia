'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function TeacherAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: members } = await supabase.from('class_members').select('student_id, profiles(full_name, level, xp)');
    setData({ students: members || [] });
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center"><div className="text-text-muted">Memuat analitik...</div></div>;

  return (
    <div className="min-h-screen bg-surface p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <Badge variant="new">ANALITIK</Badge>
          <h1 className="font-display font-black text-3xl mt-1">Analitik Belajar</h1>
        </div>

        <Card className="p-8 border border-border">
          <h2 className="font-display font-bold text-xl mb-6">Rata-rata Tingkat Pencapaian</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-surface">
              <div className="text-3xl font-display font-extrabold text-primary">7.8</div>
              <div className="text-xs text-text-muted mt-1">Rata-rata Level Siswa</div>
            </div>
            <div className="p-4 rounded-xl bg-surface">
              <div className="text-3xl font-display font-extrabold text-orange-accent">62%</div>
              <div className="text-xs text-text-muted mt-1">Tingkat Tugas Tercapai</div>
            </div>
            <div className="p-4 rounded-xl bg-surface">
              <div className="text-3xl font-display font-extrabold text-cyan-accent">83%</div>
              <div className="text-xs text-text-muted mt-1">Partisipasi Battle</div>
            </div>
            <div className="p-4 rounded-xl bg-surface">
              <div className="text-3xl font-display font-extrabold text-green-success">91%</div>
              <div className="text-xs text-text-muted mt-1">Kepatuhan Laboratorium</div>
            </div>
          </div>
        </Card>

        <Card className="p-8 border border-border">
          <h2 className="font-display font-bold text-xl mb-6">Pencapaian Siswa</h2>
          <div className="space-y-3">
            {(data?.students || []).slice(0, 10).map((m: any) => (
              <div key={m.student_id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-border">
                <div>
                  <span className="font-semibold text-sm">{m.profiles?.full_name || 'Siswa'}</span>
                  <span className="text-xs text-text-muted ml-2">Level {m.profiles?.level || 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-border overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${((m.profiles?.xp || 0) / 1000) * 100}%` }} />
                  </div>
                  <Badge variant="xp">{(m.profiles?.xp || 0)} XP</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
