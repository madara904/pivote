"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Eye, Calendar, MapPin, Truck } from "lucide-react"
import { format } from "date-fns"
import { de } from "date-fns/locale"

interface Package {
  id: string
  packageNumber: string
  description: string | null
  pieces: number
  grossWeight: string
  chargeableWeight: string | null
  length: string | null
  width: string | null
  height: string | null
  temperature: string | null
  specialHandling: string | null
  isDangerous: boolean | null
  dangerousGoodsClass: string | null
  unNumber: string | null
}

interface Forwarder {
  id: string
  forwarderOrganization: {
    id: string
    name: string
    email: string
  }
  sentAt: Date
  viewedAt?: Date
}

interface Inquiry {
  id: string
  referenceNumber: string
  title: string
  description: string | null
  serviceType: string
  originAirport: string
  originCity: string
  originCountry: string
  destinationAirport: string
  destinationCity: string
  destinationCountry: string
  cargoType: string
  cargoDescription: string | null
  readyDate: Date
  deliveryDate: Date | null
  validityDate: Date | null
  status: string
  packages: Package[]
  sentToForwarders: Forwarder[]
  createdBy: {
    id: string
    name: string
    email: string
  }
  createdAt: Date
  updatedAt: Date
}

interface InquiryListProps {
  inquiries: Inquiry[]
}

const InquiryList = ({ inquiries }: InquiryListProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Entwurf</Badge>
      case "sent":
        return <Badge variant="default">Gesendet</Badge>
      case "closed":
        return <Badge variant="outline">Geschlossen</Badge>
      case "cancelled":
        return <Badge variant="destructive">Storniert</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getServiceTypeLabel = (serviceType: string) => {
    switch (serviceType) {
      case "air_freight":
        return "Luftfracht"
      case "sea_freight":
        return "Seefracht"
      case "road_freight":
        return "Straßenfracht"
      case "rail_freight":
        return "Bahnfracht"
      default:
        return serviceType
    }
  }

  const getCargoTypeLabel = (cargoType: string) => {
    switch (cargoType) {
      case "general":
        return "Allgemein"
      case "dangerous":
        return "Gefahrgut"
      case "perishable":
        return "Verderblich"
      case "fragile":
        return "Empfindlich"
      case "oversized":
        return "Übergröße"
      default:
        return cargoType
    }
  }

  const calculateTotalWeight = (packages: Package[]) => {
    return packages.reduce((total, pkg) => total + parseFloat(pkg.grossWeight), 0).toFixed(2)
  }

  const calculateTotalPieces = (packages: Package[]) => {
    return packages.reduce((total, pkg) => total + pkg.pieces, 0)
  }

  if (inquiries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">Keine Frachtanfragen gefunden</p>
        <p className="text-sm">Erstellen Sie Ihre erste Frachtanfrage über den &quot;Neue Anfrage&quot; Tab.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => (
        <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{inquiry.title}</CardTitle>
                <CardDescription>
                  {inquiry.referenceNumber} • {getServiceTypeLabel(inquiry.serviceType)}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(inquiry.status)}
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Anzeigen
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Route Information */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Route
                </div>
                <div className="text-sm">
                  <div className="font-medium">
                    {inquiry.originAirport} ({inquiry.originCity})
                  </div>
                  <div className="text-muted-foreground">
                    {inquiry.originCountry}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">→</div>
                  <div className="font-medium">
                    {inquiry.destinationAirport} ({inquiry.destinationCity})
                  </div>
                  <div className="text-muted-foreground">
                    {inquiry.destinationCountry}
                  </div>
                </div>
              </div>

              {/* Cargo Information */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Package className="h-4 w-4" />
                  Fracht
                </div>
                <div className="text-sm">
                  <div className="font-medium">
                    {getCargoTypeLabel(inquiry.cargoType)}
                  </div>
                  {inquiry.cargoDescription && (
                    <div className="text-muted-foreground">
                      {inquiry.cargoDescription}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    {calculateTotalPieces(inquiry.packages)} Stück • {calculateTotalWeight(inquiry.packages)} kg
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Termine
                </div>
                <div className="text-sm">
                  <div>
                    <span className="text-muted-foreground">Bereit: </span>
                    <span className="font-medium">
                      {format(new Date(inquiry.readyDate), "dd.MM.yyyy", { locale: de })}
                    </span>
                  </div>
                  {inquiry.deliveryDate && (
                    <div>
                      <span className="text-muted-foreground">Lieferung: </span>
                      <span className="font-medium">
                        {format(new Date(inquiry.deliveryDate), "dd.MM.yyyy", { locale: de })}
                      </span>
                    </div>
                  )}
                  {inquiry.validityDate && (
                    <div>
                      <span className="text-muted-foreground">Gültig bis: </span>
                      <span className="font-medium">
                        {format(new Date(inquiry.validityDate), "dd.MM.yyyy", { locale: de })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Forwarders */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  Spediteure
                </div>
                <div className="text-sm">
                  <div className="font-medium">
                    {inquiry.sentToForwarders.length} Spediteur{inquiry.sentToForwarders.length !== 1 ? 'e' : ''}
                  </div>
                  <div className="text-muted-foreground">
                    {inquiry.sentToForwarders.filter(f => f.viewedAt).length} angesehen
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Gesendet: {format(new Date(inquiry.sentToForwarders[0]?.sentAt || inquiry.createdAt), "dd.MM.yyyy", { locale: de })}
                  </div>
                </div>
              </div>
            </div>

            {/* Package Details */}
            {inquiry.packages.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Paketdetails ({inquiry.packages.length} Paket{inquiry.packages.length !== 1 ? 'e' : ''})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {inquiry.packages.map((pkg, index) => (
                    <div key={pkg.id || index} className="text-xs bg-muted/50 rounded p-2">
                      <div className="font-medium">{pkg.packageNumber}</div>
                      <div className="text-muted-foreground">
                        {pkg.pieces} Stück • {pkg.grossWeight} kg
                      </div>
                      {pkg.isDangerous && (
                        <div className="text-red-600 font-medium">⚠️ Gefahrgut</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default InquiryList
