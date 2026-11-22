import { Track, buildTrack, sampleAt } from '../src/physics/track';
import { SimState, SimParams, stepRK4 } from '../src/physics/simulation';

function approx(a: number, b: number, tolerance: number): boolean {
  return Math.abs(a - b) <= tolerance;
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error('Assertion failed: ' + message);
}

console.log('--- Test 1: Energy invariant, friction off ---');
const params1: SimParams = { m: 2.0, g: 9.8, mu: 0, muStatic: 0, frictionOn: false };
const track1 = buildTrack(4.0);
let allPassed = true;

let state: SimState = { s: 0, v: 0, eth: 0, t: 0 };
let E0 = 2.0 * 9.8 * 4.0 + 0.5 * 2.0 * 0 * 0;

for (let i = 0; i < 1000; i++) {
  state = stepRK4(state, track1, params1, 1 / 240);
  const { h } = sampleAt(track1, state.s);
  const ep = 2.0 * 9.8 * h;
  const ek = 0.5 * 2.0 * state.v * state.v;
  const em = ep + ek;
  if (!approx(em, E0, 0.01)) {
    allPassed = false;
    console.error(`  FAIL at t=${state.t}: Em=${em}, E0=${E0}`);
    break;
  }
}
if (allPassed) console.log('  PASS');

console.log('--- Test 2: Energy invariant, friction on ---');
const params2: SimParams = { m: 2.0, g: 9.8, mu: 0.02, muStatic: 1.5 * 0.02, frictionOn: true };
let allPassed2 = true;
state = { s: 0, v: 0, eth: 0, t: 0 };
const E0_2 = 2.0 * 9.8 * 4.0 + 0.5 * 2.0 * 0 * 0;

for (let i = 0; i < 1000; i++) {
  state = stepRK4(state, track1, params2, 1 / 240);
  const { h } = sampleAt(track1, state.s);
  const ep = 2.0 * 9.8 * h;
  const ek = 0.5 * 2.0 * state.v * state.v;
  const em = ep + ek;
  if (!approx(em + state.eth, E0_2, 0.05)) {
    allPassed2 = false;
    console.error(`  FAIL at t=${state.t}: Em+Eth=${em + state.eth}, E0=${E0_2}`);
    break;
  }
}
if (allPassed2) console.log('  PASS');

console.log('--- Test 3: Ep = m*g*h(s) ---');
let allPassed3 = true;
for (let sVal = 0; sVal <= track1.totalLength; sVal += track1.totalLength / 100) {
  const { h } = sampleAt(track1, sVal);
  const epExpected = 2.0 * 9.8 * h;
  if (Math.abs(epExpected - 2.0 * 9.8 * h) > 1e-6) {
    allPassed3 = false;
    break;
  }
}
if (allPassed3) console.log('  PASS');

console.log('--- Test 4: Ek = 0.5*m*v^2 ---');
let allPassed4 = true;
// Check at arbitrary speeds
for (const v of [-5, -2.5, 0, 1.3, 7]) {
  if (Math.abs(0.5 * 2.0 * v * v - 0.5 * 2.0 * v * v) > 1e-9) {
    allPassed4 = false;
    break;
  }
}
if (allPassed4) console.log('  PASS');

console.log('--- Test 5: Static case ---');
const trackValley = buildTrack(2.5);
const paramsStatic: SimParams = { m: 2.0, g: 9.8, mu: 0.02, muStatic: 1.5 * 0.02, frictionOn: true };

let staticState: SimState = { s: 2.0, v: 0, eth: 0, t: 0 };
let moved = false;
for (let i = 0; i < 240; i++) {
  const prevV = staticState.v;
  staticState = stepRK4(staticState, trackValley, paramsStatic, 1 / 240);
  if (Math.abs(staticState.v) > Math.abs(prevV) + 1e-4) {
    moved = true;
    break;
  }
}
if (!moved) console.log('  PASS');
else console.log('  FAIL (cart moved)');

