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
import { AlertCircle, Package, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Forwarder {
  id: string
  name: string
  email: string
  city: string
  country: string
  isActive: boolean
}

interface Package {
  packageNumber: string
  description?: string
  pieces: number
  grossWeight: number
  chargeableWeight?: number
  length?: number
  width?: number
  height?: number
  temperature?: string
  specialHandling?: string
  isDangerous: boolean
  dangerousGoodsClass?: string
  unNumber?: string
}

interface InquiryFormProps {
  forwarders: Forwarder[]
}

const InquiryForm = ({ forwarders }: InquiryFormProps) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedForwarders, setSelectedForwarders] = useState<string[]>([])
  const [packages, setPackages] = useState<Package[]>([
    {
      packageNumber: "",
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

  const createInquiry = trpc.inquiry.shipper.createInquiry.useMutation({
    onSuccess: (data) => {
      toast.success(`Frachtanfrage ${data.referenceNumber} erfolgreich erstellt!`)
      router.refresh()
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

  const addPackage = () => {
    setPackages(prev => [...prev, {
      packageNumber: "",
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
      setPackages(prev => prev.filter((_, i) => i !== index))
    }
  }

  const updatePackage = (index: number, field: keyof Package, value: string | number | boolean) => {
    setPackages(prev => prev.map((pkg, i) => 
      i === index ? { ...pkg, [field]: value } : pkg
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      
      const inquiryData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string || undefined,
        serviceType: formData.get("serviceType") as "air_freight" | "sea_freight" | "road_freight" | "rail_freight",
        originAirport: formData.get("originAirport") as string,
        originCity: formData.get("originCity") as string,
        originCountry: formData.get("originCountry") as string,
        destinationAirport: formData.get("destinationAirport") as string,
        destinationCity: formData.get("destinationCity") as string,
        destinationCountry: formData.get("destinationCountry") as string,
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
      // Handle inquiry creation error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Grundinformationen</CardTitle>
          <CardDescription>Allgemeine Informationen zur Frachtanfrage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                name="title"
                placeholder="z.B. Elektronik von München nach New York"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceType">Service-Typ *</Label>
              <Select name="serviceType" required>
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
      <Card>
        <CardHeader>
          <CardTitle>Ursprung und Ziel</CardTitle>
          <CardDescription>Abgangs- und Zielort der Sendung</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="originAirport">Abgangsflughafen *</Label>
              <Input
                id="originAirport"
                name="originAirport"
                placeholder="z.B. MUC"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originCity">Abgangsstadt *</Label>
              <Input
                id="originCity"
                name="originCity"
                placeholder="z.B. München"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originCountry">Abgangsland *</Label>
              <Input
                id="originCountry"
                name="originCountry"
                placeholder="z.B. Deutschland"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="destinationAirport">Zielflughafen *</Label>
              <Input
                id="destinationAirport"
                name="destinationAirport"
                placeholder="z.B. JFK"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destinationCity">Zielstadt *</Label>
              <Input
                id="destinationCity"
                name="destinationCity"
                placeholder="z.B. New York"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destinationCountry">Zielland *</Label>
              <Input
                id="destinationCountry"
                name="destinationCountry"
                placeholder="z.B. USA"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cargo Information */}
      <Card>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Pakete
          </CardTitle>
          <CardDescription>Details zu den einzelnen Paketen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {packages.map((pkg, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Paket {index + 1}</h4>
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
                  <Label>Paketnummer *</Label>
                  <Input
                    value={pkg.packageNumber}
                    onChange={(e) => updatePackage(index, "packageNumber", e.target.value)}
                    placeholder="z.B. PKG-001"
                    required
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
                    type="number"
                    min="1"
                    value={pkg.pieces}
                    onChange={(e) => updatePackage(index, "pieces", parseInt(e.target.value) || 1)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bruttogewicht (kg) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={pkg.grossWeight}
                    onChange={(e) => updatePackage(index, "grossWeight", parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Verrechnungsgewicht (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={pkg.chargeableWeight || ""}
                    onChange={(e) => updatePackage(index, "chargeableWeight", parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Länge (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={pkg.length || ""}
                    onChange={(e) => updatePackage(index, "length", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Breite (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={pkg.width || ""}
                    onChange={(e) => updatePackage(index, "width", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Höhe (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={pkg.height || ""}
                    onChange={(e) => updatePackage(index, "height", parseFloat(e.target.value) || 0)}
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
            type="button"
            variant="outline"
            onClick={addPackage}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Weitere Pakete hinzufügen
          </Button>
        </CardContent>
      </Card>

      {/* Forwarder Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Spediteure auswählen</CardTitle>
          <CardDescription>Wählen Sie die Spediteure aus, die diese Anfrage erhalten sollen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {forwarders.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Keine Spediteure verfügbar. Bitte kontaktieren Sie den Administrator.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {forwarders.map((forwarder) => (
                <div key={forwarder.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={forwarder.id}
                    checked={selectedForwarders.includes(forwarder.id)}
                    onCheckedChange={(checked) => handleForwarderChange(forwarder.id, checked as boolean)}
                  />
                  <Label htmlFor={forwarder.id} className="flex-1">
                    <div className="font-medium">{forwarder.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {forwarder.city}, {forwarder.country}
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          )}
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
  )
}

export default InquiryForm
