import { z } from "zod";

// UUID validation regex pattern
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const inquiryIdSchema = z.object({ 
  inquiryId: z.string().regex(uuidRegex, "Ungültige Inquiry-ID Format")
});
export const quotationIdSchema = z.object({ 
  quotationId: z.string().regex(uuidRegex, "Ungültige Quotation-ID Format")
});


