export interface ExperimentPayload {
  experimentType: string;
  createdAt: string;
  params: {
    mass: number;
    initialHeight: number;
    initialVelocity: number;
    gravity: number;
    friction: boolean;
    mu: number;
  };
  status: string;
  reason: string | null;
  summary: {
    maxEk: number;
    maxEp: number;
    endEm: number;
    totalThermal: number;
    duration: number;
  };
  series: Array<{
    t: number;
    ep: number;
    ek: number;
    em: number;
    eth: number;
  }>;
  reflectionAnswer: null;
}

export async function saveExperiment(payload: ExperimentPayload): Promise<{ ok: boolean; error?: string }> {
  // Stub implementation: simulate network delay and always succeed
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('[experimentApi] saveExperiment payload:', payload);
      resolve({ ok: true });
    }, 400);
  });
}
