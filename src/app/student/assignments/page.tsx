'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: members } = await supabase.from('class_members').select('class_id, classes ( id, name, subject )').eq('student_id', user.id);
    const classIds = members?.map(m => m.classes?.id).filter(Boolean) || [];
    
    if (classIds.length === 0) { setAssignments([]); return; }
    const { data: asg } = await supabase.from('assignments').select('*, classes!inner(name)').in('class_id', classIds);
    setAssignments(asg || []);
  };

  const handleSubmit = async (assignmentId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('assignment_submissions').insert({
      assignment_id: assignmentId,
      student_id: user.id,
      status: 'SUBMITTED',
    });
    if (error) throw error;
  };

  return (
    <div className="min-h-screen bg-surface p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <Badge variant="new">TUGAS</Badge>
          <h1 className="font-display font-black text-3xl mt-1">Pekerjaan Rumah Saya</h1>
        </div>

        {assignments.length === 0 ? (
          <Card className="p-10 text-center space-y-3 border-dashed border-2 border-border">
            <div className="text-text-muted">Tidak ada tugas aktif saat ini.</div>
          </Card>
        ) : (
          <div className="space-y-3">
            {assignments.map((a) => (
              <Card key={a.id} className="p-6 border border-border space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="new">{a.classes?.name || 'Kelas'}</Badge>
                    <h2 className="font-display font-bold text-xl mt-2">{a.title}</h2>
                    <p className="text-sm text-text-muted mt-2">{a.description}</p>
                    <p className="text-xs text-text-muted mt-2">Deadline: {new Date(a.deadline).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <Button size="sm" onClick={() => handleSubmit(a.id)}>Kirim Tugas</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
