import { initTRPC } from '@trpc/server';
import { db } from '@/db';
import { auth } from '@/lib/auth';
import { TRPCError } from '@trpc/server';
import { headers } from 'next/headers';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { requireOrgId } from '@/trpc/common/membership';
import { cache } from 'react';


export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  const hdrs = await headers();
  const session = await auth.api.getSession({
    headers: hdrs
  });
  const ipAddress =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    null;
  return {
    db,
    session,
    ipAddress,
  };
});

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    if (error.code === 'BAD_REQUEST' && error.cause instanceof ZodError) {
      const firstError = error.cause.errors[0];
      const message = firstError?.message ?? shape.message;
      return { ...shape, message };
    }
    return shape;
  },
});

export const createTRPCRouter = t.router;
export const mergeRouters = t.mergeRouters;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  // Session is already in context from createTRPCContext
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "UNAUTHORIZED"
    });
  }

  // Type assertion: after the check above, we know session is non-null and has user
  return next({ 
    ctx: {
      db: ctx.db,
      session: ctx.session as NonNullable<typeof ctx.session> & { user: { id: string } },
      ipAddress: ctx.ipAddress,
    }
  });
});
export const publicProcedure = t.procedure;


export const forwarderQuotationLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  // Ensure session exists (this middleware should be used after protectedProcedure)
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "UNAUTHORIZED"
    });
  }

  // Type assertion: after the check above, we know session is non-null and has user
  const typedCtx = {
    db: ctx.db,
    session: ctx.session as NonNullable<typeof ctx.session> & { user: { id: string } },
    ipAddress: ctx.ipAddress,
  };

  const organizationId = await requireOrgId(typedCtx);
  
  const { checkQuotationLimit } = await import('@/trpc/middleware/tier-limits');
  const limitCheck = await checkQuotationLimit(typedCtx, organizationId);

  if (!limitCheck.allowed) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: limitCheck.reason,
    });
  }

  return next({
    ctx: {
      ...typedCtx,
      tierLimit: {
        current: limitCheck.current,
        limit: limitCheck.limit,
      },
    },
  });
});