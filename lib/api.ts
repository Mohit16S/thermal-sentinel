import {DataMode} from '@/types';import {findEvent,runPipeline} from './pipeline';
export async function getEvents(mode:DataMode='demo'){return(await runPipeline(mode)).events}
export async function getEvent(id:string,mode:DataMode='demo'){return findEvent(id,mode)}
export async function getStats(mode:DataMode='demo'){return(await runPipeline(mode)).stats}
