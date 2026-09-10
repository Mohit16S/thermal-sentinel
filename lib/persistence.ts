import { PersistenceLabel } from '@/types';
import { clamp, round } from './geo';

export function calculatePersistence(observationCount: number, activeDays: number, spanDays: number) {
  if (observationCount <= 1 || activeDays <= 1) return { score: 0, label: 'TRANSIENT' as PersistenceLabel, recurrenceRate: 0 };
  const recurrenceRate = Math.min(activeDays / Math.max(spanDays, 1), 1);
  const score = round(clamp(observationCount * 3 + activeDays * 4 + spanDays * 0.5 + recurrenceRate * 20));
  const label: PersistenceLabel = score >= 76 ? 'HIGHLY PERSISTENT' : score >= 51 ? 'PERSISTENT' : score >= 26 ? 'RECURRING' : 'TRANSIENT';
  return { score, label, recurrenceRate: round(recurrenceRate, 2) };
}
