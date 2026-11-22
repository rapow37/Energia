'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', class_id: '', deadline: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: cls } = await supabase.from('classes').select('*').eq('teacher_id', user.id);
    setClasses(cls || []);
    if (cls && cls.length > 0 && !form.class_id) {
      setForm(f => ({ ...f, class_id: cls[0].id }));
    }
    const { data: asg } = await supabase.from('assignments').select('*, classes(name)').eq('teacher_id', user.id).order('created_at', { ascending: false });
    setAssignments(asg || []);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('assignments').insert({
        ...form,
        teacher_id: user.id,
        deadline: new Date(form.deadline).toISOString(),
      });
      if (error) throw error;
      setShowModal(false);
      setForm({ title: '', description: '', class_id: classes[0]?.id || '', deadline: '' });
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Badge variant="new">TUGAS</Badge>
            <h1 className="font-display font-black text-3xl mt-1">Kelola Pekerjaan Rumah</h1>
          </div>
          <Button onClick={() => setShowModal(true)}>+ Buat Tugas</Button>
        </div>

        {assignments.length === 0 ? (
          <Card className="p-10 text-center space-y-3 border-dashed border-2 border-border">
            <div className="text-text-muted">Belum ada tugas yang dibuat.</div>
            <Button size="sm" onClick={() => setShowModal(true)}>Buat Tugas Pertama</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {assignments.map((a) => (
              <Card key={a.id} className="p-5 flex justify-between items-center border border-border">
                <div>
                  <h3 className="font-display font-bold">{a.title}</h3>
                  <p className="text-xs text-text-muted mt-1">{a.description}</p>
                  <p className="text-xs text-text-muted mt-1">Kelas: {a.classes?.name || '-'} · Deadline: {new Date(a.deadline).toLocaleDateString('id-ID')}</p>
                </div>
                <Badge variant="continue">Aktif</Badge>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-navy-deep/40 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h3 className="font-display font-bold text-lg">Buat Pekerjaan Rumah</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Judul Tugas</label>
                <Input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Contoh: Percobaan Energi" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Instruksi</label>
                <textarea className="w-full p-3 border border-border-dark rounded-button text-sm min-h-[80px]" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Kelas</label>
                <select className="w-full h-12 px-3 border border-border-dark rounded-button text-sm" value={form.class_id} onChange={e => setForm({...form, class_id: e.target.value})}>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Deadline</label>
                <Input required type="datetime-local" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Batal</Button>
                <Button type="submit" disabled={loading} className="flex-1">{loading ? '...' : 'Simpan'}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
