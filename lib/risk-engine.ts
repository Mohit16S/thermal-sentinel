import { Risk, RiskBreakdown } from '@/types';
import { clamp, round } from './geo';

export const RISK_WEIGHTS = { intensity:.20, confidence:.15, persistence:.20, industrial:.20, size:.10, recurrence:.10, anomaly:.05 } as const;
export interface RiskInput { maxBrightness:number; meanConfidence:number; persistenceScore:number; industrialContextScore:number; spatialExtentKm2:number; recurrenceRate:number; anomalyScore:number; activeDays:number; distanceToIndustryKm:number }
export function scoreRisk(f: RiskInput) {
  const breakdown: RiskBreakdown = { intensity:round(clamp((f.maxBrightness-280)/1.5)), confidence:round(clamp(f.meanConfidence)), persistence:round(clamp(f.persistenceScore)), industrial:round(clamp(f.industrialContextScore)), size:round(clamp(f.spatialExtentKm2*35)), recurrence:round(clamp(f.recurrenceRate*100)), anomaly:round(clamp(f.anomalyScore)) };
  const score = round(Object.entries(RISK_WEIGHTS).reduce((sum,[key,weight]) => sum + breakdown[key as keyof RiskBreakdown] * weight, 0));
  const level: Risk = score >= 76 ? 'CRITICAL' : score >= 51 ? 'HIGH' : score >= 26 ? 'MEDIUM' : 'LOW';
  const phrases:string[] = [];
  if (breakdown.intensity >= 60) phrases.push('high thermal intensity');
  if (f.activeDays > 1) phrases.push(`repeated observations over ${f.activeDays} days`);
  if (breakdown.anomaly >= 55) phrases.push('an elevated anomaly score');
  if (f.distanceToIndustryKm <= 2) phrases.push(`an industrial feature within ${Math.round(f.distanceToIndustryKm*1000)} m`);
  if (!phrases.length) phrases.push('limited intensity and contextual evidence');
  return { score, level, breakdown, explanation:`Risk ${Math.round(score)}/100 because the event has ${phrases.join(', ')}.` };
}
