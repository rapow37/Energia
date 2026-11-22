'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function TeacherClasses() {
  const [classes, setClasses] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('classes').select('*').eq('teacher_id', user.id).order('created_at');
    setClasses(data || []);
    if (data) {
      const map: Record<string, number> = {};
      for (const c of data) {
        const { count } = await supabase.from('class_members').select('*', { count: 'exact', head: true }).eq('class_id', c.id);
        map[c.id] = count || 0;
      }
      setCounts(map);
    }
  };

  return (
    <div className="min-h-screen bg-surface p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <Badge variant="new">KELAS</Badge>
          <h1 className="font-display font-black text-3xl mt-1">Kelas Saya</h1>
        </div>
        {classes.length === 0 ? (
          <Card className="p-10 text-center border-dashed border-2 border-border text-text-muted">
            Belum ada kelas. Buat kelas dari dashboard.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map((c) => (
              <Card key={c.id} className="p-6 border border-border space-y-3">
                <div className="flex justify-between">
                  <Badge variant="level">{c.grade}</Badge>
                  <span className="font-mono text-xs bg-surface px-2 py-1 rounded border border-border">{c.join_code}</span>
                </div>
                <h3 className="font-display font-bold text-lg">{c.name}</h3>
                <p className="text-xs text-text-muted">{counts[c.id] || 0} siswa terdaftar</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
