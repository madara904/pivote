/**
 * Shipper-specific status utilities
 * Shippers have different business rules and status meanings than forwarders
 */

export type ShipperInquiryStatus = 
  | "draft" 
  | "open" 
  | "quoted"  // Special status for shipper when quotations exist
  | "awarded" 
  | "cancelled" 
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
 * Shippers care about: draft, open, quoted, awarded, cancelled, expired
 */
export function getShipperDisplayStatus(context: ShipperStatusContext): ShipperInquiryStatus {
  const { inquiryStatus, quotationCount, hasAcceptedQuotation, forwarderResponseSummary } = context;
  
  // If a quotation is accepted, show awarded regardless of inquiry status
  if (hasAcceptedQuotation || inquiryStatus === "awarded") {
    return "awarded";
  }
  
  // If inquiry is in a final state, show as is
  if (inquiryStatus === "cancelled" || inquiryStatus === "expired") {
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
 * Determines if inquiry is in a final state
 */
export function isShipperInquiryFinal(context: ShipperStatusContext): boolean {
  const { inquiryStatus, hasAcceptedQuotation } = context;
  return hasAcceptedQuotation ||
         inquiryStatus === "awarded" || 
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
    cancelled: "destructive" as const,
    expired: "destructive" as const
  };
  
  return variants[status] || "secondary";
}
