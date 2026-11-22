import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

export default function Home() {
  return (
    <main className="min-h-screen p-16 max-w-[1200px] mx-auto space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="font-display font-extrabold text-4xl tracking-tight">ENERGIA</h1>
          <p className="text-lg text-text-muted mt-1">Explore. Experiment. Play. Understand.</p>
        </div>
        <div className="text-sm text-text-muted">Fondasi visual · v1.0</div>
      </header>

      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl">Palet Warna</h2>
        <div className="grid grid-cols-4 md:grid-cols-9 gap-3">
          {[
            { name: 'Deep navy', hex: '#101A35', class: 'bg-navy-deep' },
            { name: 'Navy', hex: '#1D2B50', class: 'bg-navy' },
            { name: 'Blue · primer', hex: '#356AE6', class: 'bg-primary' },
            { name: 'Cyan · aksen', hex: '#39C6E8', class: 'bg-cyan-accent' },
            { name: 'Orange · aksen', hex: '#FF9F43', class: 'bg-orange-accent' },
            { name: 'Yellow · XP', hex: '#FFD166', class: 'bg-yellow-xp' },
            { name: 'Green · sukses', hex: '#28A879', class: 'bg-green-success' },
            { name: 'Surface', hex: '#F5F7FB', class: 'bg-surface border border-border-dark' },
            { name: 'White · kartu', hex: '#FFFFFF', class: 'bg-white border border-border-dark' },
          ].map((color) => (
            <div key={color.name}>
              <div className={`h-24 rounded-2xl ${color.class}`} />
              <div className="font-semibold text-sm mt-2">{color.name}</div>
              <div className="text-xs text-text-muted">{color.hex}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section className="space-y-6">
          <h2 className="font-display font-bold text-xl">Tipografi</h2>
          <Card className="space-y-6">
            <div>
              <div className="font-display font-extrabold text-4xl leading-tight">Gaya Hidup Energi</div>
              <div className="text-xs text-text-muted mt-1">Display · Plus Jakarta Sans 800 · 40/48</div>
            </div>
            <div>
              <div className="font-display font-bold text-3xl">Hukum Newton Kedua</div>
              <div className="text-xs text-text-muted mt-1">H2 · Plus Jakarta Sans 700 · 28/36</div>
            </div>
            <div>
              <div className="font-display font-bold text-xl">Misi Hari Ini</div>
              <div className="text-xs text-text-muted mt-1">H3 · Plus Jakarta Sans 700 · 20/28</div>
            </div>
            <div>
              <div className="text-base leading-relaxed">Gaya adalah dorongan atau tarikan yang mengubah gerak benda.</div>
              <div className="text-xs text-text-muted mt-1">Body · Inter 400 · 16/24</div>
            </div>
          </Card>
        </section>

        <section className="space-y-6">
          <h2 className="font-display font-bold text-xl">Komponen</h2>
          <Card className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg">Tombol</h3>
              <div className="flex flex-wrap gap-3 items-center">
                <Button>Mulai belajar</Button>
                <Button variant="secondary">Lihat detail</Button>
                <Button variant="accent">Ambil misi</Button>
                <Button variant="disabled">Terkunci</Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg">Lencana & Chip</h3>
              <div className="flex flex-wrap gap-3">
                <Badge variant="xp">⚡ 1.240 XP</Badge>
                <Badge variant="continue">Lanjutkan</Badge>
                <Badge variant="done">Selesai</Badge>
                <Badge variant="new">Baru</Badge>
                <Badge variant="level">Level 3</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg">Input</h3>
              <Input 
                placeholder="Cari bab atau percobaan..."
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"></circle><path d="M21 21l-4.3-4.3"></path></svg>
                }
              />
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
