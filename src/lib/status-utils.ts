/**
 * Centralized status utilities for consistent status handling across components
 */

export type InquiryStatus = 
  | "draft" 
  | "open" 
  | "awarded" 
  | "closed" 
  | "cancelled" 
  | "expired" 
  | "rejected";

export type QuotationStatus = 
  | "draft" 
  | "submitted" 
  | "accepted" 
  | "rejected" 
  | "withdrawn" 
  | "expired";

export type ForwarderResponseStatus = 
  | "pending" 
  | "rejected" 
  | "quoted";

// Helper function to safely cast string to InquiryStatus
export function toInquiryStatus(status: string): InquiryStatus {
  const validStatuses: InquiryStatus[] = ["draft", "open", "awarded", "closed", "cancelled", "expired", "rejected"];
  return validStatuses.includes(status as InquiryStatus) ? status as InquiryStatus : "draft";
}

// Helper function to safely cast string to QuotationStatus
export function toQuotationStatus(status: string | null | undefined): QuotationStatus | undefined {
  if (!status) return undefined;
  const validStatuses: QuotationStatus[] = ["draft", "submitted", "accepted", "rejected", "withdrawn", "expired"];
  return validStatuses.includes(status as QuotationStatus) ? status as QuotationStatus : undefined;
}

export interface StatusContext {
  inquiryStatus: InquiryStatus;
  quotationStatus?: QuotationStatus | null;
  responseStatus?: ForwarderResponseStatus | null;
}

/**
 * Determines if an inquiry is in a state where quotations can be created
 */
export function canCreateQuotation(context: StatusContext): boolean {
  const { inquiryStatus, quotationStatus, responseStatus } = context;
  
  // Can't create quotation if inquiry is rejected, closed, cancelled, or expired
  if (inquiryStatus === "rejected" || inquiryStatus === "closed" || 
      inquiryStatus === "cancelled" || inquiryStatus === "expired") {
    return false;
  }
  
  // Can't create quotation if forwarder already rejected the inquiry
  if (responseStatus === "rejected") {
    return false;
  }
  
  // Can't create quotation if there's already a rejected quotation
  if (quotationStatus === "rejected") {
    return false;
  }
  
  // Can create quotation if inquiry is open and no quotation exists or quotation is draft
  return inquiryStatus === "open" && (!quotationStatus || quotationStatus === "draft");
}

/**
 * Determines if an inquiry can be rejected by forwarder
 */
export function canRejectInquiry(context: StatusContext): boolean {
  const { inquiryStatus, quotationStatus, responseStatus } = context;
  
  // Can't reject if inquiry is already rejected, closed, cancelled, or expired
  if (inquiryStatus === "rejected" || inquiryStatus === "closed" || 
      inquiryStatus === "cancelled" || inquiryStatus === "expired") {
    return false;
  }
  
  // Can't reject if already rejected or quoted
  if (responseStatus === "rejected" || responseStatus === "quoted") {
    return false;
  }
  
  // Can't reject if there's already a quotation (except draft)
  if (quotationStatus && quotationStatus !== "draft") {
    return false;
  }
  
  return inquiryStatus === "open";
}

/**
 * Determines if an inquiry is in a rejected state (either inquiry or quotation rejected)
 */
export function isRejected(context: StatusContext): boolean {
  return context.inquiryStatus === "rejected" || 
         context.quotationStatus === "rejected" || 
         context.responseStatus === "rejected";
}

/**
 * Determines if an inquiry is in a closed/final state
 */
export function isClosed(context: StatusContext): boolean {
  return context.inquiryStatus === "closed" || 
         context.inquiryStatus === "cancelled" || 
         context.inquiryStatus === "expired" ||
         context.inquiryStatus === "awarded";
}

/**
 * Gets the display status for UI components
 * Priority: forwarder rejected > awarded cases > quotation rejected > inquiry status
 */
export function getDisplayStatus(context: StatusContext): InquiryStatus {
  // Forwarder rejected the inquiry
  if (context.responseStatus === "rejected") {
    return "rejected";
  }
  
  // Inquiry was awarded - check quotation status
  if (context.inquiryStatus === "awarded") {
    if (context.quotationStatus === "accepted") {
      return "awarded"; // This forwarder won
    } else if (context.quotationStatus === "rejected") {
      return "rejected"; // This forwarder lost
    } else {
      return "awarded"; // Didn't participate but inquiry was awarded
    }
  }
  
  // Master inquiry rejected
  if (context.inquiryStatus === "rejected") {
    return "rejected";
  }
  
  // Quotation rejected (but inquiry not awarded)
  if (context.quotationStatus === "rejected") {
    return "rejected";
  }
  
  return context.inquiryStatus;
}

/**
 * Determines if quotation actions should be disabled
 */
export function isQuotationDisabled(context: StatusContext): boolean {
  return isRejected(context) || isClosed(context);
}

/**
 * Gets the appropriate button text for quotation actions
 */
export function getQuotationButtonText(context: StatusContext): string {
  if (context.inquiryStatus === "rejected") {
    return "Anfrage abgelehnt";
  }
  
  if (context.quotationStatus === "rejected") {
    return "Angebot abgelehnt";
  }
  
  if (context.quotationStatus === "submitted" || context.quotationStatus === "accepted") {
    return "Angebot anzeigen";
  }
  
  if (context.quotationStatus === "draft") {
    return "Angebot bearbeiten";
  }
  
  return "Angebot erstellen";
}
