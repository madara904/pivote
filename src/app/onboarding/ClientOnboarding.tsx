"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Check,
  Building2,
  Truck,
  ArrowRight,
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Palette,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LogoLoader } from "@/components/ui/loader"
import { trpc } from "@/trpc/client"
import { useRouter } from "next/navigation"

const organizationSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
  slug: z
    .string()
    .min(2, "Slug muss mindestens 2 Zeichen lang sein")
    .regex(/^[a-z0-9-]+$/, "Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  type: z.enum(["shipper", "forwarder"], {
    required_error: "Bitte wählen Sie einen Organisationstyp",
  }),
  description: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url("Ungültige Website-URL").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  vatNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  primaryColor: z.string().optional(),
})

type OrganizationFormData = z.infer<typeof organizationSchema>

const steps = [
  {
    id: 1,
    title: "Organisationstyp",
    description: "Wählen Sie Ihren Geschäftsbereich",
  },
  {
    id: 2,
    title: "Grunddaten",
    description: "Name und grundlegende Informationen",
  },
  {
    id: 3,
    title: "Kontaktdaten",
    description: "Wie können wir Sie erreichen?",
  },
  {
    id: 4,
    title: "Zusätzliche Details",
    description: "Weitere Informationen (optional)",
  },
  {
    id: 5,
    title: "Zusammenfassung",
    description: "Überprüfen Sie Ihre Angaben",
  },
]

const organizationTypes = [
  {
    value: "shipper",
    title: "Versender",
    description: "Ich versende Waren und suche Spediteure",
    icon: Building2,
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    selectedColor: "bg-blue-100 border-blue-500",
  },
  {
    value: "forwarder",
    title: "Spediteur",
    description: "Ich biete Transportdienstleistungen an",
    icon: Truck,
    color: "bg-green-50 border-green-200 hover:bg-green-100",
    selectedColor: "bg-green-100 border-green-500",
  },
]

