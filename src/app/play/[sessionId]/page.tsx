'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const QUESTIONS = [
  { id: 1, text: 'Rumus energi kinetik?', options: ['Ek = ½mv²', 'Ep = mgh', 'F = ma', 'W = Fs'], correct: 0 },
  { id: 2, text: 'Energi potensial di ketinggian 10m, massa 2kg?', options: ['196.2 J', '100 J', '20 J', '98.1 J'], correct: 0 },
  { id: 3, text: 'Saat gesekan aktif, energi mekanik akan?', options: ['Konstan', 'Berkurang', 'Bertambah', 'Nol'], correct: 1 },
];

export default function StudentPlay({ params }: { params: { sessionId: string } }) {
  const sessionId = params.sessionId;
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          setShowResult(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentQ]);

  const handleSelect = (idx: number) => {
    if (selected !== null || showResult) return;
    setSelected(idx);
    if (idx === QUESTIONS[currentQ].correct) {
      setScore(s => s + 100);
    }
  };

  const nextQuestion = () => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setShowResult(false);
      setTimeLeft(20);
    }
  };

  const q = QUESTIONS[currentQ];

  return (
    <div className="min-h-screen bg-navy-darker p-6 flex items-center justify-center text-white font-sans">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex justify-between items-center">
          <Badge variant="level">SOAL {currentQ + 1} / {QUESTIONS.length}</Badge>
          <div className="font-mono text-2xl font-bold text-orange-accent">{timeLeft}s</div>
        </div>

        <Card className="p-8 bg-navy border border-white/10 text-center space-y-6">
          <h2 className="font-display font-bold text-xl">{q.text}</h2>
          
          <div className="grid grid-cols-1 gap-3">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showResult}
                className={`p-4 rounded-xl font-semibold text-sm transition-all border ${
                  selected === idx
                    ? idx === q.correct
                      ? 'bg-green-success text-white border-green-success'
                      : 'bg-red-500 text-white border-red-500'
                    : showResult && idx === q.correct
                      ? 'bg-green-success/30 text-white border-green-success'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {showResult && (
            <div className="pt-4 space-y-3">
              <div className="text-2xl font-bold">{score} Poin</div>
              {currentQ < QUESTIONS.length - 1 ? (
                <Button onClick={nextQuestion} className="w-full">Soal Berikutnya</Button>
              ) : (
                <div className="text-cyan-accent font-bold">Sesi Selesai! Skor Akhir: {score}</div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
