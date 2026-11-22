import { Track, buildTrack, sampleAt } from '../physics/track';
import { SimState, SimParams, stepRK4 } from '../physics/simulation';

export type LabStatus = 'siap' | 'berjalan' | 'dijeda' | 'selesai';

export interface ExperimentSample {
  t: number;
  s: number;
  v: number;
  h: number;
  ep: number;
  ek: number;
  em: number;
  eth: number;
}

export interface LabState {
  // Parameters
  mass: number;
  h0: number;
  v0: number;
  g: number;
  frictionOn: boolean;
  mu: number;
  muStatic: number;

  // Status
  status: LabStatus;
  stopReason: string | null;
  
  // Simulation
  track: Track;
  currentState: SimState;
  timeSeries: ExperimentSample[];
  
  // Total Energy Initial
  e0: number;
}

type Listener = (state: LabState) => void;

class LabStore {
  private state: LabState;
  private listeners: Set<Listener> = new Set();
  private accumulator: number = 0;
  private readonly DT = 1 / 240;
  private readonly SAMPLE_INTERVAL = 0.05;
  private lastSampleT = -1;

  constructor() {
    const h0 = 4.0;
    const g = 9.8;
    const mass = 2.0;
    const v0 = 0.0;
    const mu = 0.02;
    const track = buildTrack(h0);
    
    this.state = {
      mass,
      h0,
      v0,
      g,
      frictionOn: true,
      mu,
      muStatic: mu * 1.5,
      status: 'siap',
      stopReason: null,
      track,
      currentState: { s: 0, v: v0, eth: 0, t: 0 },
      timeSeries: [],
      e0: mass * g * h0 + 0.5 * mass * v0 * v0
    };
    
    this.addSample(this.state.currentState);
  }

  getState() {
    return this.state;
  }

  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  private notify() {
    this.listeners.forEach(l => l(this.state));
  }

  setParams(updates: Partial<Pick<LabState, 'mass' | 'h0' | 'v0' | 'g' | 'frictionOn'>>) {
    const newState = { ...this.state, ...updates };
    
    // If h0 changed, rebuild track
    if (updates.h0 !== undefined) {
      newState.track = buildTrack(updates.h0);
    }
    
    newState.mu = newState.frictionOn ? 0.02 : 0;
    newState.muStatic = newState.mu * 1.5;
    newState.e0 = newState.mass * newState.g * newState.h0 + 0.5 * newState.mass * newState.v0 * newState.v0;
    
    this.state = newState;
    this.reset();
  }

  reset() {
    this.state = {
      ...this.state,
      status: 'siap',
      stopReason: null,
      currentState: { s: 0, v: this.state.v0, eth: 0, t: 0 },
      timeSeries: []
    };
    this.accumulator = 0;
    this.lastSampleT = -1;
    this.addSample(this.state.currentState);
    this.notify();
  }

  start() {
    if (this.state.status === 'selesai') return;
    this.state.status = 'berjalan';
    this.notify();
  }

  pause() {
    if (this.state.status === 'berjalan') {
      this.state.status = 'dijeda';
      this.notify();
    }
  }

  advance(wallDt: number) {
    if (this.state.status !== 'berjalan') return;

    this.accumulator += wallDt;

    while (this.accumulator >= this.DT) {
      const params: SimParams = {
        m: this.state.mass,
        g: this.state.g,
        mu: this.state.mu,
        muStatic: this.state.muStatic,
        frictionOn: this.state.frictionOn
      };

      const next = stepRK4(this.state.currentState, this.state.track, params, this.DT);
      this.state.currentState = next;
      this.accumulator -= this.DT;

      // Check stop conditions
      const { x, h } = sampleAt(this.state.track, next.s);
      const L = this.state.track.totalLength;

      if (next.s >= L && next.v > 0) {
        this.stop('Kereta mencapai ujung lintasan');
        break;
      }
      if (next.s <= 0 && next.v < 0) {
        this.stop('Kereta keluar dari titik awal');
        break;
      }
      if (next.t >= 60) {
        this.stop('Waktu percobaan habis');
        break;
      }
      
      // Static stop check
      if (Math.abs(next.v) < 1e-4) {
        const { sinPhi, cosPhi } = sampleAt(this.state.track, next.s);
        if (Math.abs(this.state.g * sinPhi) <= this.state.muStatic * this.state.g * Math.abs(cosPhi)) {
          this.stop('Kereta berhenti');
          break;
        }
      }

      // Add to time series
      if (next.t >= this.lastSampleT + this.SAMPLE_INTERVAL) {
        this.addSample(next);
        this.lastSampleT = next.t;
      }
    }
    
    this.notify();
  }

  private stop(reason: string) {
    this.state.status = 'selesai';
    this.state.stopReason = reason;
    this.addSample(this.state.currentState);
  }

  private addSample(sim: SimState) {
    const { h } = sampleAt(this.state.track, sim.s);
    const ep = this.state.mass * this.state.g * h;
    const ek = 0.5 * this.state.mass * sim.v * sim.v;
    const em = ep + ek;

    this.state.timeSeries.push({
      t: sim.t,
      s: sim.s,
      v: sim.v,
      h,
      ep,
      ek,
      em,
      eth: sim.eth
    });
  }
}

export const labStore = new LabStore();
