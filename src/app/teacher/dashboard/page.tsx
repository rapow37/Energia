'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

interface ClassItem {
  id: string;
  name: string;
  subject: string;
  grade: string;
  join_code: string;
  student_count?: number;
}

export default function TeacherDashboard() {
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newGrade, setNewGrade] = useState('Kelas 10');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      if (prof) setProfile(prof);

      const { data: cls } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (cls) setClasses(cls);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    setCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate random 6-character uppercase code
      const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data, error } = await supabase.from('classes').insert({
        teacher_id: user.id,
        name: newClassName,
        grade: newGrade,
        subject: 'Fisika SMA',
        join_code: joinCode,
      }).select().single();

      if (error) throw error;
      if (data) {
        setClasses([data, ...classes]);
        setShowModal(false);
        setNewClassName('');
      }
    } catch (err: any) {
      alert(err.message || 'Gagal membuat kelas');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex text-navy-deep font-sans">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-border p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div>
              <div className="font-display font-black text-lg tracking-tight">ENERGIA</div>
              <div className="text-[11px] text-text-muted">Portal Guru</div>
            </div>
          </div>

          <nav className="space-y-1">
            <Link href="/teacher/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-button bg-primary/10 text-primary font-semibold text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Dashboard
            </Link>
            <Link href="/teacher/classes" className="flex items-center gap-3 px-3 py-2.5 rounded-button text-text-muted hover:bg-surface font-medium text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Kelas Saya
            </Link>
            <Link href="/host/new" className="flex items-center gap-3 px-3 py-2.5 rounded-button text-text-muted hover:bg-surface font-medium text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              Classroom Battle
            </Link>
            <Link href="/teacher/assignments" className="flex items-center gap-3 px-3 py-2.5 rounded-button text-text-muted hover:bg-surface font-medium text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              Tugas
            </Link>
          </nav>
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">
              {profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'GR'}
            </div>
            <div className="overflow-hidden">
              <div className="font-semibold text-xs truncate">{profile?.full_name || 'Guru Fisika'}</div>
              <div className="text-[10px] text-text-muted">Guru</div>
            </div>
          </div>
          <button 
            onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')}
            className="text-text-muted hover:text-red-500"
            title="Keluar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Top banner / header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-display font-extrabold text-2xl text-navy-deep">
                Selamat datang, {profile?.full_name || 'Bapak/Ibu Guru'}!
              </h1>
              <p className="text-sm text-text-muted mt-1">Kelola kelas, tugas, dan sesi kuis interaktif.</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setShowModal(true)}>
                + Buat Kelas Baru
              </Button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                </svg>
              </div>
              <div>
                <div className="text-2xl font-display font-extrabold">{classes.length}</div>
                <div className="text-xs text-text-muted">Total Kelas</div>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-bg text-orange-dark flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              <div>
                <div className="text-2xl font-display font-extrabold">0</div>
                <div className="text-xs text-text-muted">Tugas Aktif</div>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-bg text-cyan-dark flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <div>
                <div className="text-2xl font-display font-extrabold">0</div>
                <div className="text-xs text-text-muted">Sesi Battle Selesai</div>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-bg text-green-dark flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <div>
                <div className="text-2xl font-display font-extrabold">100%</div>
                <div className="text-xs text-text-muted">Kesiapan Lab</div>
              </div>
            </Card>
          </div>

          {/* Classes Grid */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-display font-bold text-xl">Daftar Kelas Aktif</h2>
              <span className="text-xs text-text-muted">Siswa dapat bergabung dengan Kode Gabung</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-text-muted">Memuat data kelas...</div>
            ) : classes.length === 0 ? (
              <Card className="p-10 text-center space-y-4 border-dashed border-2 border-border">
                <div className="w-16 h-16 mx-auto rounded-full bg-surface flex items-center justify-center text-text-muted">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg">Belum Ada Kelas</h3>
                  <p className="text-sm text-text-muted max-w-sm mx-auto mt-1">
                    Buat kelas pertama Anda untuk membagikan tugas dan memulai sesi kuis Classroom Battle.
                  </p>
                </div>
                <Button onClick={() => setShowModal(true)}>
                  Buat Kelas Sekarang
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {classes.map((c) => (
                  <Card key={c.id} className="p-6 space-y-4 border border-border flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="level">{c.grade}</Badge>
                        <span className="text-xs font-mono font-bold bg-surface px-2.5 py-1 rounded-md border border-border">
                          KODE: {c.join_code}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-lg text-navy-deep">{c.name}</h3>
                      <p className="text-xs text-text-muted">{c.subject}</p>
                    </div>

                    <div className="pt-4 border-t border-border flex justify-between items-center text-xs">
                      <span className="text-text-muted">Kode Gabung Siswa</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(c.join_code);
                          alert(`Kode kelas ${c.join_code} disalin ke clipboard!`);
                        }}
                        className="font-semibold text-primary hover:underline"
                      >
                        Salin Kode
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Class Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-navy-deep/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 border border-border shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg">Buat Kelas Baru</h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-navy">✕</button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1.5">Nama Kelas</label>
                <Input
                  required
                  placeholder="Contoh: XI MIPA 1"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy mb-1.5">Tingkat</label>
                <select
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  className="w-full h-12 px-4 border border-border-dark rounded-button bg-white text-navy text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Kelas 10">Kelas 10</option>
                  <option value="Kelas 11">Kelas 11</option>
                  <option value="Kelas 12">Kelas 12</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
                  Batal
                </Button>
                <Button type="submit" disabled={creating} className="flex-1">
                  {creating ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
