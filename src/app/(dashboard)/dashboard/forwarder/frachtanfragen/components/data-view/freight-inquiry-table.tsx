"use client"

import { FreightInquiryCard } from "@/app/(dashboard)/dashboard/forwarder/frachtanfragen/components/data-view/freight-inquiry-card"
import { cn } from "@/lib/utils"

interface FreightInquiry {
  id: string
  referenceNumber: string
  status: string
  quotationStatus?: string | null
  responseStatus?: string | null
  sentAt?: Date
  responseDate?: Date
  quotedPrice?: number
  currency?: string
  serviceType: string
  serviceDetails?: string
  cargoType: string
  cargoDescription?: string | null
  weight: string | number
  unit?: string
  pieces?: number
  shipperName: string
  forwarderResponses?: {
    total: number
    pending: number
    rejected: number
    quoted: number
  }
  origin: {
    code: string
    city?: string
    country: string
  }
  destination: {
    code: string
    city?: string
    country: string
  }
}

interface FreightInquiryTableProps {
  inquiries: FreightInquiry[]
  onSendReminder?: (inquiryId: string) => void
  onCreateQuote?: (inquiryId: string) => void
  onViewInquiry?: (inquiryId: string) => void
  onViewQuote?: (inquiryId: string) => void
  onRejectInquiry?: (inquiryId: string) => void
  className?: string
}

export function FreightInquiryTable({
  inquiries,
  onSendReminder,
  onCreateQuote,
  onViewInquiry,
  onViewQuote,
  onRejectInquiry,
  className,
}: FreightInquiryTableProps) {
  if (inquiries.length === 0) {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-lg font-medium">Keine Frachtanfragen gefunden</p>
          <p className="text-sm">Erstellen Sie Ihre erste Frachtanfrage über den &quot;Neue Anfrage&quot; Tab.</p>
        </div>
      </div>
    )
  }

  return (
      <div className={cn("space-y-6", className)}>
        {inquiries.map((inquiry) => (
          <FreightInquiryCard
            key={inquiry.id}
            inquiry={inquiry}
            onSendReminder={onSendReminder}
            onCreateQuote={onCreateQuote}
            onViewInquiry={onViewInquiry}
            onViewQuote={onViewQuote}
            onRejectInquiry={onRejectInquiry}
          />
        ))}
      </div>
  )
}
