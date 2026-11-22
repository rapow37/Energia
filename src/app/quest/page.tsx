'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface Level {
  id: string;
  title: string;
  description: string;
  starGoal: number;
  status: 'locked' | 'unlocked' | 'completed';
  stars: number;
  xp: number;
}

const LEVELS: Level[] = [
  { id: '1', title: 'The Height Challenge', description: 'Tentukan ketinggian ideal.', starGoal: 1000, status: 'unlocked', stars: 0, xp: 100 },
  { id: '2', title: 'Speed Mission', description: 'Capai kecepatan maksimum.', starGoal: 1500, status: 'locked', stars: 0, xp: 150 },
  { id: '3', title: 'Energy Transfer', description: 'Analisis transfer energi.', starGoal: 2000, status: 'locked', stars: 0, xp: 200 },
  { id: '4', title: 'Save the Roller Coaster', description: 'Hentikan roller coaster dengan aman.', starGoal: 2500, status: 'locked', stars: 0, xp: 250 },
  { id: '5', title: 'Energy Master', description: 'Selesaikan semua tantangan.', starGoal: 5000, status: 'locked', stars: 0, xp: 500 },
];

export default function LevelMap() {
  const [levels, setLevels] = useState<Level[]>(LEVELS);

  const playLevel = (level: Level) => {
    if (level.status === 'locked') return;
  };

  return (
    <div className="min-h-screen bg-surface p-6 font-sans text-navy-deep">
      <header className="flex items-center gap-3 mb-8">
        <Link href="/student/dashboard">
          <Button size="sm" variant="secondary">← Kembali</Button>
        </Link>
        <div>
          <Badge variant="xp">⚡ 0 XP</Badge>
          <Badge variant="level">Level 1</Badge>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-10">
        <div className="flex justify-between items-end">
          <h1 className="font-display font-black text-3xl">Peta Level Energy Quest</h1>
          <p className="text-sm text-text-muted">Selesaikan 5 level untuk menjadi Master Energi.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level, idx) => {
            const isLast = idx === levels.length - 1;
            return (
              <Card key={level.id} className={`p-6 space-y-4 border border-border cursor-pointer transition-all ${
                level.status === 'locked'
                  ? 'opacity-60 grayscale border-border'
                  : 'hover:scale-[1.02] shadow-card'
              }`} onClick={() => playLevel(level)}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  level.status === 'locked' ? 'bg-surface text-text-muted' : 'bg-primary text-white'
                }`}>
                  {level.status === 'locked' ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20m0-20h20v-20H12z"></path></svg> : idx + 1}
                </div>
                <h3 className="font-display font-bold text-lg">{level.title}</h3>
                <p className="text-sm text-text-muted">{level.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Badge variant={level.stars > 0 ? 'done' : 'locked'}>
                    {level.stars > 0 ? '★' : '🔒'} {level.stars} bintang
                  </Badge>
                  <span className="text-xs font-bold text-primary">{level.xp} XP</span>
                </div>
              </Card>
            );
          })}
        </div>

        {levels.filter(l => l.status === 'locked').length > 0 && (
          <Card className="p-4 border-dashed border-2 border-border text-center">
            <div className="text-text-muted">Selesaikan level sebelumnya untuk membuka tantangan berikutnya.</div>
          </Card>
        )}
      </div>
    </div>
  );
}
