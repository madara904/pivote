/**
 * Shipper-specific status utilities
 * Shippers have different business rules and status meanings than forwarders
 */

export type ShipperInquiryStatus = 
  | "draft" 
  | "open" 
  | "quoted"  // Special status for shipper when quotations exist
  | "awarded" 
  | "closed" 
  | "cancelled" 
  | "expired";

export type ShipperQuotationStatus = 
  | "draft" 
  | "submitted" 
  | "accepted" 
  | "rejected" 
  | "withdrawn" 
  | "expired";

export interface ShipperStatusContext {
  inquiryStatus: ShipperInquiryStatus;
  quotationCount: number;
  hasAcceptedQuotation: boolean;
  hasRejectedQuotations: boolean;
  forwarderResponseSummary?: {
    total: number;
    pending: number;
    rejected: number;
    quoted: number;
  };
}

/**
 * Determines the display status for shipper UI
 * Shippers care about: draft, open, quoted, awarded, closed, cancelled, expired
 */
export function getShipperDisplayStatus(context: ShipperStatusContext): ShipperInquiryStatus {
  const { inquiryStatus, quotationCount, hasAcceptedQuotation, forwarderResponseSummary } = context;
  
  // If inquiry is awarded, show awarded
  if (inquiryStatus === "awarded") {
    return "awarded";
  }
  
  // If inquiry is closed, cancelled, or expired, show as is
  if (inquiryStatus === "closed" || inquiryStatus === "cancelled" || inquiryStatus === "expired") {
    return inquiryStatus;
  }
  
  // If inquiry is open, determine based on quotations
  if (inquiryStatus === "open") {
    if (hasAcceptedQuotation) {
      return "awarded"; // Shouldn't happen, but safety check
    }
    
    if (quotationCount > 0) {
      return "quoted"; // Has quotations, show as "quoted" (waiting for decision)
    }
    
    // Check forwarder responses
    if (forwarderResponseSummary) {
      if (forwarderResponseSummary.quoted > 0) {
        return "quoted"; // Has quotations from forwarders
      }
      
      if (forwarderResponseSummary.rejected === forwarderResponseSummary.total) {
        return "closed"; // All forwarders rejected
      }
      
      if (forwarderResponseSummary.pending > 0) {
        return "open"; // Still waiting for responses
      }
    }
    
    return "open"; // Default for open inquiries
  }
  
  // Draft stays draft
  if (inquiryStatus === "draft") {
    return "draft";
  }
  
  return inquiryStatus;
}

/**
 * Determines if shipper can cancel an inquiry
 */
export function canShipperCancelInquiry(context: ShipperStatusContext): boolean {
  const { inquiryStatus, quotationCount } = context;
  
  // Can only cancel if draft or open with no quotations
  return (inquiryStatus === "draft" || inquiryStatus === "open") && quotationCount === 0;
}

/**
 * Determines if shipper can close an inquiry
 * BUSINESS RULE: Shippers cannot manually close inquiries - only automatic closing
 */
export function canShipperCloseInquiry(_context: ShipperStatusContext): boolean {
  // Business rule: No manual closing allowed
  return false;
}

/**
 * Determines if inquiry is in a final state
 */
export function isShipperInquiryFinal(context: ShipperStatusContext): boolean {
  const { inquiryStatus } = context;
  return inquiryStatus === "awarded" || 
         inquiryStatus === "closed" || 
         inquiryStatus === "cancelled" || 
         inquiryStatus === "expired";
}

/**
 * Gets the status label for display
 */
export function getShipperStatusLabel(status: ShipperInquiryStatus): string {
  const labels = {
    draft: "Entwurf",
    open: "Offen",
    quoted: "Angebote erhalten",
    awarded: "Beauftragt", 
    closed: "Abgeschlossen",
    cancelled: "Storniert",
    expired: "Abgelaufen"
  };
  
  return labels[status] || status;
}

/**
 * Gets the status variant for UI components
 */
export function getShipperStatusVariant(status: ShipperInquiryStatus): "default" | "secondary" | "destructive" | "outline" {
  const variants = {
    draft: "secondary" as const,
    open: "default" as const,
    quoted: "outline" as const,
    awarded: "default" as const,
    closed: "secondary" as const,
    cancelled: "destructive" as const,
    expired: "destructive" as const
  };
  
  return variants[status] || "secondary";
}
