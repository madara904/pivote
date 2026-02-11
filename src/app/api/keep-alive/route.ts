import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // warm-up
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pivote.vercel.app';
    

    const dashboardResponse = await fetch(`${baseUrl}/dashboard`, {
      method: 'HEAD', 
      headers: {
        'User-Agent': 'KeepAlive-Bot',
      },
    });

    const duration = Date.now() - startTime;

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      dashboard: dashboardResponse.ok ? 'warm' : 'error',
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}