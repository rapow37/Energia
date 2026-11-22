'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getDashboardRoute } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        router.replace(await getDashboardRoute(session.user.id));
      }
    })();
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data?.session?.user) {
        router.replace(await getDashboardRoute(data.session.user.id));
      } else if (data?.user) {
        // Email confirmation may be enabled on Supabase project
        setErrorMsg('Akun dibuat. Cek email untuk konfirmasi, lalu masuk.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat pendaftaran');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md p-8 border border-border shadow-card">
        <div className="text-center mb-6">
          <h1 className="font-display font-extrabold text-3xl text-navy-deep">Daftar ENERGIA</h1>
          <p className="text-sm text-text-muted mt-1">Buat akun baru untuk mulai belajar atau mengajar.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">Peran (Role)</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-3 px-4 rounded-button font-semibold text-sm border transition-all ${
                  role === 'student'
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white text-navy border-border hover:bg-surface'
                }`}
              >
                Siswa (Student)
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`py-3 px-4 rounded-button font-semibold text-sm border transition-all ${
                  role === 'teacher'
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white text-navy border-border hover:bg-surface'
                }`}
              >
                Guru (Teacher)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy mb-2">Nama Lengkap</label>
            <Input
              type="text"
              required
              placeholder="Nama Lengkap & Gelar"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

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
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? 'Mendaftarkan...' : 'Daftar Akun'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-text-muted">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Masuk
          </Link>
        </div>
      </Card>
    </div>
  );
}
