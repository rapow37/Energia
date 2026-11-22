'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const MOCK_LEADERBOARD = [
  { name: 'Budi S.', score: 2400, streak: 5 },
  { name: 'Siti A.', score: 2100, streak: 3 },
  { name: 'Raka P.', score: 1950, streak: 2 },
  { name: 'Dina M.', score: 1800, streak: 4 },
  { name: 'Andi K.', score: 1500, streak: 1 },
];

export default function ProjectorDisplay({ params }: { params: { sessionId: string } }) {
  const sessionId = params.sessionId;
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-darker via-navy-deep to-navy p-12 text-white font-sans flex flex-col">
      <header className="flex justify-between items-center mb-12">
        <div>
          <div className="text-sm text-white/50 uppercase tracking-[0.3em]">Classroom Battle</div>
          <h1 className="font-display font-black text-5xl">Leaderboard</h1>
        </div>
        <div className="text-right">
          <div className="text-white/50 text-sm">Kode Sesi</div>
          <div className="font-mono font-bold text-4xl text-cyan-accent">LIVE</div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-5 gap-6 items-end max-w-6xl mx-auto w-full">
        {MOCK_LEADERBOARD.map((p, idx) => {
          const height = 100 - idx * 15;
          return (
            <div key={p.name} className="flex flex-col items-center gap-4">
              <div className="text-center">
                <div className="font-display font-bold text-lg">{p.name}</div>
                <div className="text-cyan-accent font-mono font-bold text-2xl">{p.score}</div>
              </div>
              <div 
                className={`w-full rounded-t-2xl flex items-start justify-center pt-4 font-display font-black text-4xl ${
                  idx === 0 ? 'bg-yellow-xp text-navy-deep' :
                  idx === 1 ? 'bg-white/20 text-white' :
                  idx === 2 ? 'bg-orange-accent text-navy-deep' :
                  'bg-white/10 text-white/60'
                }`}
                style={{ height: `${height * 3}px` }}
              >
                {idx + 1}
              </div>
            </div>
          );
        })}
      </div>

      <footer className="mt-8 text-center text-white/30 text-sm">
        ENERGIA — Classroom Battle · Sesi Berlangsung
      </footer>
    </div>
  );
}
