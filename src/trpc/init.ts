import { initTRPC } from '@trpc/server';
import { db } from '@/db';
import { auth } from '@/lib/auth';
import { TRPCError } from '@trpc/server';
import { headers } from 'next/headers';
import superjson from 'superjson';
import { requireOrgId } from '@/trpc/common/membership';

export type TRPCContext = {
  db: typeof db;
  session: { user: { id: string; email: string } };
};

export const createTRPCContext = async (): Promise<TRPCContext> => {
  const hdrs = await headers();
  const session = await auth.api.getSession({ headers: hdrs });
  
  if (!session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  
  return { db, session };
};

export const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const mergeRouters = t.mergeRouters;
export const createCallerFactory = t.createCallerFactory;
export const protectedProcedure = t.procedure;
export const publicProcedure = t.procedure;


export const forwarderQuotationLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  const organizationId = await requireOrgId(ctx);
  
  const { checkQuotationLimit } = await import('@/trpc/middleware/tier-limits');
  const limitCheck = await checkQuotationLimit(ctx, organizationId);

  if (!limitCheck.allowed) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: limitCheck.reason,
    });
  }

  return next({
    ctx: {
      ...ctx,
      tierLimit: {
        current: limitCheck.current,
        limit: limitCheck.limit,
      },
    },
  });
});