export interface Point2D {
  x: number;
  y: number;
}

export interface BezierSegment {
  p0: Point2D;
  p1: Point2D;
  p2: Point2D;
  p3: Point2D;
}

export interface TrackSample {
  s: number; // arc length from start
  x: number;
  h: number;
  sinPhi: number;
  cosPhi: number;
  dxds: number;
  dhds: number;
}

export interface Track {
  segments: BezierSegment[];
  samples: TrackSample[];
  totalLength: number;
}

function evalBezier(seg: BezierSegment, t: number): Point2D {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  const x = uuu * seg.p0.x + 3 * uu * t * seg.p1.x + 3 * u * tt * seg.p2.x + ttt * seg.p3.x;
  const y = uuu * seg.p0.y + 3 * uu * t * seg.p1.y + 3 * u * tt * seg.p2.y + ttt * seg.p3.y;
  return { x, y };
}

export function buildTrack(h0: number): Track {
  const segments: BezierSegment[] = [
    { p0: { x: 0.000, y: h0 }, p1: { x: 0.857, y: h0 }, p2: { x: 1.429, y: 0.000 }, p3: { x: 2.286, y: 0.000 } },
    { p0: { x: 2.286, y: 0.000 }, p1: { x: 3.143, y: 0.000 }, p2: { x: 3.997, y: 2.500 }, p3: { x: 4.857, y: 2.500 } },
    { p0: { x: 4.857, y: 2.500 }, p1: { x: 5.714, y: 2.500 }, p2: { x: 6.000, y: 0.000 }, p3: { x: 6.857, y: 0.000 } },
    { p0: { x: 6.857, y: 0.000 }, p1: { x: 7.571, y: 0.000 }, p2: { x: 7.857, y: 1.500 }, p3: { x: 8.286, y: 1.500 } },
    { p0: { x: 8.286, y: 1.500 }, p1: { x: 8.857, y: 1.500 }, p2: { x: 9.996, y: 0.000 }, p3: { x: 10.857, y: 0.000 } }
  ];

  const NUM_SEG_SAMPLES = 2000;
  const rawPoints: { x: number; h: number; ds: number }[] = [];
  let currentS = 0;

  for (let sIdx = 0; sIdx < segments.length; sIdx++) {
    const seg = segments[sIdx];
    let prevPt = evalBezier(seg, 0);
    if (sIdx === 0) {
      rawPoints.push({ x: prevPt.x, h: prevPt.y, ds: 0 });
    }

    for (let i = 1; i <= NUM_SEG_SAMPLES; i++) {
      const t = i / NUM_SEG_SAMPLES;
      const pt = evalBezier(seg, t);
      const dx = pt.x - prevPt.x;
      const dy = pt.y - prevPt.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      currentS += dist;
      rawPoints.push({ x: pt.x, h: pt.y, ds: currentS });
      prevPt = pt;
    }
  }

  const totalLength = currentS;
  const samples: TrackSample[] = [];
  const N = 8000;

  for (let i = 0; i <= N; i++) {
    const targetS = (i / N) * totalLength;
    
    let low = 0;
    let high = rawPoints.length - 1;
    while (high - low > 1) {
      const mid = Math.floor((low + high) / 2);
      if (rawPoints[mid].ds < targetS) {
        low = mid;
      } else {
        high = mid;
      }
    }

    const p0 = rawPoints[low];
    const p1 = rawPoints[high];
    const span = p1.ds - p0.ds;
    const factor = span === 0 ? 0 : (targetS - p0.ds) / span;

    const x = p0.x + factor * (p1.x - p0.x);
    const h = p0.h + factor * (p1.h - p0.h);

    samples.push({
      s: targetS,
      x,
      h,
      sinPhi: 0,
      cosPhi: 1,
      dxds: 1,
      dhds: 0
    });
  }

  // Precompute per-sample derivatives
  for (let i = 0; i < N; i++) {
    const s0 = samples[i];
    const s1 = samples[i + 1];
    const ds = s1.s - s0.s;
    const dh = s1.h - s0.h;
    const dx = s1.x - s0.x;
    const dhds = ds > 0 ? dh / ds : 0;
    const dxds = ds > 0 ? dx / ds : 1;
    const phi = Math.atan2(dh, dx);
    s0.dhds = dhds;
    s0.dxds = dxds;
    s0.sinPhi = Math.sin(phi);
    s0.cosPhi = Math.cos(phi);
  }
  // End sample
  samples[N].dhds = samples[N - 1].dhds;
  samples[N].dxds = samples[N - 1].dxds;
  samples[N].sinPhi = samples[N - 1].sinPhi;
  samples[N].cosPhi = samples[N - 1].cosPhi;

  return { segments, samples, totalLength };
}

export function sampleAt(track: Track, s: number): { x: number; h: number; sinPhi: number; cosPhi: number } {
  const clampedS = Math.max(0, Math.min(track.totalLength, s));
  const numIntervals = track.samples.length - 1;
  const idxFloat = (clampedS / track.totalLength) * numIntervals;
  const low = Math.min(numIntervals - 1, Math.floor(idxFloat));
  const high = low + 1;
  const t = idxFloat - low;

  const p0 = track.samples[low];
  const p1 = track.samples[high];

  const x = p0.x + t * (p1.x - p0.x);
  const h = p0.h + t * (p1.h - p0.h);

  // Exact slope of the linear piece: dh/ds = (h1 - h0) / (s1 - s0)
  const ds = p1.s - p0.s;
  const dh = p1.h - p0.h;
  const dx = p1.x - p0.x;
  const phi = Math.atan2(dh, dx);

  return {
    x,
    h,
    sinPhi: Math.sin(phi),
    cosPhi: Math.cos(phi)
  };
}
