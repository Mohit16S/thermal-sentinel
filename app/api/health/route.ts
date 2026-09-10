import { NextResponse } from 'next/server';
export const runtime='nodejs';
export async function GET(){return NextResponse.json({status:'healthy',architecture:'single Next.js application',runtime:'Vercel-compatible Route Handlers',sourceStatus:{firms:process.env.NASA_FIRMS_API_KEY?'configured':'demo fallback',osm:'cached server-side adapter',satellite:'context adapter'}})}
