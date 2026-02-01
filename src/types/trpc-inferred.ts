// ============================================================================
// tRPC INFERRED TYPES
// ============================================================================
// This file demonstrates the incredible power of tRPC type inference!

import { inferRouterOutputs, inferRouterInputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";


// ============================================================================
// OUTPUT TYPES (What your procedures return)
// ============================================================================

export type RouterOutputs = inferRouterOutputs<AppRouter>;

// Inquiry-related types
export type InquiryGetOne = RouterOutputs["inquiry"]["forwarder"]["getInquiryDetail"];
export type InquiryList = RouterOutputs["inquiry"]["forwarder"]["getMyInquiriesFast"];
export type InquiryCreate = RouterOutputs["inquiry"]["shipper"]["createInquiry"];
export type ShipperInquiryList = RouterOutputs["inquiry"]["shipper"]["getMyInquiries"];

// Quotation-related types (using actual procedure names)
export type QuotationCreate = RouterOutputs["quotation"]["forwarder"]["createQuotation"];

// Organization-related types (using actual procedure names)
export type OrganizationGetMyOrganizations = RouterOutputs["organization"]["getMyOrganizations"];
export type ForwarderList = RouterOutputs["inquiry"]["shipper"]["getAllForwarders"];

// ============================================================================
// INPUT TYPES (What your procedures expect)
// ============================================================================

export type RouterInputs = inferRouterInputs<AppRouter>;

// Inquiry input types
export type InquiryCreateInput = RouterInputs["inquiry"]["shipper"]["createInquiry"];
export type InquiryGetOneInput = RouterInputs["inquiry"]["forwarder"]["getInquiryDetail"];

// Quotation input types
export type QuotationCreateInput = RouterInputs["quotation"]["forwarder"]["createQuotation"];

// ============================================================================
// UTILITY TYPES FOR SPECIFIC DATA STRUCTURES
// ============================================================================

// Extract specific nested types from inquiry data
export type InquiryData = InquiryGetOne["inquiry"];
export type PackageData = InquiryGetOne["packages"][0];
export type ShipperOrganization = InquiryData["shipperOrganization"];
export type CreatedBy = InquiryData["createdBy"];

// Shipper inquiry specific types
export type ShipperInquiry = ShipperInquiryList[0];
export type ShipperPackage = ShipperInquiry["packages"][0];
export type ShipperForwarder = ShipperInquiry["sentToForwarders"][0];
export type ShipperQuotation = ShipperInquiry["quotations"][0];

// Fix type mismatch: convert undefined to null for viewedAt
export type FixedShipperForwarder = Omit<ShipperForwarder, 'viewedAt'> & {
  viewedAt: Date | null;
};
export type FixedShipperInquiry = Omit<ShipperInquiry, 'sentToForwarders'> & {
  sentToForwarders: FixedShipperForwarder[];
};

// Extract status information
export type StatusDateInfo = InquiryGetOne["statusDateInfo"];
export type PackageSummary = InquiryGetOne["packageSummary"];

// ============================================================================
// FORM TYPES (Derived from tRPC inputs)
// ============================================================================

// Create form types that match your tRPC inputs exactly
export type InquiryFormData = InquiryCreateInput;
export type QuotationFormData = QuotationCreateInput;

// Extract specific form fields
export type PackageFormData = InquiryFormData["packages"][0];
export type InquiryBasicInfo = Pick<InquiryFormData, 
  "title" | "description" | "serviceType" | "originAirport" | "destinationAirport"
>;

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

// These types are automatically inferred from your tRPC procedures!
// No need to manually maintain them - they stay in sync automatically!

export type ApiResponse<T> = {
  data: T;
  success: true;
} | {
  error: string;
  success: false;
};

// ============================================================================
// DATA TYPES ONLY - Interfaces should stay local to components
// ============================================================================

// Shipper inquiry form data types
export type Forwarder = RouterOutputs["inquiry"]["shipper"]["getAllForwarders"][0];
export type Package = InquiryFormData["packages"][0];

// Shipper inquiry list data types
export type Inquiry = RouterOutputs["inquiry"]["shipper"]["getMyInquiries"][0];

// Quotation data types
export type Quotation = RouterOutputs["quotation"]["shipper"]["getQuotationsForInquiry"][0];



// Example 3: Type-safe API calls (commented out to avoid import issues)
/*
export function useTypedApi() {
  const utils = trpc.useUtils();
  
  // All these are fully typed!
  const createInquiry = (data: InquiryCreateInput) => {
    return utils.inquiry.shipper.createInquiry.mutate(data);
  };
  
  const getInquiry = (id: string) => {
    return utils.inquiry.forwarder.getInquiryDetail.query({ inquiryId: id });
  };
  
  return { createInquiry, getInquiry };
}
*/

// ============================================================================
// ADVANCED TYPE UTILITIES
// ============================================================================

// Extract all procedure names
export type InquiryProcedures = keyof RouterOutputs["inquiry"]["forwarder"];
export type QuotationProcedures = keyof RouterOutputs["quotation"]["forwarder"];

// Extract procedure return types
export type ProcedureReturnType<T extends keyof RouterOutputs["inquiry"]["forwarder"]> = 
  RouterOutputs["inquiry"]["forwarder"][T];

// Extract procedure input types
export type ProcedureInputType<T extends keyof RouterInputs["inquiry"]["forwarder"]> = 
  RouterInputs["inquiry"]["forwarder"][T];

// ============================================================================
// TYPE GUARDS
// ============================================================================

// Type guards for runtime type checking
export function isInquiryData(data: unknown): data is InquiryData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'referenceNumber' in data &&
    'title' in data
  );
}

// Note: PackageData type removed as it's not available in the current structure

// ============================================================================
// THE MAGIC: AUTOMATIC TYPE SYNC
// ============================================================================

/*
🎉 THE INCREDIBLE BENEFITS:

1. ✅ AUTOMATIC SYNC: Types update automatically when you change your tRPC procedures
2. ✅ COMPILE-TIME SAFETY: Catch type errors at build time, not runtime
3. ✅ INTELLISENSE: Full autocomplete for all API responses
4. ✅ REFACTORING SAFE: Rename a field in your procedure? All types update!
5. ✅ NO MANUAL TYPES: Never manually maintain API response types again
6. ✅ RUNTIME VALIDATION: Zod schemas provide runtime validation too

🚀 HOW TO USE:

// In your components:
const { data: inquiry } = trpc.inquiry.forwarder.getInquiryDetail.useQuery({ inquiryId });
// 'inquiry' is fully typed as InquiryGetOne!

// In your forms:
const formData: InquiryFormData = {
  title: "My Inquiry",
  // TypeScript will autocomplete all fields and validate types!
};

// In your API calls:
const result = await trpc.inquiry.shipper.createInquiry.mutate(formData);
// 'result' is fully typed as InquiryCreate!

🎯 THE RESULT:
Your entire API is now type-safe from server to client with ZERO manual type maintenance!
*/
