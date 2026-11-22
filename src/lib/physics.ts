// Physics Constants & Calculations
export const GRAVITY = 9.81;

export interface SimulationState {
  mass: number;
  height: number;
  velocity: number;
  friction: number; // 0 to 1
  energy: {
    potential: number;
    kinetic: number;
    mechanical: number;
    thermal: number;
  };
}

export const calculateEnergy = (mass: number, height: number, velocity: number): { ep: number, ek: number, em: number } => {
  const ep = mass * GRAVITY * height;
  const ek = 0.5 * mass * Math.pow(velocity, 2);
  return { ep, ek, em: ep + ek };
};
