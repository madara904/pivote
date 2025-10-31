import { eq, and, lt } from "drizzle-orm";
import { inquiry, quotation } from "@/db/schema";
import { db } from '@/db';
import { isDateInPast } from './date-utils';

// Cache to prevent frequent expiration checks
let lastExpirationCheck = 0;
const EXPIRATION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

type DbType = typeof db;

/**
 * Check and update expired inquiries and quotations
 * This should be called when fetching data to ensure expired items are marked
 * Now optimized to only run every 5 minutes instead of on every request
 */
export async function checkAndUpdateExpiredItems(db: DbType) {
  const now = Date.now();
  
  // Only run expiration check every 5 minutes
  if (now - lastExpirationCheck < EXPIRATION_CHECK_INTERVAL) {
    return {
      expiredInquiries: 0,
      expiredQuotations: 0,
      skipped: true
    };
  }
  
  lastExpirationCheck = now;
  const currentDate = new Date();
  
  try {
    // Use more efficient queries - first find expired items, then update in batches
    // Find expired inquiries first (limit to 100 at a time)
    const expiredInquiryIds = await db
      .select({ id: inquiry.id })
      .from(inquiry)
      .where(
        and(
          eq(inquiry.status, "open"),
          lt(inquiry.validityDate, currentDate)
        )
      )
      .limit(100);

    // Update expired inquiries in batch
    const expiredInquiries = expiredInquiryIds.length > 0 ? await db
      .update(inquiry)
      .set({
        status: "expired",
        closedAt: currentDate,
      })
      .where(
        and(
          eq(inquiry.status, "open"),
          lt(inquiry.validityDate, currentDate)
        )
      )
      .returning({ id: inquiry.id }) : [];

    // Find expired quotations first (limit to 100 at a time)
    const expiredQuotationIds = await db
      .select({ id: quotation.id })
      .from(quotation)
      .where(
        and(
          eq(quotation.status, "submitted"),
          lt(quotation.validUntil, currentDate)
        )
      )
      .limit(100);

    // Update expired quotations in batch
    const expiredQuotations = expiredQuotationIds.length > 0 ? await db
      .update(quotation)
      .set({
        status: "expired",
      })
      .where(
        and(
          eq(quotation.status, "submitted"),
          lt(quotation.validUntil, currentDate)
        )
      )
      .returning({ id: quotation.id }) : [];

    return {
      expiredInquiries: expiredInquiries.length,
      expiredQuotations: expiredQuotations.length,
      skipped: false
    };
  } catch (error) {
    return {
      expiredInquiries: 0,
      expiredQuotations: 0,
      skipped: false
    };
  }
}
