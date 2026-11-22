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
}

export default function StudentDashboard() {
  const [profile, setProfile] = useState<{ full_name: string; xp: number; level: number } | null>(null);
  const [joinedClasses, setJoinedClasses] = useState<ClassItem[]>([]);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name, xp, level')
        .eq('id', user.id)
        .single();
      if (prof) setProfile(prof);

      // Get enrolled classes
      const { data: members } = await supabase
        .from('class_members')
        .select('class_id, classes ( id, name, subject, grade )')
        .eq('student_id', user.id);

      if (members) {
        const clsList = members.map((m: any) => m.classes).filter(Boolean);
        setJoinedClasses(clsList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoining(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Find class by join code
      const { data: targetClass, error: findErr } = await supabase
        .from('classes')
        .select('id, name, subject, grade')
        .eq('join_code', joinCode.trim().toUpperCase())
        .single();

      if (findErr || !targetClass) {
        throw new Error('Kode kelas tidak valid atau kelas tidak ditemukan');
      }

      // Insert member
      const { error: joinErr } = await supabase.from('class_members').insert({
        class_id: targetClass.id,
        student_id: user.id,
      });

      if (joinErr) {
        if (joinErr.code === '23505') {
          throw new Error('Kamu sudah bergabung di kelas ini');
        }
        throw joinErr;
      }

      setJoinedClasses([...joinedClasses, targetClass]);
      setShowJoinModal(false);
      setJoinCode('');
      alert(`Berhasil bergabung ke kelas ${targetClass.name}!`);
    } catch (err: any) {
      alert(err.message || 'Gagal bergabung kelas');
    } finally {
      setJoining(false);
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
              <div className="text-[11px] text-text-muted">Portal Siswa</div>
            </div>
          </div>

          <nav className="space-y-1">
            <Link href="/student/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-button bg-primary/10 text-primary font-semibold text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Beranda
            </Link>
            <Link href="/lab/energy" className="flex items-center gap-3 px-3 py-2.5 rounded-button text-text-muted hover:bg-surface font-medium text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18h12"></path><path d="M10 22h4"></path>
                <path d="M12 2v4"></path><path d="M9 6h6l2 8H7l2-8z"></path>
              </svg>
              Energy Lab
            </Link>
            <Link href="/quest" className="flex items-center gap-3 px-3 py-2.5 rounded-button text-text-muted hover:bg-surface font-medium text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              Energy Quest
            </Link>
            <Link href="/student/assignments" className="flex items-center gap-3 px-3 py-2.5 rounded-button text-text-muted hover:bg-surface font-medium text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              Tugas Saya
            </Link>
            <Link href="/play/join" className="flex items-center gap-3 px-3 py-2.5 rounded-button text-text-muted hover:bg-surface font-medium text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
              </svg>
              Masuk Battle
            </Link>
          </nav>
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
              {profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'SW'}
            </div>
            <div className="overflow-hidden">
              <div className="font-semibold text-xs truncate">{profile?.full_name || 'Siswa'}</div>
              <div className="text-[10px] text-text-muted">Level {profile?.level || 1}</div>
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
          {/* Hero Banner */}
          <div className="p-8 rounded-hero bg-gradient-to-r from-navy via-navy to-primary text-white flex justify-between items-center relative overflow-hidden shadow-card">
            <div className="space-y-3 z-10 max-w-xl">
              <div className="flex items-center gap-2">
                <Badge variant="xp">⚡ {profile?.xp || 0} XP</Badge>
                <Badge variant="level">Level {profile?.level || 1}</Badge>
              </div>
              <h1 className="font-display font-black text-3xl">
                Halo, {profile?.full_name ? profile.full_name.split(' ')[0] : 'Siswa'}! Siap Belajar?
              </h1>
              <p className="text-white/80 text-sm">
                Pelajari konsep fisika energi lewat simulasi interaktif roller coaster atau selesaikan misi petualangan game.
              </p>
              <div className="flex gap-3 pt-2">
                <Link href="/lab/energy">
                  <Button variant="accent">Masuk Energy Lab</Button>
                </Link>
                <Link href="/quest">
                  <Button variant="secondary" className="border-white/30 text-white bg-white/10 hover:bg-white/20">
                    Buka Peta Level
                  </Button>
                </Link>
              </div>
            </div>

            <div className="hidden lg:block opacity-20 transform scale-150 mr-8 pointer-events-none">
              <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
          </div>

          {/* Quick Actions & Enrolled Classes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Learning Shortcuts & Classes */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-display font-bold text-xl">Kelas Saya</h2>
                <Button size="sm" onClick={() => setShowJoinModal(true)}>
                  + Gabung Kelas
                </Button>
              </div>

              {loading ? (
                <div className="p-6 text-center text-text-muted">Memuat kelas...</div>
              ) : joinedClasses.length === 0 ? (
                <Card className="p-8 text-center space-y-3 border-dashed border-2 border-border">
                  <div className="text-text-muted">Kamu belum bergabung di kelas manapun.</div>
                  <Button size="sm" onClick={() => setShowJoinModal(true)}>
                    Masukkan Kode Kelas Guru
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {joinedClasses.map((cls) => (
                    <Card key={cls.id} className="p-5 border border-border space-y-2">
                      <Badge variant="new">{cls.grade}</Badge>
                      <h3 className="font-display font-bold text-lg text-navy-deep">{cls.name}</h3>
                      <p className="text-xs text-text-muted">{cls.subject}</p>
                    </Card>
                  ))}
                </div>
              )}

              {/* Module Cards */}
              <h2 className="font-display font-bold text-xl pt-4">Aktivitas Utama</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6 border border-border space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-bg text-cyan-dark flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 12h4l3-7 4 14 3-7h4"></path>
                    </svg>
                  </div>
                  <h3 className="font-display font-bold text-lg">Energy Lab (Simulasi)</h3>
                  <p className="text-xs text-text-muted">
                    Eksperimen langsung lintasan roller coaster dengan mengatur massa, ketinggian, gravitasi, dan gesekan.
                  </p>
                  <Link href="/lab/energy" className="inline-block font-semibold text-sm text-primary hover:underline pt-2">
                    Luncurkan Lab →
                  </Link>
                </Card>

                <Card className="p-6 border border-border space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-bg text-orange-dark flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </div>
                  <h3 className="font-display font-bold text-lg">Energy Quest (Game)</h3>
                  <p className="text-xs text-text-muted">
                    Selesaikan 5 level tantangan fisika, kumpulkan kristal energi, dan buka lencana prestasi.
                  </p>
                  <Link href="/quest" className="inline-block font-semibold text-sm text-primary hover:underline pt-2">
                    Mulai Quest →
                  </Link>
                </Card>
              </div>
            </div>

            {/* Right 1 Col: Classroom Battle Quick Join */}
            <div className="space-y-6">
              <h2 className="font-display font-bold text-xl">Classroom Battle</h2>
              <Card className="p-6 border border-border bg-gradient-to-b from-white to-surface space-y-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-xp/30 text-navy-deep flex items-center justify-center font-bold text-xl">
                  ⚡
                </div>
                <div>
                  <h3 className="font-display font-bold text-base">Ikut Kuis Live Kelas</h3>
                  <p className="text-xs text-text-muted mt-1">
                    Punya kode PIN dari Guru? Masukkan kode untuk bertanding bersama teman sekelas.
                  </p>
                </div>
                <Link href="/play/join" className="block">
                  <Button className="w-full">
                    Gabung Sesi Battle
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Join Class Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-navy-deep/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 border border-border shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg">Gabung ke Kelas</h3>
              <button onClick={() => setShowJoinModal(false)} className="text-text-muted hover:text-navy">✕</button>
            </div>

            <form onSubmit={handleJoinClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1.5">Kode Kelas (6 Karakter)</label>
                <Input
                  required
                  placeholder="Contoh: AB12CD"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowJoinModal(false)} className="flex-1">
                  Batal
                </Button>
                <Button type="submit" disabled={joining} className="flex-1">
                  {joining ? 'Memproses...' : 'Gabung'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
