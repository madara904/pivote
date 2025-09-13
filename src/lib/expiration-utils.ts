import { eq, and, lt } from "drizzle-orm";
import { inquiry, quotation } from "@/db/schema";

/**
 * Check and update expired inquiries and quotations
 * This should be called when fetching data to ensure expired items are marked
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function checkAndUpdateExpiredItems(db: any) {
  const now = new Date();
  
  try {
    // Update expired inquiries
    const expiredInquiries = await db
      .update(inquiry)
      .set({
        status: "expired",
        closedAt: now,
      })
      .where(
        and(
          eq(inquiry.status, "offen"),
          lt(inquiry.validityDate, now)
        )
      )
      .returning({ id: inquiry.id });

    // Update expired quotations
    const expiredQuotations = await db
      .update(quotation)
      .set({
        status: "expired",
      })
      .where(
        and(
          eq(quotation.status, "submitted"),
          lt(quotation.validUntil, now)
        )
      )
      .returning({ id: quotation.id });

    console.log(`🕒 Expired ${expiredInquiries.length} inquiries and ${expiredQuotations.length} quotations`);
    
    return {
      expiredInquiries: expiredInquiries.length,
      expiredQuotations: expiredQuotations.length,
    };
  } catch (error) {
    console.error("Error checking expired items:", error);
    return {
      expiredInquiries: 0,
      expiredQuotations: 0,
    };
  }
}

/**
 * Check if an inquiry is expired
 */
export function isInquiryExpired(validityDate: Date | null): boolean {
  if (!validityDate) return false;
  return new Date() > validityDate;
}

/**
 * Check if a quotation is expired
 */
export function isQuotationExpired(validUntil: Date): boolean {
  return new Date() > validUntil;
}
