"use client"

import { useState } from "react"
import { trpc } from "@/trpc/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Package as PackageIcon, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Package, InquiryFormData, Forwarder } from "@/types/trpc-inferred"
import { sanitizeIntegerInput, sanitizeDecimalInput } from "@/lib/form-sanitization"
import { CountrySelect } from "@/components/location/location-fields"
import { getAirportByCode, getCountryNameByCode, getAirportsByCountry } from "@/lib/locations"
import { calculateChargeableWeight, calculateVolume } from "@/lib/freight-calculations"
import { cn } from "@/lib/utils"

// Local interface - stays with the component
interface InquiryFormProps {
  forwarders: Forwarder[];
}


const InquiryForm = ({ forwarders }: InquiryFormProps) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedForwarders, setSelectedForwarders] = useState<string[]>([])
  
  // Location state for origin
  const [originCountry, setOriginCountry] = useState<string>("")
  const [originAirport, setOriginAirport] = useState<string>("")
  const [originCity, setOriginCity] = useState<string>("")
  
  // Location state for destination
  const [destinationCountry, setDestinationCountry] = useState<string>("")
  const [destinationAirport, setDestinationAirport] = useState<string>("")
  const [destinationCity, setDestinationCity] = useState<string>("")
  
  const [packages, setPackages] = useState<Package[]>([
    {
      packageNumber: "1",
      description: "",
      pieces: 1,
      grossWeight: 0,
      chargeableWeight: 0,
      length: 0,
      width: 0,
      height: 0,
      temperature: "",
      specialHandling: "",
      isDangerous: false,
      dangerousGoodsClass: "",
      unNumber: ""
    }
  ])

  const [referenceNumber, setReferenceNumber] = useState<string>("")

  const createInquiry = trpc.inquiry.shipper.createInquiry.useMutation({
    onSuccess: (data) => {
      setReferenceNumber(data.referenceNumber)
      toast.success(`Frachtanfrage ${data.referenceNumber} erfolgreich erstellt!`)
      router.push("/dashboard/shipper/frachtanfragen")
    },
    onError: (error) => {
      toast.error(`Fehler beim Erstellen der Anfrage: ${error.message}`)
    }
  })

  const handleForwarderChange = (forwarderId: string, checked: boolean) => {
    if (checked) {
      setSelectedForwarders(prev => [...prev, forwarderId])
    } else {
      setSelectedForwarders(prev => prev.filter(id => id !== forwarderId))
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return "";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const addPackage = () => {
    const packageNumber = String(packages.length + 1)
    setPackages(prev => [...prev, {
      packageNumber,
      description: "",
      pieces: 1,
      grossWeight: 0,
      chargeableWeight: 0,
      length: 0,
      width: 0,
      height: 0,
      temperature: "",
      specialHandling: "",
      isDangerous: false,
      dangerousGoodsClass: "",
      unNumber: ""
    }])
  }

  const removePackage = (index: number) => {
    if (packages.length > 1) {
      setPackages(prev => {
        const updated = prev.filter((_, i) => i !== index)
        // Re-number packages after removal
        return updated.map((pkg, i) => ({
          ...pkg,
          packageNumber: String(i + 1)
        }))
      })
    }
  }

  // Get service type from form (we'll track it in state)
  const [serviceType, setServiceType] = useState<"air_freight" | "sea_freight" | "road_freight" | "rail_freight">("air_freight")
  const [serviceDirection, setServiceDirection] = useState<"import" | "export">("import")

  // Recalculate chargeable weights when service type changes
  const handleServiceTypeChange = (newServiceType: typeof serviceType) => {
    setServiceType(newServiceType)
    // Recalculate chargeable weights for all packages
    setPackages(prev => prev.map(pkg => {
      if (pkg.grossWeight > 0 && pkg.length && pkg.width && pkg.height) {
        const volumePerPiece = calculateVolume({ length: pkg.length, width: pkg.width, height: pkg.height })
        return { ...pkg, chargeableWeight: calculateChargeableWeight(newServiceType, pkg.grossWeight, volumePerPiece, pkg.pieces || 1) }
      } else if (pkg.grossWeight > 0) {
        return { ...pkg, chargeableWeight: pkg.grossWeight }
      }
      return pkg
    }))
  }

  const updatePackage = (index: number, field: keyof Package, value: string | number | boolean) => {
    setPackages(prev => prev.map((pkg, i) => {
      if (i === index) {
        const updated = { ...pkg, [field]: value }
        
        // Auto-calculate chargeable weight when dimensions, weight, or pieces change
        if (field === "grossWeight" || field === "length" || field === "width" || field === "height" || field === "pieces") {
          const grossWeight = field === "grossWeight" ? (value as number) : updated.grossWeight
          const pieces = field === "pieces" ? (value as number) : updated.pieces || 1
          const length = field === "length" ? (value as number) : updated.length || 0
          const width = field === "width" ? (value as number) : updated.width || 0
          const height = field === "height" ? (value as number) : updated.height || 0
          
          if (grossWeight > 0 && length > 0 && width > 0 && height > 0) {
            // Calculate CBM per piece
            const volumePerPiece = calculateVolume({ length, width, height })
            // Calculate chargeable weight accounting for number of pieces
            updated.chargeableWeight = calculateChargeableWeight(serviceType, grossWeight, volumePerPiece, pieces)
          } else if (grossWeight > 0) {
            // If no dimensions, use gross weight as chargeable weight
            updated.chargeableWeight = grossWeight
          } else {
            updated.chargeableWeight = 0
          }
        }
        
        return updated
      }
      return pkg
    }))
  }

  const handleNumberInputChange = (
    index: number,
    field: keyof Package,
    value: string,
    options: { isInteger?: boolean; minValue?: number; maxValue?: number } = {}
  ) => {
    const { isInteger = false, minValue = 0, maxValue = 1000000 } = options
    const sanitized = isInteger
      ? sanitizeIntegerInput(value, { minValue, maxValue })
      : sanitizeDecimalInput(value, { minValue, maxValue })
    
    const numValue = sanitized === "" ? (field === "pieces" ? 1 : 0) : (isInteger ? parseInt(sanitized) : parseFloat(sanitized)) || (field === "pieces" ? 1 : 0)
    updatePackage(index, field, numValue)
  }

  const NOT_SPECIFIED = "NOT_SPECIFIED"

  // Handle origin airport selection - auto-populate city and country if airport is selected
  const handleOriginAirportChange = (airportCode: string) => {
    setOriginAirport(airportCode)
    
    if (airportCode === NOT_SPECIFIED) {
      // User selected "Not specified" - don't auto-fill, allow manual input
      return
    }
    
    const airport = getAirportByCode(airportCode)
    if (airport) {
      setOriginCountry(airport.countryCode)
      // Auto-fill city, but user can still manually edit it
      setOriginCity(airport.city)
    }
  }

  // Handle origin country change - reset airport if country changes
  const handleOriginCountryChange = (countryCode: string) => {
    setOriginCountry(countryCode)
    // Reset airport if it doesn't belong to the new country (unless it's "not specified")
    const airport = getAirportByCode(originAirport)
    if (airport && airport.countryCode !== countryCode && originAirport !== NOT_SPECIFIED) {
      setOriginAirport("")
      setOriginCity("")
    }
  }

  // Handle destination airport selection - auto-populate city and country if airport is selected
  const handleDestinationAirportChange = (airportCode: string) => {
    setDestinationAirport(airportCode)
    
    if (airportCode === NOT_SPECIFIED) {
      // User selected "Not specified" - don't auto-fill, allow manual input
      return
    }
    
    const airport = getAirportByCode(airportCode)
    if (airport) {
      setDestinationCountry(airport.countryCode)
      // Auto-fill city, but user can still manually edit it
      setDestinationCity(airport.city)
    }
  }

  // Handle destination country change - reset airport if country changes
  const handleDestinationCountryChange = (countryCode: string) => {
    setDestinationCountry(countryCode)
    // Reset airport if it doesn't belong to the new country (unless it's "not specified")
    const airport = getAirportByCode(destinationAirport)
    if (airport && airport.countryCode !== countryCode && destinationAirport !== NOT_SPECIFIED) {
      setDestinationAirport("")
      setDestinationCity("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate location fields
      if (!originCountry) {
        toast.error("Bitte wählen Sie das Ursprungsland aus")
        setIsSubmitting(false)
        return
      }

      if (!originCity.trim()) {
        toast.error("Bitte geben Sie die Ursprungsstadt ein")
        setIsSubmitting(false)
        return
      }

      if (!destinationCountry) {
        toast.error("Bitte wählen Sie das Zielland aus")
        setIsSubmitting(false)
        return
      }

      if (!destinationCity.trim()) {
        toast.error("Bitte geben Sie die Zielstadt ein")
        setIsSubmitting(false)
        return
      }

      const formData = new FormData(e.target as HTMLFormElement)
      
      // Auto-generate title from origin and destination
      const autoTitle = originCity && destinationCity 
        ? `${originCity} → ${destinationCity}`
        : "Neue Frachtanfrage"
      
      const inquiryData: InquiryFormData = {
        title: autoTitle,
        description: formData.get("description") as string || undefined,
        shipperReference: formData.get("shipperReference") as string || undefined,
        serviceType: serviceType,
        serviceDirection: serviceDirection,
        originAirport: originAirport === NOT_SPECIFIED ? "" : originAirport,
        originCity: originCity.trim(),
        originCountry: getCountryNameByCode(originCountry),
        destinationAirport: destinationAirport === NOT_SPECIFIED ? "" : destinationAirport,
        destinationCity: destinationCity.trim(),
        destinationCountry: getCountryNameByCode(destinationCountry),
        cargoType: formData.get("cargoType") as "general" | "dangerous" | "perishable" | "fragile" | "oversized",
        cargoDescription: formData.get("cargoDescription") as string || undefined,
        incoterms: formData.get("incoterms") as string,
        readyDate: formData.get("readyDate") as string,
        deliveryDate: formData.get("deliveryDate") as string || undefined,
        validityDate: formData.get("validityDate") as string || undefined,
        selectedForwarderIds: selectedForwarders,
        packages: packages.filter(pkg => pkg.packageNumber.trim() !== "")
      }

      await createInquiry.mutateAsync(inquiryData)
    } catch (error) {
      toast.error(`Fehler beim Erstellen der Anfrage: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-none shadow-none">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
      {/* Forwarder Selection */}
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader>
          <CardTitle>Spediteure auswählen</CardTitle>
          <CardDescription>Wählen Sie die Spediteure aus, die diese Anfrage erhalten sollen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {forwarders.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Keine verbundenen Spediteure verfügbar. Bitte zuerst eine Verbindung herstellen.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {forwarders.map((forwarder) => (
                <label
                  key={forwarder.id}
                  htmlFor={forwarder.id}
                  className={cn(
                    "relative flex min-h-[220px] flex-col rounded-xl border p-4 transition-all hover:border-primary/50 hover:bg-muted/40",
                    selectedForwarders.includes(forwarder.id) && "border-primary bg-primary/5 shadow-sm"
                  )}
                >
                  <Checkbox
                    id={forwarder.id}
                    checked={selectedForwarders.includes(forwarder.id)}
                    onCheckedChange={(checked) => handleForwarderChange(forwarder.id, checked as boolean)}
                    className="absolute right-3 top-3"
                  />
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={forwarder.logo || undefined} alt={forwarder.name} />
                      <AvatarFallback className="text-xs">{getInitials(forwarder.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{forwarder.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {forwarder.city || "-"}, {forwarder.country || "-"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto w-full rounded-lg border border-border/60 bg-muted/20 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Preis</span>
                      <span className="font-semibold text-foreground">auf Anfrage</span>
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">Antwortzeit • 24h</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card className="border">
        <CardHeader>
          <CardTitle>Grundinformationen</CardTitle>
          <CardDescription>Allgemeine Informationen zur Frachtanfrage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {referenceNumber && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">Referenznummer:</p>
              <p className="text-lg font-semibold">{referenceNumber}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serviceType">Service-Typ *</Label>
              <Select 
                name="serviceType" 
                required
                value={serviceType}
                onValueChange={(value) => handleServiceTypeChange(value as typeof serviceType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Service-Typ wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="air_freight">Luftfracht</SelectItem>
                  <SelectItem value="sea_freight">Seefracht</SelectItem>
                  <SelectItem value="road_freight">Straßenfracht</SelectItem>
                  <SelectItem value="rail_freight">Bahnfracht</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceDirection">Richtung *</Label>
              <Select 
                name="serviceDirection" 
                required
                value={serviceDirection}
                onValueChange={(value) => setServiceDirection(value as typeof serviceDirection)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Richtung wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="import">Import</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shipperReference">Eigene Referenznummer</Label>
            <Input
              id="shipperReference"
              name="shipperReference"
              placeholder="z.B. PO-2024-001 oder Bestellnummer"
            />
            <p className="text-xs text-muted-foreground">
              Optionale Referenznummer für Ihre eigene Buchhaltung oder Systeme
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Zusätzliche Informationen zur Frachtanfrage"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Origin and Destination */}
      <Card className="border">
        <CardHeader>
          <CardTitle>Ursprung und Ziel</CardTitle>
          <CardDescription>Abgangs- und Zielort der Sendung</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ursprung *</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originCountry" className="text-sm text-muted-foreground">Land *</Label>
                  <CountrySelect
                    value={originCountry}
                    onValueChange={handleOriginCountryChange}
                    placeholder="Land wählen"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originAirport" className="text-sm text-muted-foreground">Flughafen</Label>
                  <Select
                    value={originAirport}
                    onValueChange={handleOriginAirportChange}
                    disabled={isSubmitting || !originCountry}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={originCountry ? "Flughafen wählen" : "Zuerst Land wählen"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NOT_SPECIFIED}>Nicht spezifiziert</SelectItem>
                      {getAirportsByCountry(originCountry).map((airport) => (
                        <SelectItem key={airport.code} value={airport.code}>
                          {airport.code} — {airport.city} ({airport.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originCity" className="text-sm text-muted-foreground">Stadt *</Label>
                  <Input
                    id="originCity"
                    name="originCity"
                    value={originCity}
                    onChange={(e) => setOriginCity(e.target.value)}
                    placeholder="z.B. München"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ziel *</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="destinationCountry" className="text-sm text-muted-foreground">Land *</Label>
                  <CountrySelect
                    value={destinationCountry}
                    onValueChange={handleDestinationCountryChange}
                    placeholder="Land wählen"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destinationAirport" className="text-sm text-muted-foreground">Flughafen</Label>
                  <Select
                    value={destinationAirport}
                    onValueChange={handleDestinationAirportChange}
                    disabled={isSubmitting || !destinationCountry}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={destinationCountry ? "Flughafen wählen" : "Zuerst Land wählen"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NOT_SPECIFIED}>Nicht spezifiziert</SelectItem>
                      {getAirportsByCountry(destinationCountry).map((airport) => (
                        <SelectItem key={airport.code} value={airport.code}>
                          {airport.code} — {airport.city} ({airport.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destinationCity" className="text-sm text-muted-foreground">Stadt *</Label>
                  <Input
                    id="destinationCity"
                    name="destinationCity"
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    placeholder="z.B. New York"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cargo Information */}
      <Card className="border">
        <CardHeader>
          <CardTitle>Frachtinformationen</CardTitle>
          <CardDescription>Details zur zu transportierenden Fracht</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cargoType">Frachttyp *</Label>
              <Select name="cargoType" required>
                <SelectTrigger>
                  <SelectValue placeholder="Frachttyp wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Allgemein</SelectItem>
                  <SelectItem value="dangerous">Gefahrgut</SelectItem>
                  <SelectItem value="perishable">Verderblich</SelectItem>
                  <SelectItem value="fragile">Empfindlich</SelectItem>
                  <SelectItem value="oversized">Übergröße</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="incoterms">Incoterms *</Label>
              <Select name="incoterms" required>
                <SelectTrigger>
                  <SelectValue placeholder="Incoterms wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXW">EXW - Ex Works</SelectItem>
                  <SelectItem value="FCA">FCA - Free Carrier</SelectItem>
                  <SelectItem value="CPT">CPT - Carriage Paid To</SelectItem>
                  <SelectItem value="CIP">CIP - Carriage and Insurance Paid To</SelectItem>
                  <SelectItem value="DAP">DAP - Delivered at Place</SelectItem>
                  <SelectItem value="DPU">DPU - Delivered at Place Unloaded</SelectItem>
                  <SelectItem value="DDP">DDP - Delivered Duty Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargoDescription">Frachtbeschreibung</Label>
              <Input
                id="cargoDescription"
                name="cargoDescription"
                placeholder="z.B. Elektronische Geräte"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="readyDate">Bereitschaftsdatum *</Label>
              <Input
                id="readyDate"
                name="readyDate"
                type="date"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Lieferdatum</Label>
              <Input
                id="deliveryDate"
                name="deliveryDate"
                type="date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validityDate">Gültigkeitsdatum</Label>
              <Input
                id="validityDate"
                name="validityDate"
                type="date"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Packages */}
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageIcon className="h-5 w-5" />
            Pakete
          </CardTitle>
          <CardDescription>Details zu den einzelnen Paketen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {packages.map((pkg, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Paket {pkg.packageNumber}</h4>
                {packages.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removePackage(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Paketnummer</Label>
                  <Input
                    value={pkg.packageNumber}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Beschreibung</Label>
                  <Input
                    value={pkg.description || ""}
                    onChange={(e) => updatePackage(index, "description", e.target.value)}
                    placeholder="Paketbeschreibung"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Anzahl Stücke *</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={pkg.pieces || ""}
                    onChange={(e) => handleNumberInputChange(index, "pieces", e.target.value, { isInteger: true, minValue: 1 })}
                    required
                    maxLength={7}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bruttogewicht (kg) *</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={pkg.grossWeight || ""}
                    onChange={(e) => handleNumberInputChange(index, "grossWeight", e.target.value, { minValue: 0.1 })}
                    required
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frachtpflichtiges Gewicht (kg)</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={pkg.chargeableWeight ? (serviceType === "air_freight" ? pkg.chargeableWeight.toFixed(1) : pkg.chargeableWeight.toFixed(2)) : ""}
                    disabled
                    className="bg-muted"
                    maxLength={10}
                  />
                  {pkg.length && pkg.width && pkg.height &&  (
                    <p className="text-xs text-muted-foreground">
                      CBM: {((calculateVolume({ length: pkg.length, width: pkg.width, height: pkg.height }) * (pkg.pieces || 1))).toFixed(3)} m³
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Länge (cm)</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={pkg.length || ""}
                    onChange={(e) => handleNumberInputChange(index, "length", e.target.value, { minValue: 0 })}
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Breite (cm)</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={pkg.width || ""}
                    onChange={(e) => handleNumberInputChange(index, "width", e.target.value, { minValue: 0 })}
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Höhe (cm)</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={pkg.height || ""}
                    onChange={(e) => handleNumberInputChange(index, "height", e.target.value, { minValue: 0 })}
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Temperatur</Label>
                  <Input
                    value={pkg.temperature || ""}
                    onChange={(e) => updatePackage(index, "temperature", e.target.value)}
                    placeholder="z.B. 2-8°C"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Besondere Behandlung</Label>
                  <Input
                    value={pkg.specialHandling || ""}
                    onChange={(e) => updatePackage(index, "specialHandling", e.target.value)}
                    placeholder="z.B. Vorsicht Glas"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`dangerous-${index}`}
                    checked={pkg.isDangerous}
                    onCheckedChange={(checked) => updatePackage(index, "isDangerous", checked)}
                  />
                  <Label htmlFor={`dangerous-${index}`}>Gefahrgut</Label>
                </div>

                {pkg.isDangerous && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Gefahrgutklasse</Label>
                      <Input
                        value={pkg.dangerousGoodsClass || ""}
                        onChange={(e) => updatePackage(index, "dangerousGoodsClass", e.target.value)}
                        placeholder="z.B. Klasse 3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>UN-Nummer</Label>
                      <Input
                        value={pkg.unNumber || ""}
                        onChange={(e) => updatePackage(index, "unNumber", e.target.value)}
                        placeholder="z.B. UN1234"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          <Button
            type="reset"
            variant="secondary"
            onClick={addPackage}
            className=""
          >
            <Plus className="h-4 w-4 mr-2" />
            Weitere Pakete hinzufügen
          </Button>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Abbrechen
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || selectedForwarders.length === 0}
        >
          {isSubmitting ? "Wird erstellt..." : "Frachtanfrage erstellen"}
        </Button>
      </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default InquiryForm
