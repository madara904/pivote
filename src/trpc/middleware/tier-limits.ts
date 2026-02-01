import { eq, and, gte, sql } from 'drizzle-orm';
import { quotation, subscription } from '@/db/schema';
import type { TRPCContext } from '@/trpc/init';

/**
 * Helper function to get subscription for an organization
 */
export async function getOrganizationSubscription(
  ctx: TRPCContext,
  organizationId: string
) {
  const { db } = ctx;

  const subscriptionResult = await db
    .select()
    .from(subscription)
    .where(eq(subscription.organizationId, organizationId))
    .limit(1);

  // If no subscription exists, create default "basic" subscription
  if (subscriptionResult.length === 0) {
    const defaultSubscription = await db
      .insert(subscription)
      .values({
        organizationId,
        tier: 'basic',
        status: 'active',
        maxQuotationsPerMonth: 5,
      })
      .returning();

    return defaultSubscription[0];
  }

  return subscriptionResult[0];
}

/**
 * Helper function to count quotations created this month
 */
export async function getQuotationsThisMonth(
  ctx: TRPCContext,
  organizationId: string
): Promise<number> {
  const { db } = ctx;

  // Get first day of current month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(quotation)
    .where(
      and(
        eq(quotation.forwarderOrganizationId, organizationId),
        gte(quotation.createdAt, firstDayOfMonth)
      )
    );

  return result[0]?.count ?? 0;
}

/**
 * Check if organization can create quotation based on tier limits
 */
export async function checkQuotationLimit(
  ctx: TRPCContext,
  organizationId: string
): Promise<{ allowed: boolean; reason?: string; current: number; limit: number }> {
  const subscription = await getOrganizationSubscription(ctx, organizationId);

  // If tier is medium or advanced, no limit (null = unlimited)
  if (subscription.tier !== 'basic' || !subscription.maxQuotationsPerMonth) {
    return {
      allowed: true,
      current: 0,
      limit: subscription.maxQuotationsPerMonth ?? Infinity,
    };
  }

  const quotationsThisMonth = await getQuotationsThisMonth(ctx, organizationId);
  const limit = subscription.maxQuotationsPerMonth;

  if (quotationsThisMonth >= limit) {
    return {
      allowed: false,
      reason: `Sie haben Ihr Monatslimit von ${limit} Angeboten erreicht. Upgrade auf Medium oder Advanced für mehr Angebote.`,
      current: quotationsThisMonth,
      limit,
    };
  }

  return {
    allowed: true,
    current: quotationsThisMonth,
    limit,
  };
}

