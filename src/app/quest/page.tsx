'use client';

import React, { useState } from 'react';
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

const INITIAL_LEVELS: Level[] = [
  { id: '1', title: 'The Height Challenge', description: 'Tentukan ketinggian ideal dan hitung energi potensial.', starGoal: 1000, status: 'unlocked', stars: 3, xp: 100 },
  { id: '2', title: 'Speed Mission', description: 'Capai kecepatan maksimum di dasar lintasan.', starGoal: 1500, status: 'unlocked', stars: 2, xp: 150 },
  { id: '3', title: 'Energy Transfer', description: 'Analisis hukum kekekalan energi mekanik.', starGoal: 2000, status: 'unlocked', stars: 0, xp: 200 },
  { id: '4', title: 'Save the Roller Coaster', description: 'Atur gesekan dan hentikan roller coaster dengan aman.', starGoal: 2500, status: 'locked', stars: 0, xp: 250 },
  { id: '5', title: 'Energy Master', description: 'Selesaikan semua tantangan level akhir.', starGoal: 5000, status: 'locked', stars: 0, xp: 500 },
];

export default function LevelMap() {
  const [levels, setLevels] = useState<Level[]>(INITIAL_LEVELS);
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

  const questions = [
    { text: 'Berapa besar energi potensial untuk massa 2 kg pada ketinggian 4 m (g = 9.8 m/s²)?', options: ['78,4 J', '39,2 J', '156,8 J', '9,8 J'], correct: 0 },
    { text: 'Jika kecepatan kereta 5 m/s dan massa 2 kg, berapa energi kinetiknya?', options: ['25 J', '50 J', '12,5 J', '100 J'], correct: 0 },
    { text: 'Saat gesekan aktif, ke mana energi mekanik yang hilang berubah?', options: ['Energi Termal (Panas)', 'Energi Potensial', 'Energi Kinetik', 'Hilang selamanya'], correct: 0 },
  ];

  const handleLevelClick = (level: Level) => {
    if (level.status === 'locked') return;
    setActiveLevel(level);
    setPlaying(true);
    setQIndex(0);
    setScore(0);
    setSelectedOpt(null);
  };

  const handleAnswer = (optIdx: number) => {
    setSelectedOpt(optIdx);
    if (optIdx === questions[qIndex].correct) {
      setScore(s => s + 500);
    }
    setTimeout(() => {
      if (qIndex < questions.length - 1) {
        setQIndex(qIndex + 1);
        setSelectedOpt(null);
      } else {
        // Complete level
        if (activeLevel) {
          setLevels(prev => prev.map(l => {
            if (l.id === activeLevel.id) {
              return { ...l, stars: 3, status: 'completed' };
            }
            // Unlock next
            if (Number(l.id) === Number(activeLevel.id) + 1 && l.status === 'locked') {
              return { ...l, status: 'unlocked' };
            }
            return l;
          }));
        }
      }
    }, 800);
  };

  if (playing && activeLevel) {
    const finished = qIndex >= questions.length || (selectedOpt !== null && qIndex === questions.length - 1);
    return (
      <div className="min-h-screen bg-surface p-6 font-sans text-navy-deep flex items-center justify-center">
        <Card className="max-w-xl w-full p-8 space-y-6 border border-border bg-white shadow-card">
          <div className="flex justify-between items-center">
            <Badge variant="level">Level {activeLevel.id}: {activeLevel.title}</Badge>
            <Button variant="secondary" size="sm" onClick={() => setPlaying(false)}>Keluar Misi</Button>
          </div>

          {!finished ? (
            <div className="space-y-6">
              <div className="text-sm font-bold text-text-muted">Soal {qIndex + 1} dari {questions.length}</div>
              <h2 className="font-display font-bold text-xl">{questions[qIndex].text}</h2>
              <div className="grid grid-cols-1 gap-3">
                {questions[qIndex].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={selectedOpt !== null}
                    className={`p-4 rounded-xl font-semibold text-left transition-all border ${
                      selectedOpt === idx
                        ? idx === questions[qIndex].correct
                          ? 'bg-green-success text-white border-green-success'
                          : 'bg-red-500 text-white border-red-500'
                        : 'bg-surface border-border hover:bg-border/50 text-navy-deep'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6 py-8">
              <div className="text-4xl">🎉</div>
              <h2 className="font-display font-black text-2xl">Misi Selesai!</h2>
              <p className="text-text-muted">Skor kamu: {score} Poin • Mendapatkan 3 Bintang ⭐⭐⭐</p>
              <Button onClick={() => setPlaying(false)} className="w-full">Kembali ke Peta Level</Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface p-6 font-sans text-navy-deep">
      <header className="flex items-center gap-3 mb-8">
        <Link href="/student/dashboard">
          <Button size="sm" variant="secondary">← Kembali</Button>
        </Link>
        <div>
          <Badge variant="xp">⚡ 550 XP</Badge>
          <Badge variant="level">Level 2</Badge>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-10">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-display font-black text-3xl">Peta Level Energy Quest</h1>
            <p className="text-sm text-text-muted">Klik level yang terbuka untuk mulai menyelesaikan misi fisika.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level, idx) => (
            <Card
              key={level.id}
              className={`p-6 space-y-4 border border-border transition-all ${
                level.status === 'locked'
                  ? 'opacity-50 grayscale border-border cursor-not-allowed bg-surface/50'
                  : 'hover:scale-[1.02] shadow-card cursor-pointer bg-white'
              }`}
              onClick={() => handleLevelClick(level)}
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                  level.status === 'locked' ? 'bg-text-muted' : 'bg-primary'
                }`}>
                  {level.status === 'locked' ? '🔒' : idx + 1}
                </div>
                <Badge variant={level.status === 'completed' ? 'done' : level.status === 'unlocked' ? 'new' : 'locked'}>
                  {level.status === 'completed' ? 'Selesai' : level.status === 'unlocked' ? 'Terbuka' : 'Terkunci'}
                </Badge>
              </div>

              <h3 className="font-display font-bold text-lg">{level.title}</h3>
              <p className="text-sm text-text-muted">{level.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-yellow-500 font-bold">
                  {level.stars > 0 ? '⭐⭐⭐' : '☆☆☆'}
                </div>
                <span className="text-xs font-bold text-primary">{level.xp} XP</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
