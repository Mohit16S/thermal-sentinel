import { latLngToCell } from 'h3-js';
import { Observation } from '@/types';
import { daysBetween, validCoordinate } from './geo';

export interface ObservationCluster { id:string; latitude:number; longitude:number; observations:Observation[]; activeDays:number; spanDays:number }
export function cleanObservations(rows: Observation[]) {
  const seen = new Set<string>();
  return rows.filter((o) => {
    const key = `${o.latitude.toFixed(5)}:${o.longitude.toFixed(5)}:${o.date}:${o.time}`;
    if (!validCoordinate(o.latitude,o.longitude) || !o.date || !Number.isFinite(o.brightness) || seen.has(key)) return false;
    seen.add(key); return true;
  });
}
export function clusterObservations(rows: Observation[], resolution = 7): ObservationCluster[] {
  const groups = new Map<string,Observation[]>();
  for (const row of cleanObservations(rows)) { const cell=latLngToCell(row.latitude,row.longitude,resolution); groups.set(cell,[...(groups.get(cell)??[]),row]); }
  return [...groups.entries()].map(([cell,observations]) => {
    const dates=[...new Set(observations.map(o=>o.date))].sort();
    return { id:cell, latitude:observations.reduce((s,o)=>s+o.latitude,0)/observations.length, longitude:observations.reduce((s,o)=>s+o.longitude,0)/observations.length, observations, activeDays:dates.length, spanDays:Math.max(1,daysBetween(dates[0],dates.at(-1)!)+1) };
  });
}
