'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { calculateEnergy, GRAVITY } from '@/lib/physics';

export default function EnergyLab() {
  const [mass, setMass] = useState(50);
  const [initialHeight, setInitialHeight] = useState(50);
  const [friction, setFriction] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  const [state, setState] = useState({
    h: 50,
    v: 0,
    ep: 0,
    ek: 0,
    eth: 0,
    em: 0
  });

  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();

  const resetSimulation = () => {
    setIsRunning(false);
    const { ep, ek, em } = calculateEnergy(mass, initialHeight, 0);
    setState({ h: initialHeight, v: 0, ep, ek, eth: 0, em });
  };

  useEffect(() => {
    resetSimulation();
  }, [mass, initialHeight]);

  const animate = (time: number) => {
    if (lastTimeRef.current !== undefined) {
      const dt = (time - lastTimeRef.current) / 1000;
      
      setState(prev => {
        // Drop physics
        let newH = prev.h - (prev.v * dt + 0.5 * GRAVITY * dt * dt);
        let newV = prev.v + GRAVITY * dt;
        
        if (newH <= 0) {
          newH = 0;
          newV = -newV * (1 - friction); 
          if (Math.abs(newV) < 1) {
             setIsRunning(false);
             newV = 0;
          }
        }

        const { ep, ek } = calculateEnergy(mass, newH, newV);
        const loss = friction > 0 ? (prev.em - (ep + ek)) : 0;
        
        return {
          h: newH,
          v: Math.abs(newV),
          ep,
          ek,
          eth: prev.eth + Math.max(0, loss),
          em: prev.em
        };
      });
    }
    lastTimeRef.current = time;
    if (isRunning) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning]);

  return (
    <div className="min-h-screen bg-surface p-8 font-sans text-navy-deep">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/student/dashboard">
              <Button variant="secondary" size="sm">← Kembali</Button>
            </Link>
            <div>
              <Badge variant="new">LAB FISIKA</Badge>
              <h1 className="font-display font-black text-2xl mt-1">Simulasi Konservasi Energi</h1>
            </div>
          </div>
          <div className="flex gap-2">
             <Button variant="secondary" onClick={resetSimulation}>Reset</Button>
             <Button onClick={() => setIsRunning(!isRunning)} variant={isRunning ? 'secondary' : 'primary'}>
               {isRunning ? 'Berhenti' : 'Mulai Simulasi'}
             </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 h-[500px] relative overflow-hidden bg-navy-darker flex items-end p-0 border-none shadow-2xl">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(53,106,230,0.1),transparent)]" />
             
             {/* Path */}
             <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
               <path d="M 0 50 L 600 450 L 1200 450" stroke="white" strokeWidth="2" fill="none" strokeDasharray="8 8" />
             </svg>
             
             {/* Object */}
             <div 
               className="absolute w-12 h-12 bg-orange-accent rounded-2xl shadow-[0_0_30px_rgba(255,159,67,0.6)] flex items-center justify-center text-xl transition-all duration-75"
               style={{ 
                 bottom: `${(state.h / 100) * 80 + 10}%`,
                 left: '50%',
                 transform: 'translateX(-50%)'
               }}
             >
               🏀
             </div>

             {/* Floor */}
             <div className="absolute bottom-0 w-full h-[10%] bg-white/5 border-t border-white/10 backdrop-blur-sm" />

             {/* Stats Overlay */}
             <div className="z-10 w-full p-6 bg-navy/90 backdrop-blur-md border-t border-white/10 text-white grid grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Tinggi</div>
                  <div className="font-mono text-2xl font-black">{state.h.toFixed(1)}<span className="text-sm font-normal ml-1">m</span></div>
                </div>
                <div>
                  <div className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Kecepatan</div>
                  <div className="font-mono text-2xl font-black">{state.v.toFixed(1)}<span className="text-sm font-normal ml-1">m/s</span></div>
                </div>
                <div>
                  <div className="text-[10px] text-white/50 uppercase font-bold tracking-wider text-cyan-accent">E. Potensial</div>
                  <div className="font-mono text-2xl font-black text-cyan-accent">{(state.ep/1000).toFixed(1)}<span className="text-sm font-normal ml-1">kJ</span></div>
                </div>
                <div>
                  <div className="text-[10px] text-white/50 uppercase font-bold tracking-wider text-orange-accent">E. Kinetik</div>
                  <div className="font-mono text-2xl font-black text-orange-accent">{(state.ek/1000).toFixed(1)}<span className="text-sm font-normal ml-1">kJ</span></div>
                </div>
             </div>
          </Card>

          <Card className="p-6 space-y-8 bg-white border border-border shadow-card">
            <div className="space-y-4">
              <h2 className="font-display font-bold text-xl flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-surface text-primary text-sm">⚙</span> Parameter
              </h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-xs font-bold text-navy uppercase tracking-tight">Massa (kg)</label>
                    <span className="font-mono font-bold text-primary">{mass}</span>
                  </div>
                  <input type="range" min="10" max="100" value={mass} onChange={(e) => setMass(Number(e.target.value))} className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-xs font-bold text-navy uppercase tracking-tight">Tinggi Awal (m)</label>
                    <span className="font-mono font-bold text-primary">{initialHeight}</span>
                  </div>
                  <input type="range" min="10" max="100" value={initialHeight} onChange={(e) => setInitialHeight(Number(e.target.value))} className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-xs font-bold text-navy uppercase tracking-tight">Gesekan (%)</label>
                    <span className="font-mono font-bold text-primary">{(friction * 100).toFixed(0)}</span>
                  </div>
                  <input type="range" min="0" max="0.5" step="0.01" value={friction} onChange={(e) => setFriction(Number(e.target.value))} className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border">
               <h3 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
                 <span className="p-1.5 rounded-lg bg-surface text-orange-accent text-sm">📊</span> Distribusi Energi
               </h3>
               <div className="space-y-3">
                 <div className="h-4 rounded-full bg-surface overflow-hidden flex shadow-inner">
                   <div className="h-full bg-cyan-accent transition-all duration-200" style={{ width: `${state.em > 0 ? (state.ep/state.em)*100 : 0}%` }} />
                   <div className="h-full bg-orange-accent transition-all duration-200" style={{ width: `${state.em > 0 ? (state.ek/state.em)*100 : 0}%` }} />
                   <div className="h-full bg-red-400 transition-all duration-200" style={{ width: `${state.em > 0 ? (state.eth/state.em)*100 : 0}%` }} />
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted">
                      <div className="w-2 h-2 rounded-full bg-cyan-accent" /> EP
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted">
                      <div className="w-2 h-2 rounded-full bg-orange-accent" /> EK
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted">
                      <div className="w-2 h-2 rounded-full bg-red-400" /> Panas
                    </div>
                 </div>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
