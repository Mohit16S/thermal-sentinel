import { clamp, round } from './geo';

export interface AnomalyInput { brightness: number; regionalMean: number; localDensity: number; recurrenceRate: number; spatialIsolation?: number }
export function calculateAnomaly(input: AnomalyInput) {
  const brightnessDeviation = clamp((input.brightness - input.regionalMean) / 120, 0, 1);
  const densityAnomaly = 1 - clamp(input.localDensity, 0, 1);
  const temporalAnomaly = clamp(input.recurrenceRate, 0, 1);
  const spatialAnomaly = clamp(input.spatialIsolation ?? densityAnomaly, 0, 1);
  return round(clamp(50 * brightnessDeviation + 15 * densityAnomaly + 20 * temporalAnomaly + 15 * spatialAnomaly));
}
