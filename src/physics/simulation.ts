import { Track, sampleAt } from './track';

export interface SimState {
  s: number;
  v: number;
  eth: number;
  t: number;
}

export interface SimParams {
  m: number;
  g: number;
  mu: number; // kinetic friction
  muStatic: number;
  frictionOn: boolean;
}

export function getDerivatives(state: SimState, track: Track, params: SimParams): { ds: number; dv: number; deth: number } {
  const { s, v } = state;
  const { sinPhi, cosPhi } = sampleAt(track, s);

  const gravityAcc = -params.g * sinPhi;
  const staticLimit = params.muStatic * params.g * Math.abs(cosPhi);

  let dv = 0;
  let deth = 0;

  if (Math.abs(v) < 1e-4) {
    // Check static equilibrium
    if (Math.abs(gravityAcc) <= staticLimit) {
      dv = 0;
      deth = 0;
    } else {
      // Static friction overcome, begins moving in direction of gravity acceleration
      const signAcc = Math.sign(gravityAcc);
      const frictionAcc = params.mu * params.g * Math.abs(cosPhi) * signAcc;
      dv = gravityAcc - frictionAcc;
      deth = params.mu * params.m * params.g * Math.abs(cosPhi) * Math.abs(v);
    }
  } else {
    // Dynamic friction
    const frictionAcc = params.mu * params.g * Math.abs(cosPhi) * Math.sign(v);
    dv = gravityAcc - frictionAcc;
    deth = params.mu * params.m * params.g * Math.abs(cosPhi) * Math.abs(v);
  }

  return {
    ds: v,
    dv,
    deth
  };
}

export function stepRK4(state: SimState, track: Track, params: SimParams, dt: number): SimState {
  const k1 = getDerivatives(state, track, params);

  const s1: SimState = {
    s: state.s + 0.5 * dt * k1.ds,
    v: state.v + 0.5 * dt * k1.dv,
    eth: state.eth + 0.5 * dt * k1.deth,
    t: state.t + 0.5 * dt
  };
  const k2 = getDerivatives(s1, track, params);

  const s2: SimState = {
    s: state.s + 0.5 * dt * k2.ds,
    v: state.v + 0.5 * dt * k2.dv,
    eth: state.eth + 0.5 * dt * k2.deth,
    t: state.t + 0.5 * dt
  };
  const k3 = getDerivatives(s2, track, params);

  const s3: SimState = {
    s: state.s + dt * k3.ds,
    v: state.v + dt * k3.dv,
    eth: state.eth + dt * k3.deth,
    t: state.t + dt
  };
  const k4 = getDerivatives(s3, track, params);

  const nextS = state.s + (dt / 6) * (k1.ds + 2 * k2.ds + 2 * k3.ds + k4.ds);
  const nextV = state.v + (dt / 6) * (k1.dv + 2 * k2.dv + 2 * k3.dv + k4.dv);
  const nextEth = state.eth + (dt / 6) * (k1.deth + 2 * k2.deth + 2 * k3.deth + k4.deth);

  return {
    s: nextS,
    v: nextV,
    eth: Math.max(0, nextEth),
    t: state.t + dt
  };
}
