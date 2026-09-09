import {Event} from '@/types';
export const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:8000';
const SERVER_API=process.env.INTERNAL_API_URL||API;
export async function getEvents():Promise<Event[]>{try{const r=await fetch(`${SERVER_API}/api/events`,{cache:'no-store'});if(!r.ok)throw 0;return r.json()}catch{return []}}
export async function getEvent(id:string):Promise<Event|null>{try{const r=await fetch(`${SERVER_API}/api/events/${id}`,{cache:'no-store'});if(!r.ok)throw 0;return r.json()}catch{return null}}
export async function getStats(){try{const r=await fetch(`${SERVER_API}/api/dashboard/stats`,{cache:'no-store'});return r.json()}catch{return null}}
