'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

export default function HostNew() {
  const router = useRouter();
  const [questions, setQuestions] = useState([
    { id: '1', text: 'Apa rumus energi kinetik?', options: ['1/2 mv²', 'mgh', 'mv', 'm/a'], correct: 0, time: 20 },
    { id: '2', text: 'Apa itu energi potensial?', options: ['Energi gerak', 'Energi tersimpan', 'Energi panas', 'Energi listrik'], correct: 1, time: 20 },
    { id: '3', text: 'Berapa gravitasi di Bumi?', options: ['8.9 m/s²', '9.81 m/s²', '10.2 m/s²', '9.8 m/s²'], correct: 1, time: 15 },
    { id: '4', text: 'Jika gesekan 0, Energi Mekanik...', options: ['Bertambah', 'Berubah', 'Konstan', 'Menghilang'], correct: 2, time: 15 },
    { id: '5', text: 'Sistem apa yang menyimpan energi listrik?', options: ['Baterai', 'Bola', 'Karet', 'Sendok'], correct: 0, time: 20 },
  ]);
  const [timePerQ, setTimePerQ] = useState(20);
  const [loading, setLoading] = useState(false);
  const [sessionCode, setSessionCode] = useState('');

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const code = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data: session, error } = await supabase.from('game_sessions').insert({
        host_id: user.id,
        join_code: code,
        status: 'WAITING',
        current_question_index: 0,
      }).select().single();

      if (error) throw error;
      
      // Save session to localStorage for demo
      localStorage.setItem('energia_session_id', session.id);
      setSessionCode(code);
      setTimeout(() => router.push(`/host/${session.id}`), 1500);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-8 border border-border text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-yellow-xp/20 mx-auto flex items-center justify-center text-2xl">⚡</div>
          <h1 className="font-display font-black text-3xl">Buat Sesi Classroom Battle</h1>
          <p className="text-sm text-text-muted">Pilih modul fisika energi, set durasi per soal, lalu bagikan kode join.</p>
          
          <form onSubmit={handleCreateSession} className="space-y-4 pt-4 text-left">
            <div>
              <label className="block text-xs font-bold text-navy mb-2">Durasi Soal (Detik)</label>
              <div className="flex gap-2">
                {[10, 15, 20, 30, 45].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimePerQ(t)}
                    className={`flex-1 py-2.5 rounded-button font-semibold text-sm border ${
                      timePerQ === t ? 'bg-primary text-white border-primary' : 'bg-white text-navy border-border hover:bg-surface'
                    }`}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Membuat sesi...' : 'Mulai Sesi Battle'}
            </Button>
          </form>

          {sessionCode && (
            <div className="p-4 rounded-xl bg-green-bg text-green-dark font-mono font-bold text-2xl">
              Kode: {sessionCode}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
