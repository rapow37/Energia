'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data?.user) {
        // Fetch user profile to route correctly (teacher vs student)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role === 'teacher') {
          router.push('/teacher/dashboard');
        } else {
          router.push('/student/dashboard');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat masuk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md p-8 border border-border shadow-card">
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-2xl bg-primary/10 text-primary mb-3">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h1 className="font-display font-extrabold text-3xl text-navy-deep">Masuk ENERGIA</h1>
          <p className="text-sm text-text-muted mt-1">Jelajahi, bereksperimen, dan pahami fisika.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">Email</label>
            <Input
              type="email"
              required
              placeholder="nama@sekolah.sch.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy mb-2">Kata Sandi</label>
            <Input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Memproses...' : 'Masuk Sekarang'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-text-muted">
          Belum punya akun?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Daftar di sini
          </Link>
        </div>
      </Card>
    </div>
  );
}
