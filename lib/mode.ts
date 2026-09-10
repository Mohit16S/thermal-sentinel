import { DataMode } from '@/types';
export const parseMode=(value:string|null|undefined):DataMode=>value==='live'?'live':'demo';
