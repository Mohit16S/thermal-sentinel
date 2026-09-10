import distance from '@turf/distance';
import { point } from '@turf/helpers';

export const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
export const round = (value: number, digits = 1) => Number(value.toFixed(digits));
export const validCoordinate = (latitude: number, longitude: number) =>
  Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
export const distanceKm = (aLat: number, aLon: number, bLat: number, bLon: number) =>
  distance(point([aLon, aLat]), point([bLon, bLat]), { units: 'kilometers' });
export const daysBetween = (start: string, end: string) =>
  Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000));
