import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Deine /dashboard Seite vorwärmen
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deine-app.vercel.app';
    
    // Warmup Request zu /dashboard
    const dashboardResponse = await fetch(`${baseUrl}/dashboard`, {
      method: 'HEAD', // HEAD statt GET spart Bandbreite
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