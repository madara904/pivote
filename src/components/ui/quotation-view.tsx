"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { trpc } from "@/trpc/client"
import { DotLoading } from "@/components/ui/dot-loading"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Euro, Clock, Plane, FileText, Calendar, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface QuotationViewProps {
  inquiryId: string
  className?: string
  onQuotationWithdrawn?: () => void
}

export function QuotationView({ inquiryId, className, onQuotationWithdrawn }: QuotationViewProps) {
  const { data: quotations, isPending, isError, error } = trpc.quotation.forwarder.getInquiryQuotations.useQuery({
    inquiryId
  })

  const utils = trpc.useUtils()

  const withdrawQuotation = trpc.quotation.forwarder.withdrawQuotation.useMutation({
    onSuccess: () => {
      toast.success("Angebot erfolgreich zurückgezogen!")
      // Refetch quotations to update the status
      utils.quotation.forwarder.getInquiryQuotations.invalidate({ inquiryId })
      // Close the modal
      onQuotationWithdrawn?.()
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`)
    }
  })

  const handleWithdraw = (quotationId: string) => {
    withdrawQuotation.mutate({ quotationId })
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  const formatCurrency = (amount: number, currency: string = "EUR") => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "submitted":
        return "default"
      case "accepted":
        return "default"
      case "rejected":
        return "destructive"
      case "withdrawn":
        return "secondary"
      case "expired":
        return "outline"
      case "draft":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "submitted":
        return "Eingereicht"
      case "accepted":
        return "Angenommen"
      case "rejected":
        return "Abgelehnt"
      case "withdrawn":
        return "Zurückgezogen"
      case "expired":
        return "Abgelaufen"
      case "draft":
        return "Entwurf"
      default:
        return status
    }
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center space-y-2">
          <DotLoading size="md" />
          <p className="text-sm text-muted-foreground">Lade Angebote...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Fehler beim Laden der Angebote: {error?.message || "Unbekannter Fehler"}
        </AlertDescription>
      </Alert>
    )
  }

  if (!quotations || quotations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Keine Angebote für diese Anfrage vorhanden.</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary">Angebote</h3>
        <Badge variant="outline" className="text-xs">
          {quotations.length} {quotations.length === 1 ? "Angebot" : "Angebote"}
        </Badge>
      </div>

      <div className="space-y-4">
        {quotations.map((quotation) => (
          <Card key={quotation.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{quotation.quotationNumber}</CardTitle>
                    <Badge variant={getStatusBadgeVariant(quotation.status)}>
                      {getStatusLabel(quotation.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Erstellt {formatDate(quotation.createdAt)}</span>
                    </div>
                    {quotation.submittedAt && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Eingereicht {formatDate(quotation.submittedAt)}</span>
                      </div>
                    )}
                    {quotation.validUntil && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Gültig bis {formatDate(quotation.validUntil)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 font-semibold text-lg text-primary">
                    <Euro className="h-5 w-5" />
                    <span>{formatCurrency(quotation.totalPrice, quotation.currency)}</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Price Breakdown */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Kostenaufschlüsselung
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Vorlauf:</span>
                    <span className="font-medium">{formatCurrency(quotation.preCarriage, quotation.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hauptlauf:</span>
                    <span className="font-medium">{formatCurrency(quotation.mainCarriage, quotation.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nachlauf:</span>
                    <span className="font-medium">{formatCurrency(quotation.onCarriage, quotation.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Zusatzkosten:</span>
                    <span className="font-medium">{formatCurrency(quotation.additionalCharges, quotation.currency)}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Gesamtpreis:</span>
                  <span className="text-primary">{formatCurrency(quotation.totalPrice, quotation.currency)}</span>
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {quotation.airlineFlight && (
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-muted-foreground">Flug:</span>
                      <span className="ml-1 font-medium">{quotation.airlineFlight}</span>
                    </div>
                  </div>
                )}
                {quotation.transitTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-muted-foreground">Transitzeit:</span>
                      <span className="ml-1 font-medium">{quotation.transitTime} Tage</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes and Terms */}
              {(quotation.notes || quotation.terms) && (
                <div className="space-y-3">
                  {quotation.notes && (
                    <div>
                      <h5 className="font-medium text-sm text-muted-foreground mb-1">Notizen</h5>
                      <p className="text-sm bg-muted/50 p-3 rounded-md">{quotation.notes}</p>
                    </div>
                  )}
                  {quotation.terms && (
                    <div>
                      <h5 className="font-medium text-sm text-muted-foreground mb-1">Bedingungen</h5>
                      <p className="text-sm bg-muted/50 p-3 rounded-md">{quotation.terms}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {/*quotation.status === 'submitted' && (
                <div className="pt-4 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleWithdraw(quotation.id)}
                    disabled={withdrawQuotation.isPending}
                    className="w-full"
                  >
                    {withdrawQuotation.isPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Ziehe zurück...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Angebot zurückziehen
                      </>
                    )}
                  </Button>
                </div>
              )*/}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
