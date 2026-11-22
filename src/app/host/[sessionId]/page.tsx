'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function HostControl({ params }: { params: { sessionId: string } }) {
  const sessionId = params.sessionId;
  const router = useRouter();
  const [sessionCode, setSessionCode] = useState('------');
  const [status, setStatus] = useState<'WAITING' | 'COUNTDOWN' | 'QUESTION_ACTIVE' | 'QUESTION_RESULT' | 'LEADERBOARD' | 'COMPLETED'>('WAITING');
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [participants, setParticipants] = useState<any[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    // Load session
    supabase.from('game_sessions').select('*').eq('id', sessionId).single()
      .then(({ data }) => {
        if (data) {
          setSessionCode(data.join_code);
          setStatus(data.status);
        }
      });

    // Subscribe to session updates
    const channel = supabase
      .channel(`session-${sessionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_participants', filter: `session_id=eq.${sessionId}` }, (payload) => {
        loadParticipants();
      })
      .subscribe();

    loadParticipants();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const loadParticipants = async () => {
    const { data } = await supabase
      .from('session_participants')
      .select('student_id, score, profiles(full_name)')
      .eq('session_id', sessionId)
      .order('score', { ascending: false });
    if (data) setParticipants(data);
  };

  const startCountdown = async () => {
    setStatus('QUESTION_ACTIVE');
    setTimeLeft(20);
    await supabase.from('game_sessions').update({ status: 'QUESTION_ACTIVE', current_question_index: 0 }).eq('id', sessionId);
    
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setStatus('QUESTION_RESULT');
          setShowAnswer(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-navy-darker p-8 text-white font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <Badge variant="level">HOST CONTROL</Badge>
            <h1 className="font-display font-black text-3xl mt-1">Classroom Battle Live</h1>
          </div>
          <div className="p-3 rounded-xl bg-white/10 text-white font-mono font-bold text-2xl">
            Kode: {sessionCode}
          </div>
        </div>

        <Card className="p-10 text-center space-y-6 bg-navy border border-white/10">
          {status === 'WAITING' ? (
            <div className="space-y-4">
              <div className="text-5xl">⏳</div>
              <h2 className="font-display font-bold text-2xl">Menunggu Siswa Bergabung...</h2>
              <p className="text-white/60 text-sm">Bagikan kode di atas ke siswa atau tampilkan QR Code.</p>
              <Button onClick={startCountdown} size="sm">
                Mulai Sekarang ({participants.length} siswa)
              </Button>
            </div>
          ) : status === 'QUESTION_ACTIVE' ? (
            <div className="space-y-4">
              <div className="flex justify-center items-center gap-2 text-orange-accent">
                <span className="font-mono text-5xl font-black">{timeLeft}s</span>
              </div>
              <p className="text-white/60">Soal {currentQ + 1} dari 5</p>
              <div className="h-2 bg-white/10 rounded-full">
                <div className="h-full bg-orange-accent rounded-full" style={{ width: `${(timeLeft/20)*100}%` }} />
              </div>
            </div>
          ) : status === 'QUESTION_RESULT' ? (
            <div className="space-y-4">
              <div className="text-green-500 text-4xl font-bold">✔ Jawaban Benar: 1/2 mv²</div>
              <Button onClick={() => {
                setCurrentQ((q) => q + 1);
                setStatus('QUESTION_ACTIVE');
                setShowAnswer(false);
                setTimeLeft(20);
              }}>Lanjut ke Soal Berikutnya</Button>
            </div>
          ) : null}
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-navy border border-white/10 space-y-4">
            <h3 className="font-display font-bold">Leaderboard</h3>
            <div className="space-y-2">
              {participants.map((p: any, idx: number) => (
                <div key={p.student_id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    idx === 0 ? 'bg-yellow-xp text-navy-deep' : idx === 1 ? 'bg-white/20 text-white' : idx === 2 ? 'bg-orange-accent text-navy-deep' : 'bg-white/10 text-white/60'
                  }`}>{idx + 1}</div>
                  <div className="flex-1 font-medium text-sm">{p.profiles?.full_name || 'Siswa'}</div>
                  <div className="font-mono font-bold">{p.score}</div>
                </div>
              ))}
              {participants.length === 0 && (
                <div className="text-white/40 text-sm">Belum ada peserta tercatat.</div>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-navy border border-white/10 space-y-4">
            <h3 className="font-display font-bold">Kontrol Soal</h3>
            <div className="space-y-2">
              <Button variant="secondary" className="w-full border-white/20 text-white bg-white/5 hover:bg-white/10">Edit Bank Soal</Button>
              <Button variant="accent" className="w-full" onClick={() => router.push('/display/' + sessionId)}>
                Tampilkan di Layar Proyektor
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
