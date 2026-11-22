'use client';

import React, { useState, useEffect, useRef } from 'react';
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
        // Simplified coaster physics: object follows a U-curve
        // h(x) = h0 * cos(x) approx
        // For simplicity in MVP, we simulate a 1D vertical drop then bounce
        let newH = prev.h - (prev.v * dt + 0.5 * GRAVITY * dt * dt);
        let newV = prev.v + GRAVITY * dt;
        
        if (newH <= 0) {
          newH = 0;
          newV = -newV * (1 - friction); // Bounce back with energy loss
          if (Math.abs(newV) < 0.5) {
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
    <div className="min-h-screen bg-surface p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <Badge variant="new">SIMULASI</Badge>
            <h1 className="font-display font-black text-3xl mt-1">Energy Lab: Roller Coaster</h1>
          </div>
          <div className="flex gap-2">
             <Button variant="secondary" onClick={resetSimulation}>Reset</Button>
             <Button onClick={() => setIsRunning(!isRunning)}>
               {isRunning ? 'Pause' : 'Mulai Simulasi'}
             </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 h-[400px] relative overflow-hidden bg-navy-darker flex items-end p-0">
             {/* Coaster Track Illustration */}
             <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
               <path d="M0 50 Q 300 600 600 400 T 1200 400" stroke="white" strokeWidth="4" fill="none" />
             </svg>
             
             {/* Moving Object */}
             <div 
               className="absolute w-10 h-10 bg-orange-accent rounded-lg shadow-[0_0_20px_rgba(255,159,67,0.5)] transition-all duration-75"
               style={{ 
                 bottom: `${(state.h / initialHeight) * 80}%`,
                 left: '50%',
                 transform: 'translateX(-50%)'
               }}
             />

             <div className="z-10 w-full p-4 bg-navy/80 backdrop-blur-sm text-white grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-[10px] text-white/60 uppercase">Tinggi (h)</div>
                  <div className="font-mono text-xl font-bold">{state.h.toFixed(1)}m</div>
                </div>
                <div>
                  <div className="text-[10px] text-white/60 uppercase">Kecepatan (v)</div>
                  <div className="font-mono text-xl font-bold">{state.v.toFixed(1)}m/s</div>
                </div>
                <div>
                  <div className="text-[10px] text-white/60 uppercase">Energi Potensial</div>
                  <div className="font-mono text-xl font-bold text-cyan-accent">{(state.ep/1000).toFixed(1)}kJ</div>
                </div>
                <div>
                  <div className="text-[10px] text-white/60 uppercase">Energi Kinetik</div>
                  <div className="font-mono text-xl font-bold text-orange-accent">{(state.ek/1000).toFixed(1)}kJ</div>
                </div>
             </div>
          </Card>

          <Card className="space-y-6">
            <h2 className="font-display font-bold text-xl">Parameter</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-text-muted flex justify-between">
                  MASSA (m) <span>{mass} kg</span>
                </label>
                <input type="range" min="10" max="100" value={mass} onChange={(e) => setMass(Number(e.target.value))} className="w-full mt-2" />
              </div>
              <div>
                <label className="text-xs font-bold text-text-muted flex justify-between">
                  TINGGI AWAL (h) <span>{initialHeight} m</span>
                </label>
                <input type="range" min="10" max="100" value={initialHeight} onChange={(e) => setInitialHeight(Number(e.target.value))} className="w-full mt-2" />
              </div>
              <div>
                <label className="text-xs font-bold text-text-muted flex justify-between">
                  GESEKAN (f) <span>{(friction * 100).toFixed(0)}%</span>
                </label>
                <input type="range" min="0" max="0.5" step="0.01" value={friction} onChange={(e) => setFriction(Number(e.target.value))} className="w-full mt-2" />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
               <h3 className="text-sm font-bold mb-3">Analisis Energi</h3>
               <div className="space-y-2">
                 <div className="flex justify-between text-xs">
                   <span>Potensial</span>
                   <span>{((state.ep/state.em)*100).toFixed(0)}%</span>
                 </div>
                 <div className="h-2 rounded-full bg-border overflow-hidden flex">
                   <div className="h-full bg-cyan-accent" style={{ width: `${(state.ep/state.em)*100}%` }} />
                   <div className="h-full bg-orange-accent" style={{ width: `${(state.ek/state.em)*100}%` }} />
                   <div className="h-full bg-red-400" style={{ width: `${(state.eth/state.em)*100}%` }} />
                 </div>
                 <div className="flex justify-between text-[10px] text-text-muted">
                    <span>Mekanik: {(state.em/1000).toFixed(1)}kJ</span>
                    <span>Termal: {(state.eth/1000).toFixed(1)}kJ</span>
                 </div>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
