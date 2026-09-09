import {getEvent} from '@/lib/api';import InvestigationClient from '@/components/InvestigationClient';import {notFound} from 'next/navigation';
export default async function Page({params}:{params:{eventId:string}}){const event=await getEvent(params.eventId);if(!event)notFound();return <InvestigationClient event={event}/>}
