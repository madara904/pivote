"use client"

import { useState } from "react"
import { trpc } from "@/trpc/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  Package
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

const statusIcons = {
  draft: AlertTriangle,
  submitted: AlertTriangle,
  accepted: CheckCircle,
  rejected: XCircle,
  withdrawn: XCircle,
  expired: XCircle,
}

export default function QuotationView({ inquiryId }: QuotationViewProps) {
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null)

  const { data: quotations, isLoading, error } = trpc.quotation.shipper.getQuotationsForInquiry.useQuery({
    inquiryId
  })

  const { data: selectedQuotation } = trpc.quotation.shipper.getQuotation.useQuery(
    { quotationId: selectedQuotationId! },
    { enabled: !!selectedQuotationId }
  )

  const utils = trpc.useUtils()

  const acceptQuotation = trpc.quotation.shipper.acceptQuotation.useMutation({
    onSuccess: () => {
      toast.success("Angebot angenommen!")
      // Refetch quotations
      utils.quotation.shipper.getQuotationsForInquiry.invalidate({ inquiryId })
      setSelectedQuotationId(null)
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
      setSelectedQuotationId(null)
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`)
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Eingegangene Angebote ({quotations.length})</h2>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Übersicht</TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedQuotationId}>
            Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="grid gap-4">
            {quotations.map((quotation) => {
              const StatusIcon = statusIcons[quotation.status as keyof typeof statusIcons]
              return (
                <Card 
                  key={quotation.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedQuotationId === quotation.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedQuotationId(quotation.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <StatusIcon className="h-5 w-5" />
                        <div>
                          <CardTitle className="text-lg">{quotation.quotationNumber}</CardTitle>
                          <CardDescription>
                            von {quotation.forwarderOrganization.name}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-2xl font-bold">
                          <Euro className="h-6 w-6" />
                          {quotation.totalPrice} {quotation.currency}
                        </div>
                        <Badge className={statusColors[quotation.status as keyof typeof statusColors]}>
                          {quotation.status === 'draft' && 'Entwurf'}
                          {quotation.status === 'submitted' && 'Eingereicht'}
                          {quotation.status === 'accepted' && 'Angenommen'}
                          {quotation.status === 'rejected' && 'Abgelehnt'}
                          {quotation.status === 'withdrawn' && 'Zurückgezogen'}
                          {quotation.status === 'expired' && 'Abgelaufen'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
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
                    
                    {quotation.status === 'submitted' && (
                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAccept(quotation.id)
                          }}
                          disabled={acceptQuotation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Annehmen
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleReject(quotation.id)
                          }}
                          disabled={rejectQuotation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Ablehnen
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="details">
          {selectedQuotation && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{selectedQuotation.quotationNumber}</CardTitle>
                      <CardDescription>
                        von {selectedQuotation.forwarderOrganization.name}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-3xl font-bold">
                        <Euro className="h-8 w-8" />
                        {selectedQuotation.totalPrice} {selectedQuotation.currency}
                      </div>
                      <Badge className={statusColors[selectedQuotation.status as keyof typeof statusColors]}>
                        {selectedQuotation.status === 'draft' && 'Entwurf'}
                        {selectedQuotation.status === 'submitted' && 'Eingereicht'}
                        {selectedQuotation.status === 'accepted' && 'Angenommen'}
                        {selectedQuotation.status === 'rejected' && 'Abgelehnt'}
                        {selectedQuotation.status === 'withdrawn' && 'Zurückgezogen'}
                        {selectedQuotation.status === 'expired' && 'Abgelaufen'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Spediteur
                      </h4>
                      <p>{selectedQuotation.forwarderOrganization.name}</p>
                      <p className="text-sm text-gray-600">{selectedQuotation.forwarderOrganization.email}</p>
                      <p className="text-sm text-gray-600">
                        {selectedQuotation.forwarderOrganization.city}, {selectedQuotation.forwarderOrganization.country}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Gültigkeitsdaten
                      </h4>
                      <p>Gültig bis: {formatGermanDate(selectedQuotation.validUntil)}</p>
                      {selectedQuotation.transitTime && (
                        <p>Transitzeit: {selectedQuotation.transitTime} Tage</p>
                      )}
                    </div>
                  </div>

                  {selectedQuotation.airlineFlight && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Plane className="h-4 w-4" />
                        Flugdetails
                      </h4>
                      <p>{selectedQuotation.airlineFlight}</p>
                    </div>
                  )}

                  {selectedQuotation.notes && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Notizen
                      </h4>
                      <p className="text-sm text-gray-700">{selectedQuotation.notes}</p>
                    </div>
                  )}

                  {selectedQuotation.terms && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Geschäftsbedingungen
                      </h4>
                      <p className="text-sm text-gray-700">{selectedQuotation.terms}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Charges */}
              <Card>
                <CardHeader>
                  <CardTitle>Kostenaufstellung</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedQuotation.preCarriage > 0 && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h5 className="font-medium">Pre-carriage (Abholung)</h5>
                        </div>
                        <div className="text-lg font-semibold">
                          {selectedQuotation.preCarriage} {selectedQuotation.currency}
                        </div>
                      </div>
                    )}
                    
                    {selectedQuotation.mainCarriage > 0 && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h5 className="font-medium">Main carriage (Haupttransport)</h5>
                        </div>
                        <div className="text-lg font-semibold">
                          {selectedQuotation.mainCarriage} {selectedQuotation.currency}
                        </div>
                      </div>
                    )}
                    
                    {selectedQuotation.onCarriage > 0 && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h5 className="font-medium">On-carriage (Zustellung)</h5>
                        </div>
                        <div className="text-lg font-semibold">
                          {selectedQuotation.onCarriage} {selectedQuotation.currency}
                        </div>
                      </div>
                    )}
                    
                    {selectedQuotation.additionalCharges > 0 && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h5 className="font-medium">Additional charges (Zusatzkosten)</h5>
                        </div>
                        <div className="text-lg font-semibold">
                          {selectedQuotation.additionalCharges} {selectedQuotation.currency}
                        </div>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Gesamtsumme:</span>
                      <div className="flex items-center gap-2">
                        <Euro className="h-5 w-5" />
                        {selectedQuotation.totalPrice} {selectedQuotation.currency}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedQuotation.status === 'submitted' && (
                <div className="flex gap-4">
                  <Button 
                    onClick={() => handleAccept(selectedQuotation.id)}
                    disabled={acceptQuotation.isPending}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Angebot annehmen
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleReject(selectedQuotation.id)}
                    disabled={rejectQuotation.isPending}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Angebot ablehnen
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
