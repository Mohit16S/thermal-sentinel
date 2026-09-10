import { clamp, round } from './geo';

export interface ClassificationFeatures { persistenceScore:number; industrialContextScore:number; maxBrightness:number; observationCount:number; landUse:string; meanConfidence:number; recurrenceRate:number; dayNightRatio?:number }
export function classifyEvent(f: ClassificationFeatures) {
  const evidence = [`${f.observationCount} thermal observations`, `maximum brightness ${Math.round(f.maxBrightness)} K`, `${Math.round(f.meanConfidence)}% mean sensor confidence`];
  if (f.industrialContextScore >= 65) {
    evidence.push(`industrial context score ${Math.round(f.industrialContextScore)}/100`);
    if (f.persistenceScore >= 55) return { classification:'PERSISTENT INDUSTRIAL THERMAL SOURCE', classification_confidence:round(clamp(62 + f.persistenceScore*.2 + f.industrialContextScore*.15, 0, 94)), evidence:[...evidence, 'repeated activity across multiple days'] };
    if (f.maxBrightness >= 395) return { classification:'INDUSTRIAL FIRE', classification_confidence:round(clamp(68 + (f.maxBrightness-395)*.15 + f.industrialContextScore*.1, 0, 93)), evidence:[...evidence, 'exceptionally elevated short-duration thermal signal'] };
    return { classification:'POSSIBLE INFRASTRUCTURE / ENERGY SOURCE', classification_confidence:71, evidence };
  }
  if (f.landUse === 'vegetation') return { classification:'WILDFIRE / VEGETATION FIRE', classification_confidence:84, evidence:[...evidence, 'vegetation land-use context', 'no significant industrial feature nearby'] };
  if (f.landUse === 'agriculture') return { classification:'AGRICULTURAL BURNING', classification_confidence:78, evidence:[...evidence, 'agricultural land-use context', 'moderate recurring signal'] };
  return { classification:'OTHER / UNKNOWN', classification_confidence:48, evidence:[...evidence, 'insufficient corroborating context'] };
}
