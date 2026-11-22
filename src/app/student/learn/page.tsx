'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function StudentLearn() {
  const [activeModule, setActiveModule] = useState('Newton');

  return (
    <div className="min-h-screen bg-surface p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <Badge variant="new">BELAJAR</Badge>
          <h1 className="font-display font-black text-3xl mt-1">Materi Pembelajaran</h1>
          <p className="text-sm text-text-muted mt-1">Baca ringkasan konsep fisika energi sebelum praktik di Energy Lab.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Energi Kinetik', desc: 'Energi gerak benda: Ek = ½mv²', icon: '⚡' },
            { title: 'Energi Potensial', desc: 'Energi tersimpan: Ep = mgh', icon: '🏔' },
            { title: 'Energi Mekanik', desc: 'Total energi: Em = Ep + Ek', icon: '⚙' },
            { title: 'Hukum Kekekalan', desc: 'Tanpa gesekan, Em konstan.', icon: '⚖' },
            { title: 'Gesekan & Termal', desc: 'Gesekan mengubah energi menjadi panas.', icon: '🔥' },
            { title: 'Usaha & Gaya', desc: 'Usaha = gaya × perpindahan.', icon: '🔨' },
          ].map((m, i) => (
            <Card key={i} className="p-5 border border-border space-y-2 hover:scale-[1.02] transition-all cursor-pointer">
              <div className="text-2xl">{m.icon}</div>
              <h3 className="font-display font-bold text-base">{m.title}</h3>
              <p className="text-xs text-text-muted">{m.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
