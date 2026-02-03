"use client"

import { useState } from "react"
import { trpc } from "@/trpc/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DotLoading } from "@/components/ui/dot-loading"
import { formatGermanDate } from "@/lib/date-utils"
import { 
  Euro, 
  Calendar, 
  Plane, 
  Clock, 
  Building2, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  Package,
  ChevronDown
} from "lucide-react"
import { toast } from "sonner"

interface QuotationViewProps {
  inquiryId: string
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  submitted: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800", 
  rejected: "bg-red-100 text-red-800",
  withdrawn: "bg-orange-100 text-orange-800",
  expired: "bg-red-100 text-red-800",
}


export default function QuotationView({ inquiryId }: QuotationViewProps) {
  const [expandedQuotationId, setExpandedQuotationId] = useState<string | null>(null)

  const { data: quotations, isLoading, error } = trpc.quotation.shipper.getQuotationsForInquiry.useQuery({
    inquiryId
  })

  const utils = trpc.useUtils()

  const acceptQuotation = trpc.quotation.shipper.acceptQuotation.useMutation({
    onSuccess: () => {
      toast.success("Angebot angenommen!")
      // Refetch quotations
      utils.quotation.shipper.getQuotationsForInquiry.invalidate({ inquiryId })
      utils.inquiry.shipper.getInquiryDetail.invalidate({ inquiryId })
      utils.inquiry.shipper.getMyInquiries.invalidate()
      setExpandedQuotationId(null)
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`)
    }
  })

  const rejectQuotation = trpc.quotation.shipper.rejectQuotation.useMutation({
    onSuccess: () => {
      toast.success("Angebot abgelehnt!")
      // Refetch quotations
      utils.quotation.shipper.getQuotationsForInquiry.invalidate({ inquiryId })
      utils.inquiry.shipper.getInquiryDetail.invalidate({ inquiryId })
      utils.inquiry.shipper.getMyInquiries.invalidate()
      setExpandedQuotationId(null)
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`)
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <DotLoading size="md" className="mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Lade Angebote...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Fehler beim Laden der Angebote: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  if (!quotations || quotations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Angebote erhalten</h3>
          <p className="text-gray-600">
            Für diese Frachtanfrage wurden noch keine Angebote von Spediteuren eingereicht.
          </p>
        </CardContent>
      </Card>
    )
  }

  const handleAccept = (quotationId: string) => {
    acceptQuotation.mutate({ quotationId })
  }

  const handleReject = (quotationId: string) => {
    rejectQuotation.mutate({ quotationId })
  }

  const bestOffer = quotations.reduce((best, current) => {
    if (!best) return current
    return current.totalPrice < best.totalPrice ? current : best
  }, undefined as typeof quotations[number] | undefined)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Eingegangene Angebote ({quotations.length})</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {quotations.map((quotation) => {
          const isExpanded = expandedQuotationId === quotation.id
          const isBestOffer = bestOffer?.id === quotation.id
          const isAccepted = quotation.status === "accepted"

          return (
            <Card
              key={quotation.id}
              className={isAccepted ? "border-primary" : isBestOffer ? "border-primary/50" : undefined}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{quotation.quotationNumber}</CardTitle>
                    <CardDescription>von {quotation.forwarderOrganization.name}</CardDescription>
                    <div className="flex flex-wrap items-center gap-2">
                      {isBestOffer && <Badge variant="secondary">Bestes Angebot</Badge>}
                      {isAccepted && <Badge variant="default">Nominiert</Badge>}
                      <Badge className={statusColors[quotation.status as keyof typeof statusColors]}>
                        {quotation.status === "draft" && "Entwurf"}
                        {quotation.status === "submitted" && "Eingereicht"}
                        {quotation.status === "accepted" && "Angenommen"}
                        {quotation.status === "rejected" && "Abgelehnt"}
                        {quotation.status === "withdrawn" && "Zurückgezogen"}
                        {quotation.status === "expired" && "Abgelaufen"}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-2xl font-bold justify-end">
                      <Euro className="h-5 w-5" />
                      {quotation.totalPrice} {quotation.currency}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span>{quotation.forwarderOrganization.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{quotation.forwarderOrganization.city}, {quotation.forwarderOrganization.country}</span>
                  </div>
                  {quotation.airlineFlight && (
                    <div className="flex items-center gap-2">
                      <Plane className="h-4 w-4 text-gray-500" />
                      <span>{quotation.airlineFlight}</span>
                    </div>
                  )}
                  {quotation.transitTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{quotation.transitTime} Tage</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setExpandedQuotationId(isExpanded ? null : quotation.id)}
                  >
                    Details {isExpanded ? "ausblenden" : "anzeigen"}
                    <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </Button>
                  {quotation.status === "submitted" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleAccept(quotation.id)}
                        disabled={acceptQuotation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Annehmen
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(quotation.id)}
                        disabled={rejectQuotation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Ablehnen
                      </Button>
                    </>
                  )}
                </div>

                {isExpanded && (
                  <div className="space-y-4">
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="font-semibold flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Spediteur
                        </div>
                        <p>{quotation.forwarderOrganization.name}</p>
                        <p className="text-sm text-gray-600">{quotation.forwarderOrganization.email}</p>
                        <p className="text-sm text-gray-600">
                          {quotation.forwarderOrganization.city}, {quotation.forwarderOrganization.country}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="font-semibold flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Gültigkeit
                        </div>
                        <p>Gültig bis: {formatGermanDate(quotation.validUntil)}</p>
                        {quotation.transitTime && <p>Transitzeit: {quotation.transitTime} Tage</p>}
                      </div>
                    </div>

                    {(quotation.notes || quotation.terms) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {quotation.notes && (
                          <div className="space-y-1">
                            <div className="font-semibold flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Notizen
                            </div>
                            <p className="text-gray-700">{quotation.notes}</p>
                          </div>
                        )}
                        {quotation.terms && (
                          <div className="space-y-1">
                            <div className="font-semibold flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Bedingungen
                            </div>
                            <p className="text-gray-700">{quotation.terms}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <Card>
                      <CardHeader>
                        <CardTitle>Kostenaufstellung</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {quotation.preCarriage > 0 && (
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <span>Pre-carriage (Abholung)</span>
                            <span className="font-semibold">{quotation.preCarriage} {quotation.currency}</span>
                          </div>
                        )}
                        {quotation.mainCarriage > 0 && (
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <span>Main carriage (Haupttransport)</span>
                            <span className="font-semibold">{quotation.mainCarriage} {quotation.currency}</span>
                          </div>
                        )}
                        {quotation.onCarriage > 0 && (
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <span>On-carriage (Zustellung)</span>
                            <span className="font-semibold">{quotation.onCarriage} {quotation.currency}</span>
                          </div>
                        )}
                        {quotation.additionalCharges > 0 && (
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <span>Zusatzkosten</span>
                            <span className="font-semibold">{quotation.additionalCharges} {quotation.currency}</span>
                          </div>
                        )}
                        <Separator />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
