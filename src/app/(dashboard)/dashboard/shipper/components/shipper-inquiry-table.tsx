"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ServiceIcon } from "@/components/ui/service-icon"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, CheckCircle2, XCircle, Euro } from "lucide-react"
import { ShipperStatusBadge } from "@/components/ui/shipper-status-badge"
import { 
  ShipperStatusContext,
  ShipperInquiryStatus 
} from "@/lib/shipper-status-utils"
import { formatGermanDate } from "@/lib/date-utils"
import Link from "next/link"

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?"

const getServiceLabel = (serviceType: string) => {
  if (serviceType === "air_freight") return "Luftfracht";
  if (serviceType === "sea_freight") return "Seefracht";
  if (serviceType === "road_freight") return "Straßenfracht";
  return serviceType;
}

interface InquiryForTable {
  id: string
  referenceNumber: string
  status: string
  sentAt?: Date
  responseDate?: Date
  serviceType: string
  serviceDirection?: string
  cargoType: string
  cargoDescription?: string | null
  weight: string | number
  unit?: string
  pieces?: number
  shipperName: string
  quotationCount: number
  hasAcceptedQuotation: boolean
  hasRejectedQuotations: boolean
  quotedPrice?: number
  currency?: string
  forwarderResponseSummary?: {
    total: number
    pending: number
    rejected: number
    quoted: number
  }
  nominatedForwarder?: {
    id: string
    name: string
    logo?: string | null
  }
  origin: { code: string; city?: string; country: string }
  destination: { code: string; city?: string; country: string }
}

interface ShipperInquiryTableProps {
  inquiries: InquiryForTable[]
  className?: string
}

export function ShipperInquiryTable({ inquiries, className }: ShipperInquiryTableProps) {

  return (
    <div className="grid gap-4 grid-cols-1">
      {inquiries.map((inquiry) => {
        const statusContext: ShipperStatusContext = {
          inquiryStatus: inquiry.status as ShipperInquiryStatus,
          quotationCount: inquiry.quotationCount,
          hasAcceptedQuotation: inquiry.hasAcceptedQuotation,
          hasRejectedQuotations: inquiry.hasRejectedQuotations,
          forwarderResponseSummary: inquiry.forwarderResponseSummary
        };

        const isArchived = inquiry.status === "expired" || inquiry.status === "cancelled" || inquiry.status === "closed"

        return (
          <Link prefetch key={inquiry.id} href={`/dashboard/shipper/frachtanfragen/${inquiry.id}`}>
          <Card 
            key={inquiry.id} 
            className="overflow-hidden relative cursor-pointer hover:border-primary/50 transition-all"
          >
            {inquiry.hasAcceptedQuotation && (
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <Badge variant="secondary" className="gap-1 shrink-0 text-green-700 bg-green-600/10">
                  <CheckCircle2 className="h-3 w-3" />
                  <span className="hidden sm:inline">Spediteur nominiert</span>
                  <span className="sm:hidden">Nom.</span>
                </Badge>
              </div>
            )}
            <CardContent className="p-6">
              <div className="flex flex-col xl:flex-row gap-6">
                <div className="w-full xl:w-48 flex-shrink-0">
                  <div className="h-28 w-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-1 text-center">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Route</div>
                      <div className="text-base font-semibold text-foreground">
                        {inquiry.origin.code} → {inquiry.destination.code}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {inquiry.origin.country} - {inquiry.destination.country}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground break-words">{inquiry.referenceNumber}</h3>
                    <Badge variant="outline" className="text-xs font-medium flex items-center gap-1">
                      <ServiceIcon serviceType={inquiry.serviceType} className="h-3.5 w-3.5" />
                      <span>{getServiceLabel(inquiry.serviceType)}</span>
                      {inquiry.serviceDirection && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span>{inquiry.serviceDirection === "import" ? "Import" : "Export"}</span>
                        </>
                      )}
                    </Badge>
                    {inquiry.hasAcceptedQuotation ? null : isArchived ? (
                      <Badge variant="destructive" className="gap-1 shrink-0">
                        <XCircle className="h-3 w-3" />
                        <span className="hidden sm:inline">{inquiry.status === "expired" ? "Abgelaufen" : inquiry.status === "cancelled" ? "Abgebrochen" : "Geschlossen"}</span>
                        <span className="sm:hidden">{inquiry.status === "expired" ? "Abg." : inquiry.status === "cancelled" ? "Abb." : "Geschl."}</span>
                      </Badge>
                    ) : inquiry.quotationCount > 0 ? (
                      <Badge variant="default" className="gap-1 shrink-0">
                        <CheckCircle2 className="h-3 w-3" />
                        <span className="hidden sm:inline">{inquiry.quotationCount} Angebot{inquiry.quotationCount !== 1 ? 'e' : ''}</span>
                        <span className="sm:hidden">{inquiry.quotationCount}</span>
                      </Badge>
                    ) : (
                      <ShipperStatusBadge status={inquiry.status as ShipperInquiryStatus} />
                    )}
                  </div>

                  {inquiry.nominatedForwarder && (
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Avatar className="h-7 w-7 border">
                        <AvatarImage src={inquiry.nominatedForwarder.logo || undefined} alt={inquiry.nominatedForwarder.name} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(inquiry.nominatedForwarder.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">{inquiry.nominatedForwarder.name}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Fracht</div>
                      <div className="font-semibold">{inquiry.weight} {inquiry.unit || "kg"}</div>
                      <div className="text-xs text-muted-foreground">{inquiry.pieces || 1} PKG</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Service</div>
                      <div className="font-semibold">{getServiceLabel(inquiry.serviceType)}</div>
                      {inquiry.serviceDirection && (
                        <div className="text-xs text-muted-foreground">{inquiry.serviceDirection === "import" ? "Import" : "Export"}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Ware</div>
                      <div className="font-semibold">{inquiry.cargoType === "general" ? "Allgemein" : inquiry.cargoType}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{inquiry.cargoDescription || "Keine Beschreibung"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Timeline</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Gesendet {formatGermanDate(inquiry.sentAt) || "—"}</span>
                      </div>
                      {inquiry.responseDate && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Antwort {formatGermanDate(inquiry.responseDate) || "—"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full xl:w-64 flex flex-col gap-4 justify-end">
                  {inquiry.quotedPrice && inquiry.hasAcceptedQuotation && (
                    <div className="flex items-center justify-end gap-1 text-base sm:text-lg font-bold text-primary">
                      <Euro className="h-4 w-4 shrink-0" />
                      <span className="whitespace-nowrap">{new Intl.NumberFormat("de-DE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(inquiry.quotedPrice)} {inquiry.currency || "EUR"}</span>
                    </div>
                  )}

                  {inquiry.forwarderResponseSummary && inquiry.forwarderResponseSummary.total > 0 && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Antworten: {inquiry.forwarderResponseSummary.total}</div>
                      {inquiry.forwarderResponseSummary.quoted > 0 && (
                        <div>Angebote: {inquiry.forwarderResponseSummary.quoted}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          </Link>
        )
      })}
    </div>
  )
}