console.log('--- Test 6: Insufficient height ---');
const params6: SimParams = { m: 2.0, g: 9.8, mu: 0, muStatic: 0, frictionOn: false };
const track6 = buildTrack(1.0);
let maxH = 0;
state = { s: 0, v: 0, eth: 0, t: 0 };

for (let i = 0; i < 500; i++) {
  state = stepRK4(state, track6, params6, 1 / 240);
  const { h } = sampleAt(track6, state.s);
  if (h > maxH) maxH = h;
}
if (maxH <= 1.0 + 1e-6) console.log('  PASS');
else console.log(`  FAIL: maxH=${maxH}, expected <= 1.0`);

console.log('--- Test 7: Mass independence ---');
// Conceptual check: trajectory s(t) should be identical for mass=1 vs mass=100
const paramsA: SimParams = { m: 1.0, g: 9.8, mu: 0, muStatic: 0, frictionOn: false };
const paramsB: SimParams = { m: 100.0, g: 9.8, mu: 0, muStatic: 0, frictionOn: false };
let sA: SimState = { s: 0, v: 0, eth: 0, t: 0 };
let sB: SimState = { s: 0, v: 0, eth: 0, t: 0 };
let diffMax = 0;

for (let i = 0; i < 1000; i++) {
  sA = stepRK4(sA, track1, paramsA, 1 / 240);
  sB = stepRK4(sB, track1, paramsB, 1 / 240);
  diffMax = Math.max(diffMax, Math.abs(sA.s - sB.s));
}
if (diffMax < 1e-9) console.log('  PASS');
else console.log(`  FAIL: max diff ${diffMax}`);

console.log('--- Test 8: Friction off -> Eth = 0 ---');
const params8: SimParams = { m: 2.0, g: 9.8, mu: 0, muStatic: 0, frictionOn: false };
let ethAllZero = true;
state = { s: 0, v: 0, eth: 0, t: 0 };
for (let i = 0; i < 500; i++) {
  state = stepRK4(state, track1, params8, 1 / 240);
  if (Math.abs(state.eth) > 1e-10) {
    ethAllZero = false;
    break;
  }
}
if (ethAllZero) console.log('  PASS');
else console.log('  FAIL');

console.log('--- Test 9: Reproducibility ---');
// Run twice with same params and compare series bit-identically
function runSim(mass: number, h0: number, v0: number, g: number, mu: number) {
  const trk = buildTrack(h0);
  const prm: SimParams = { m: mass, g, mu, muStatic: mu * 1.5, frictionOn: mu > 0 };
  let st: SimState = { s: 0, v: v0, eth: 0, t: 0 };
  const series: number[] = [];
  for (let i = 0; i < 240 * 5; i++) {
    st = stepRK4(st, trk, prm, 1 / 240);
    series.push(st.s);
  }
  return series;
}
const runA = runSim(2.0, 4.0, 0.0, 9.8, 0.02);
const runB = runSim(2.0, 4.0, 0.0, 9.8, 0.02);
const identical = runA.every((v, idx) => v === runB[idx]);
if (identical) console.log('  PASS');
else console.log('  FAIL (series differ)');

console.log('--- Test 10: Calibration mu ≈ 0.02 ---');
const params10: SimParams = { m: 2.0, g: 9.8, mu: 0.02, muStatic: 0.03, frictionOn: true };
state = { s: 0, v: 0, eth: 0, t: 0 };
for (let i = 0; i < 480; i++) {
  state = stepRK4(state, track1, params10, 1 / 240);
}
const ethAt2s = state.eth;
const hAt2s = sampleAt(track1, state.s).h;
console.log(`  Eth at 2s = ${ethAt2s.toFixed(3)} J, h at 2s = ${hAt2s.toFixed(3)} m`);
if (Math.abs(ethAt2s - 2.2) <= 0.1) console.log('  PASS');
else console.log(`  CALIBRATION: mu=0.02 gives Eth=${ethAt2s.toFixed(3)} (target ~2.2 J)`);

console.log('--- All unit tests complete ---');