import {NextRequest,NextResponse} from 'next/server';import {parseMode} from '@/lib/mode';import {runPipeline} from '@/lib/pipeline';
export async function GET(request:NextRequest){const result=await runPipeline(parseMode(request.nextUrl.searchParams.get('mode')));return NextResponse.json(result.events.filter(e=>e.risk_level==='HIGH'||e.risk_level==='CRITICAL'))}
