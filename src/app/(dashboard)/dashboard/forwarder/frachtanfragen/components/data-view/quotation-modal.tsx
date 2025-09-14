"use client"

import { ResponsiveModal } from "@/components/responsive-modal"
import { QuotationView } from "../../../../../../../components/ui/quotation-view"

interface QuotationModalProps {
  isOpen: boolean
  onClose: () => void
  inquiryId: string
  inquiryReferenceNumber?: string
  onQuotationWithdrawn?: () => void
}

export function QuotationModal({ 
  isOpen, 
  onClose, 
  inquiryId, 
  inquiryReferenceNumber,
  onQuotationWithdrawn
}: QuotationModalProps) {
  const title = inquiryReferenceNumber || `Anfrage ${inquiryId.slice(-8)}`

  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={onClose}
      title={title}
      contentClassName="w-5xl"
    >
      <QuotationView 
        inquiryId={inquiryId} 
        onQuotationWithdrawn={onQuotationWithdrawn || onClose}
      />
    </ResponsiveModal>
  )
}
