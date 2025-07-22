import { initTRPC } from '@trpc/server';
import { cache } from 'react';
import { db } from '@/db';
import { auth } from '@/lib/auth';
import { TRPCError } from '@trpc/server';
import { headers } from 'next/headers';

export type TRPCContext = {
  db: typeof db;
  session: { user: { id: string; email: string } };
};

export const createTRPCContext = async (): Promise<TRPCContext> => {
  const hdrs = await headers();
  const session = await auth.api.getSession({ headers: hdrs });
  if (!session || !session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
  }
  return {
    db,
    session: session,
  };
};

const t = initTRPC.context<TRPCContext>().create({});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure;
export const publicProcedure = t.procedure;