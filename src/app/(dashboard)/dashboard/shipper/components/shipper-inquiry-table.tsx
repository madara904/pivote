"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ShipperStatusBadge } from "@/components/ui/shipper-status-badge"
import { ServiceIcon } from "@/components/ui/service-icon"
import { FreightDetails } from "@/app/(dashboard)/dashboard/forwarder/frachtanfragen/components/data-view/freight-details"
import { RouteDisplay } from "@/components/ui/route-display"
import { Clock, Euro, Eye, X, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  canShipperCancelInquiry,
  isShipperInquiryFinal,
  ShipperStatusContext,
  ShipperInquiryStatus 
} from "@/lib/shipper-status-utils"

// Define the inquiry type for the table component
interface InquiryForTable {
  id: string
  referenceNumber: string
  status: string
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
  forwarderResponseSummary?: {
    total: number
    pending: number
    rejected: number
    quoted: number
  }
  quotationCount: number
  hasAcceptedQuotation: boolean
  hasRejectedQuotations: boolean
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

interface ShipperInquiryTableProps {
  inquiries: InquiryForTable[]
  onViewInquiry?: (inquiryId: string) => void
  onViewQuotations?: (inquiryId: string) => void
  onCancelInquiry?: (inquiryId: string) => void
  className?: string
}

export function ShipperInquiryTable({
  inquiries,
  onViewInquiry,
  onViewQuotations,
  onCancelInquiry,
  className,
}: ShipperInquiryTableProps) {
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
        return "Luftfracht • Express"
      case "sea_freight":
        return "Seefracht • Container"
      case "road_freight":
        return "Straßentransport • LKW"
      case "rail_freight":
        return "Schienentransport • Zug"
      case "multimodal":
        return "Multimodal • Kombiniert"
      default:
        return "Import"
    }
  }

  return (
    <div className="container mx-auto px-4">
      <div className={cn("space-y-4", className)}>
        {inquiries.map((inquiry) => {
        // Create status context for this inquiry
        const statusContext: ShipperStatusContext = {
          inquiryStatus: inquiry.status as ShipperInquiryStatus,
          quotationCount: inquiry.quotationCount,
          hasAcceptedQuotation: inquiry.hasAcceptedQuotation,
          hasRejectedQuotations: inquiry.hasRejectedQuotations,
          forwarderResponseSummary: inquiry.forwarderResponseSummary
        };

        const canCancel = canShipperCancelInquiry(statusContext);
        const isFinal = isShipperInquiryFinal(statusContext);

        return (
          <Card key={inquiry.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <h3 className="font-bold text-base text-primary">{inquiry.referenceNumber}</h3>
                    <ShipperStatusBadge status={inquiry.status as ShipperInquiryStatus} />
                    {/* Forwarder Response Summary */}
                      {inquiry.forwarderResponseSummary && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {inquiry.forwarderResponseSummary.quoted} Angebote
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                            {inquiry.forwarderResponseSummary.pending} Ausstehend
                          </span>
                          {inquiry.forwarderResponseSummary.rejected > 0 && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">
                              {inquiry.forwarderResponseSummary.rejected} Abgelehnt
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
                  {inquiry.quotedPrice && (
                    <div className="flex items-center gap-1 text-lg font-bold text-primary">
                      <Euro className="h-4 w-4" />
                      {inquiry.quotedPrice.toFixed(2)} {inquiry.currency}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Left side - Content */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                  <div className="sm:col-span-2">
                    <RouteDisplay origin={inquiry.origin} destination={inquiry.destination} />
                  </div>
                </div>

                {/* Right side - Actions */}
                <div className="lg:w-48 flex-shrink-0">
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">Actions</h4>
                    <div className="flex flex-col gap-2">
                      {!isFinal && (
                        <Button
                          variant="outline"
                          onClick={() => onViewInquiry?.(inquiry.id)}
                          className="justify-start w-full"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Details anzeigen
                        </Button>
                      )}
                      
                      {inquiry.forwarderResponseSummary?.quoted && inquiry.forwarderResponseSummary.quoted > 0 && (
                        <Button
                          onClick={() => onViewQuotations?.(inquiry.id)}
                          className="justify-start w-full"
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Angebote anzeigen ({inquiry.forwarderResponseSummary.quoted})
                        </Button>
                      )}
                      
                      {canCancel && (
                        <Button
                          variant="destructive"
                          onClick={() => onCancelInquiry?.(inquiry.id)}
                          className="justify-start w-full"
                          size="sm"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Stornieren
                        </Button>
                      )}
                      
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
      </div>
    </div>
  )
}
