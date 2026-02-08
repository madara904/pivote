import { db } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const dbStart = Date.now();
  
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: {
        status: "up",
        responseTime: 0,
      },
    },
  };

  // Database Check
  try {
    const dbStart = Date.now();
    await db.execute(sql`SELECT 1`);
    health.checks.database.responseTime = Date.now() - dbStart;
  } catch (error) {
    health.status = "unhealthy";
    health.checks.database.status = "down";
    health.checks.database.responseTime = Date.now() - dbStart;
    
    return NextResponse.json(health, { status: 503 });
  }

  return NextResponse.json(health, { status: 200 });
}