export default function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [orgType, setOrgType] = useState<string | undefined>(undefined)
  const router = useRouter()

  const createOrg = trpc.organization.createOrganization.useMutation({
    onSuccess: (_, variables) => {
      setOrgType(variables.type)
      setRedirecting(true)
      setTimeout(() => {
        if (variables.type === "forwarder") {
          router.push("/dashboard/forwarder")
        } else {
          router.push("/dashboard/shipper")
        }
      }, 800)
    },
  })

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      slug: "",
      email: "",
      type: undefined,
      description: "",
      phone: "",
      website: "",
      address: "",
      city: "",
      postalCode: "",
      country: "Deutschland",
      vatNumber: "",
      registrationNumber: "",
      primaryColor: "#5248ff",
    },
  })

  const watchedName = form.watch("name")
  const watchedType = form.watch("type")

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleNameChange = (name: string) => {
    form.setValue("name", name)
    if (name) {
      form.setValue("slug", generateSlug(name))
    }
  }

  // Navigation function - only validates and moves to next step
  const nextStep = async () => {
    let fieldsToValidate: (keyof OrganizationFormData)[] = []

    switch (currentStep) {
      case 1:
        fieldsToValidate = ["type"]
        break
      case 2:
        fieldsToValidate = ["name", "slug", "email"]
        break
      case 3:
        // Optional fields, no validation needed
        break
      case 4:
        // Optional fields, no validation needed
        break
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await form.trigger(fieldsToValidate)
      if (!isValid) return
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  // Actual form submission - only called when "Absenden" is clicked
  const handleSubmit = async (data: OrganizationFormData) => {
    setIsSubmitting(true)
    try {
      await createOrg.mutateAsync(data)
    } catch (error) {
      console.error("Fehler beim Erstellen der Organisation:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <LogoLoader size={64} color="var(--primary)" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)] font-sans">
      <div className="container mx-auto py-8">
        <div className="max-w-5xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <motion.div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        currentStep >= step.id
                          ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                      }`}
                      animate={{
                        scale: currentStep === step.id ? 1.1 : 1,
                      }}
                    >
                      {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                    </motion.div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-20 h-1 mx-4 transition-colors ${
                          currentStep > step.id ? "bg-[var(--primary)]" : "bg-[var(--muted)]"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-bold text-[var(--primary)]">{steps[currentStep - 1].title}</h2>
              <p className="text-[var(--muted-foreground)] mt-2">{steps[currentStep - 1].description}</p>
            </div>
          </div>

          <Form {...form}>
            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Step 1: Organization Type */}
                  {currentStep === 1 && (
                    <Card className="bg-[var(--card)] text-[var(--card-foreground)] rounded-[var(--radius-lg)] font-sans min-h-[600px]">
                      <CardHeader className="pb-8">
                        <CardTitle className="text-xl">Wählen Sie Ihren Organisationstyp</CardTitle>
                      </CardHeader>
                      <CardContent className="px-8 pb-8">
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {organizationTypes.map((type) => {
                                    const Icon = type.icon
                                    const isSelected = field.value === type.value
                                    return (
                                      <motion.div
                                        key={type.value}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                      >
                                        <Card
                                          className={`cursor-pointer transition-all relative ${
                                            isSelected ? type.selectedColor : type.color
                                          }`}
                                          onClick={() => field.onChange(type.value)}
                                        >
                                          {isSelected && (
                                            <motion.div
                                              initial={{ scale: 0 }}
                                              animate={{ scale: 1 }}
                                              className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--primary)] rounded-full flex items-center justify-center"
                                            >
                                              <Check className="w-4 h-4 text-[var(--primary-foreground)]" />
                                            </motion.div>
                                          )}
                                          <CardContent className="p-6 text-center">
                                            <Icon className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
                                            <h3 className="text-lg font-semibold mb-2">{type.title}</h3>
                                            <p className="text-sm text-[var(--muted-foreground)]">{type.description}</p>
                                          </CardContent>
                                        </Card>
                                      </motion.div>
                                    )
                                  })}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Step 2: Basic Information */}
                  {currentStep === 2 && (
                    <Card className="bg-[var(--card)] text-[var(--card-foreground)] rounded-[var(--radius-lg)] font-sans min-h-[600px]">
                      <CardHeader>
                        <CardTitle className="text-xl">Grundlegende Informationen</CardTitle>
                        <CardDescription>Geben Sie die wichtigsten Daten Ihrer Organisation ein.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-8 px-8 pb-8">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Organisationsname *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="z.B. Mustermann Logistik GmbH"
                                  {...field}
                                  onChange={(e) => handleNameChange(e.target.value)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>E-Mail-Adresse *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type="email"
                                    placeholder="kontakt@mustermann-logistik.de"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Beschreibung</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Kurze Beschreibung Ihrer Organisation..."
                                  className="resize-none"
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Optional: Beschreiben Sie Ihre Organisation in wenigen Sätzen.
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Step 3: Contact Information */}
                  {currentStep === 3 && (
                    <Card className="bg-[var(--card)] text-[var(--card-foreground)] rounded-[var(--radius-lg)] font-sans min-h-[600px]">
                      <CardHeader>
                        <CardTitle className="text-xl">Kontaktinformationen</CardTitle>
                        <CardDescription>Wie können Geschäftspartner Sie erreichen?</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-8 px-8 pb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefonnummer</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="+49 123 456789" className="pl-10" {...field} />
                                  </div>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      placeholder="https://www.mustermann-logistik.de"
                                      className="pl-10"
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <Separator />
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            Adresse
                          </h4>
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Straße und Hausnummer</FormLabel>
                                <FormControl>
                                  <Input placeholder="Musterstraße 123" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="postalCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>PLZ</FormLabel>
                                  <FormControl>
                                    <Input placeholder="12345" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Stadt</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Musterstadt" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="country"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Land</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Deutschland" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Step 4: Additional Details */}
                  {currentStep === 4 && (
                    <Card className="bg-[var(--card)] text-[var(--card-foreground)] rounded-[var(--radius-lg)] font-sans min-h-[600px]">
                      <CardHeader>
                        <CardTitle className="text-xl">Zusätzliche Details</CardTitle>
                        <CardDescription>Weitere Informationen für eine vollständige Registrierung.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-8 px-8 pb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                          <FormField
                            control={form.control}
                            name="vatNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>USt-IdNr.</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="DE123456789" className="pl-10" {...field} />
                                  </div>
                                </FormControl>
                                <FormDescription>Umsatzsteuer-Identifikationsnummer</FormDescription>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="registrationNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Handelsregisternummer</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="HRB 12345" className="pl-10" {...field} />
                                  </div>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Step 5: Summary */}
                  {currentStep === 5 && (
                    <Card className="bg-[var(--card)] text-[var(--card-foreground)] rounded-[var(--radius-lg)] font-sans min-h-[600px]">
                      <CardHeader>
                        <CardTitle>Zusammenfassung</CardTitle>
                        <CardDescription>Überprüfen Sie Ihre Angaben vor der Registrierung.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                          <div className="space-y-3">
                            <div className="bg-muted/30 pl-8 pb-3 rounded-lg">
                              <h4 className="font-semibold text-base text-muted-foreground mb-6 uppercase tracking-wide">
                                Organisationstyp
                              </h4>
                              <div className="flex items-center space-x-3">
                                {form.getValues("type") === "shipper" ? (
                                  <Building2 className="w-5 h-5 text-blue-600" />
                                ) : (
                                  <Truck className="w-5 h-5 text-green-600" />
                                )}
                                <Badge variant="secondary" className="text-sm px-3 py-1">
                                  {form.getValues("type") === "shipper" ? "Versender" : "Spediteur"}
                                </Badge>
                              </div>
                            </div>

                            <div className="bg-muted/30 p-8 rounded-lg">
                              <h4 className="font-semibold text-base text-muted-foreground mb-6 uppercase tracking-wide">
                                Grunddaten
                              </h4>
                              <div className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                  <span className="font-medium text-muted-foreground">Name:</span>
                                  <span className="text-right">{form.getValues("name")}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium text-muted-foreground">Slug:</span>
                                  <span className="text-right font-mono text-xs bg-muted px-2 py-1 rounded">
                                    {form.getValues("slug")}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium text-muted-foreground">E-Mail:</span>
                                  <span className="text-right">{form.getValues("email")}</span>
                                </div>
                                {form.getValues("description") && (
                                  <div className="pt-4 border-t">
                                    <span className="font-medium text-muted-foreground block mb-3">Beschreibung:</span>
                                    <p className="text-sm text-muted-foreground italic">
                                      {form.getValues("description")}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-8">
                            <div className="bg-muted/30 p-8 rounded-lg">
                              <h4 className="font-semibold text-base text-muted-foreground mb-6 uppercase tracking-wide">
                                Kontakt
                              </h4>
                              <div className="space-y-4 text-sm">
                                {form.getValues("phone") && (
                                  <div className="flex justify-between">
                                    <span className="font-medium text-muted-foreground">Telefon:</span>
                                    <span className="text-right">{form.getValues("phone")}</span>
                                  </div>
                                )}
                                {form.getValues("website") && (
                                  <div className="flex justify-between">
                                    <span className="font-medium text-muted-foreground">Website:</span>
                                    <span className="text-right text-blue-600 hover:underline">
                                      {form.getValues("website")}
                                    </span>
                                  </div>
                                )}
                                {(form.getValues("address") || form.getValues("city")) && (
                                  <div className="pt-4 border-t">
                                    <span className="font-medium text-muted-foreground block mb-3">Adresse:</span>
                                    <p className="text-sm text-right">
                                      {[
                                        form.getValues("address"),
                                        form.getValues("postalCode"),
                                        form.getValues("city"),
                                        form.getValues("country"),
                                      ]
                                        .filter(Boolean)
                                        .join(", ")}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {(form.getValues("vatNumber") || form.getValues("registrationNumber")) && (
                              <div className="bg-muted/30 p-8 rounded-lg">
                                <h4 className="font-semibold text-base text-muted-foreground mb-6 uppercase tracking-wide">
                                  Weitere Details
                                </h4>
                                <div className="space-y-4 text-sm">
                                  {form.getValues("vatNumber") && (
                                    <div className="flex justify-between">
                                      <span className="font-medium text-muted-foreground">USt-IdNr.:</span>
                                      <span className="text-right font-mono text-xs bg-muted px-2 py-1 rounded">
                                        {form.getValues("vatNumber")}
                                      </span>
                                    </div>
                                  )}
                                  {form.getValues("registrationNumber") && (
                                    <div className="flex justify-between">
                                      <span className="font-medium text-muted-foreground">HRB:</span>
                                      <span className="text-right font-mono text-xs bg-muted px-2 py-1 rounded">
                                        {form.getValues("registrationNumber")}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="border-t pt-8">
                          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Hinweis:</strong> Nach der Erstellung können Sie alle Angaben in den Einstellungen
                              Ihrer Organisation bearbeiten.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1 || isSubmitting}
                  className="flex items-center space-x-2 bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Zurück</span>
                </Button>

                <div className="flex space-x-4">
                  {/* Navigation Button - Only show if not on last step */}
                  {currentStep < steps.length && (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={isSubmitting}
                      className="flex items-center space-x-2"
                    >
                      <span>Weiter</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}

                  {/* Submit Button - Only show on last step */}
                  {currentStep === steps.length && (
                    <Button
                      type="button"
                      onClick={form.handleSubmit(handleSubmit)}
                      disabled={isSubmitting}
                      className="flex items-center space-x-2 min-w-[200px] bg-primary"
                    >
                      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      <span>{isSubmitting ? "Erstelle Organisation..." : "Organisation erstellen"}</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
