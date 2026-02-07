import { db } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; // Wichtig für Vercel!

export async function GET() {
  const health = {
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || "http://localhost:3000",
    checks: {
      database: { status: "OK", responseTime: 0 },
    },
  };

  try {
    const dbStart = Date.now();
    await db.execute(sql`SELECT 1`);
    health.checks.database.responseTime = Date.now() - dbStart;
    
    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    health.status = "ERROR";
    health.checks.database.status = "ERROR";
    
    return NextResponse.json(health, { status: 503 });
  }
}