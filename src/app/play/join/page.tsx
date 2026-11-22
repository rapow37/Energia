'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

export default function StudentPlayerJoin() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: session } = await supabase
        .from('game_sessions')
        .select('id')
        .eq('join_code', code.toUpperCase())
        .eq('status', 'WAITING')
        .single();

      if (!session) throw new Error('Kode sesi tidak valid');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Silakan login dulu');

      await supabase.from('session_participants').insert({
        session_id: session.id,
        student_id: user.id,
        score: 0,
      });

      router.push(`/play/${session.id}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-darker p-8 flex items-center justify-center text-white font-sans">
      <Card className="w-full max-w-md p-8 bg-navy border border-white/10 space-y-6 text-center">
        <div className="text-5xl">🎮</div>
        <h1 className="font-display font-black text-3xl">Masuk Battle</h1>
        <p className="text-white/60 text-sm">Masukkan kode sesi yang diberikan guru.</p>

        <form onSubmit={handleJoin} className="space-y-4">
          <Input
            placeholder="Kode Sesi (misal: X7Y8Z9)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="bg-white/5 border-white/20 text-white placeholder:text-white/30 font-mono text-xl text-center uppercase tracking-widest"
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Menghubungkan...' : 'Masuk Sesi'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
