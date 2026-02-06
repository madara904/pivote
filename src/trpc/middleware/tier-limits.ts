import { eq, and, gte, sql, inArray, ne } from 'drizzle-orm';
import { quotation, subscription, organizationConnection } from '@/db/schema';
import { db } from '@/db';

/**
 * Helper function to get subscription for an organization
 */
export async function getOrganizationSubscription(
  ctx: { db: typeof db },
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
  ctx: { db: typeof db },
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
  ctx: { db: typeof db },
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

type ConnectionRole = "shipper" | "forwarder";

async function getConnectionCount(
  ctx: { db: typeof db },
  organizationId: string,
  role: ConnectionRole,
  excludeConnectionId?: string
): Promise<number> {
  const { db } = ctx;
  const statusFilter = ["pending", "connected"] as const;
  const baseWhere =
    role === "shipper"
      ? eq(organizationConnection.shipperOrganizationId, organizationId)
      : eq(organizationConnection.forwarderOrganizationId, organizationId);

  const whereClause = excludeConnectionId
    ? and(baseWhere, inArray(organizationConnection.status, statusFilter), ne(organizationConnection.id, excludeConnectionId))
    : and(baseWhere, inArray(organizationConnection.status, statusFilter));

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(organizationConnection)
    .where(whereClause);

  return result[0]?.count ?? 0;
}

export const checkConnectionLimit = async (
  ctx: { db: typeof db },
  organizationId: string,
  role: ConnectionRole,
  excludeConnectionId?: string
): Promise<{ allowed: boolean; reason?: string; current: number; limit: number }> => {
  const subscription = await getOrganizationSubscription(ctx, organizationId);

  if (subscription.tier !== "basic") {
    return { allowed: true, current: 0, limit: Infinity };
  }

  const current = await getConnectionCount(ctx, organizationId, role, excludeConnectionId);
  const limit = 1;

  if (current >= limit) {
    return {
      allowed: false,
      reason:
        "Sie haben Ihr Verbindungs-Limit erreicht. Upgrade auf Medium oder Advanced für mehr Verbindungen.",
      current,
      limit,
    };
  }

  return { allowed: true, current, limit };
};
