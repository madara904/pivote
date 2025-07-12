import { env } from '@/lib/env';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
config({ path: '.env' });
const client = postgres(env.DATABASE_URL);
export const db = drizzle({ client });