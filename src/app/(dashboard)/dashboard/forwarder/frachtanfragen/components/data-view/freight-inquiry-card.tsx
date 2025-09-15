"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { ServiceIcon } from "@/components/ui/service-icon"
import { FreightDetails } from "@/app/(dashboard)/dashboard/forwarder/frachtanfragen/components/data-view/freight-details"
import { RouteDisplay } from "@/components/ui/route-display"
import { InquiryActions } from "@/app/(dashboard)/dashboard/forwarder/frachtanfragen/components/data-view/inquiry-actions"
import { Clock, Euro } from "lucide-react"
import { cn } from "@/lib/utils"
import { getDisplayStatus, StatusContext, toInquiryStatus, toQuotationStatus, ForwarderResponseStatus } from "@/lib/status-utils"
import { Badge } from "../../../../../../../components/ui/badge"

interface FreightInquiryCardProps {
  inquiry: {
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
  onSendReminder?: (inquiryId: string) => void
  onCreateQuote?: (inquiryId: string) => void
  onViewInquiry?: (inquiryId: string) => void
  onViewQuote?: (inquiryId: string) => void
  onRejectInquiry?: (inquiryId: string) => void
  className?: string
}

export function FreightInquiryCard({
  inquiry,
  onSendReminder,
  onCreateQuote,
  onViewInquiry,
  onViewQuote,
  onRejectInquiry,
  className,
}: FreightInquiryCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  const getServiceDetails = (serviceType: string) => {
    switch (serviceType) {
      case "air_freight":
        return "Import"
      case "sea_freight":
        return "Import • 20/40 Container"
      default:
        return "Import"
    }
  }

  const context: StatusContext = {
    inquiryStatus: toInquiryStatus(inquiry.status),
    quotationStatus: toQuotationStatus(inquiry.quotationStatus),
    responseStatus: inquiry.responseStatus as ForwarderResponseStatus | null
  };
  
  const displayStatus = getDisplayStatus(context)

  return (
    <Card className={cn("overflow-hidden hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-1 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h3 className="font-bold text-base text-primary">{inquiry.referenceNumber}</h3>
              <StatusBadge status={displayStatus} />
              {/* Forwarder Response Summary - only show for shipper view */}
              {inquiry.forwarderResponses && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {inquiry.forwarderResponses.quoted} Angebote
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                    {inquiry.forwarderResponses.pending} Ausstehend
                  </span>
                  {inquiry.forwarderResponses.rejected > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">
                      {inquiry.forwarderResponses.rejected} Abgelehnt
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Sent {inquiry.sentAt ? formatDate(inquiry.sentAt) : "N/A"}</span>
              {inquiry.responseDate && (
                <>
                  <span className="mx-2">•</span>
                  <span>Response {formatDate(inquiry.responseDate)}</span>
                </>
              )}
            </div>
          </div>
          <div className="text-left sm:text-right">
            {inquiry.quotedPrice && inquiry.quotationStatus !== 'draft' && (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 font-semibold text-base text-primary">
                  <Euro className="h-4 w-4" />
                  <span>
                    {inquiry.quotedPrice.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                    {inquiry.currency}
                  </span>
                </div>
              </div>
            )}
            {inquiry.quotationStatus === 'draft' && (
              <Badge variant="secondary" className="text-sm italic">Entwurf</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FreightDetails
            weight={inquiry.weight}
            unit={inquiry.unit}
            pieces={inquiry.pieces}
            shipperName={inquiry.shipperName}
          />

          <div className="space-y-2">
            <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Service</h4>
            <div className="flex items-start gap-2">
              <ServiceIcon serviceType={inquiry.serviceType} />
              <div>
                <div className="font-semibold text-sm">
                  {inquiry.serviceType === "air_freight"
                    ? "Luftfracht"
                    : inquiry.serviceType === "sea_freight"
                      ? "Seefracht"
                      : inquiry.serviceType}
                </div>
                <div className="text-xs text-muted-foreground">
                  {inquiry.serviceDetails || getServiceDetails(inquiry.serviceType)}
                </div>
              </div>
            </div>
            <div>
              <div className="font-medium text-sm">
                {inquiry.cargoType === "general" ? "General" : inquiry.cargoType}
              </div>
              <div className="text-xs text-muted-foreground">{inquiry.cargoDescription || "No description"}</div>
            </div>
          </div>

          <RouteDisplay origin={inquiry.origin} destination={inquiry.destination} />

          <div className="sm:col-span-2 lg:col-span-1">
            <InquiryActions
              status={inquiry.status}
              quotationStatus={inquiry.quotationStatus}
              responseStatus={inquiry.responseStatus}
              inquiryId={inquiry.id}
              onSendReminder={onSendReminder}
              onCreateQuote={onCreateQuote}
              onViewInquiry={onViewInquiry}
              onViewQuote={onViewQuote}
              onRejectInquiry={onRejectInquiry}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
