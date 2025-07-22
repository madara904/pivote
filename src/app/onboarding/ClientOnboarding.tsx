"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Truck, Check, Plus, X, Sparkles } from "lucide-react";
import { trpc } from "@/trpc/client";
import Logo from "@/components/logo";

// Zod Schemas
const organizationTypeSchema = z.enum(["company", "forwarder"], {
  required_error: "Bitte wählen Sie einen Unternehmenstyp aus.",
});

const basicOrgSchema = z.object({
  organizationType: organizationTypeSchema,
  name: z.string().min(2, "Name ist erforderlich"),
  slug: z
    .string()
    .min(2, "Slug ist erforderlich")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten"
    ),
  email: z.string().email("Gültige Email ist erforderlich"),
});

const organizationDetailsSchema = z.object({
  organizationType: organizationTypeSchema,
  name: z
    .string()
    .min(2, {
      message: "Der Unternehmensname muss mindestens 2 Zeichen lang sein.",
    })
    .max(100, {
      message: "Der Unternehmensname darf maximal 100 Zeichen lang sein.",
    })
    .trim(),
  slug: z
    .string()
    .min(2, { message: "Slug muss mindestens 2 Zeichen lang sein." })
    .max(50, { message: "Slug darf maximal 50 Zeichen lang sein." })
    .regex(/^[a-z0-9-]+$/, {
      message:
        "Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten.",
    })
    .trim(),
  email: z
    .string()
    .email({ message: "Bitte geben Sie eine gültige E-Mail-Adresse ein." })
    .trim(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  website: z
    .string()
    .url({ message: "Bitte geben Sie eine gültige Website-URL an." })
    .optional()
    .or(z.literal("")),
  taxNumber: z.string().optional(),
  industry: z.string().optional(),
  annualShipments: z.number().optional(),
  services: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  coverageAreas: z.array(z.string()).optional(),
});

type OrganizationType = z.infer<typeof organizationTypeSchema>;
type BasicOrgForm = z.infer<typeof basicOrgSchema>;
type OrganizationDetails = z.infer<typeof organizationDetailsSchema>;

// Constants
const steps = [
  { title: "Willkommen", description: "Starte dein Setup" },
  { title: "Unternehmenstyp", description: "Wähle deinen Typ" },
  { title: "Details", description: "Fülle Details aus" },
  { title: "Zusatzinfos", description: "Optional" },
  { title: "Fertig!", description: "Los geht's" },
];

const countries = [
  "Deutschland",
  "Österreich",
  "Schweiz",
  "Niederlande",
  "Belgien",
  "Frankreich",
  "Italien",
  "Spanien",
  "Polen",
  "Tschechien",
  "Vereinigtes Königreich",
  "Vereinigte Staaten",
  "Kanada",
  "Australien",
  "Japan",
  "Singapur",
  "Sonstige",
];

const forwarderServices = [
  "Seefracht",
  "Luftfracht",
  "Straßentransport",
  "Bahntransport",
  "Zollabfertigung",
  "Lagerung",
  "Distribution",
  "Projektfracht",
  "Gefahrgut",
  "Temperaturkontrolliert",
];

const certifications = [
  "ISO 9001",
  "ISO 14001",
  "IATA",
  "FIATA",
  "C-TPAT",
  "AEO",
  "TAPA",
  "GDP",
  "HACCP",
];

// Helper Functions
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Components
function Stepper({ step }: { step: number }) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between max-w-4xl mx-auto px-4">
        {steps.map((s, i) => (
          <div
            key={i}
            className="flex flex-col items-center relative"
            style={{ minWidth: "80px" }}
          >
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                i === step
                  ? "bg-primary text-white border-primary scale-110"
                  : i < step
                    ? "bg-primary/80 text-white border-primary/80"
                    : "bg-muted text-muted-foreground border-muted-foreground"
              }`}
            >
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <div className="mt-2 text-center">
              <span
                className={`text-sm font-medium block ${i === step ? "text-primary" : "text-muted-foreground"}`}
              >
                {s.title}
              </span>
              <span className="text-xs text-muted-foreground hidden sm:block">
                {s.description}
              </span>
            </div>
            {/* Connection line */}
            {i < steps.length - 1 && (
              <div
                className={`absolute top-4 left-full w-full h-0.5 -translate-y-1/2 transition-colors duration-300 hidden sm:block ${
                  i < step ? "bg-primary/80" : "bg-muted-foreground/30"
                }`}
                style={{ width: "calc(100% - 16px)", marginLeft: "8px" }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function WelcomeIllustration() {
  return (
    <svg
      width="320"
      height="320"
      viewBox="0 0 320 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-xs mx-auto"
    >
      {/* Card background */}
      <rect x="60" y="100" width="200" height="120" rx="24" fill="#fff" stroke="#EEF2FF" strokeWidth="8" />
      {/* Profile avatar circle, left inline with name bar */}
      <circle cx="110" cy="140" r="15" fill="#A5B4FC" />
      {/* Name bar, right of avatar */}
      <rect x="132" y="128" width="100" height="20" rx="8" fill="#A5B4FC" />
      {/* Details bar, below name bar */}
      <rect x="100" y="164" width="132" height="14" rx="7" fill="#EEF2FF" />
      {/* Details bar 2, below */}
      <rect x="100" y="186" width="90" height="12" rx="6" fill="#EEF2FF" />
    </svg>
  );
}

// Main Component
export function ClientOnboarding() {
  const [step, setStep] = useState(0);
  const [onboardingStarted, setOnboardingStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimatingSuccess, setIsAnimatingSuccess] = useState(false);
  const router = useRouter();
  const createOrg = trpc.organization.createOrganization.useMutation();

  // Basis-Formular für Schritt 1
  const basicForm = useForm<BasicOrgForm>({
    resolver: zodResolver(basicOrgSchema),
    defaultValues: {
      organizationType: "company",
      name: "",
      slug: "",
      email: "",
    },
  });

  // Vollständiges Formular für Details
  const [formData, setFormData] = useState<Partial<OrganizationDetails>>({
    services: [],
    certifications: [],
    coverageAreas: [],
  });

  // Auto-generate slug when name changes
  const watchName = basicForm.watch("name");
  useEffect(() => {
    if (watchName) {
      const slug = generateSlug(watchName);
      basicForm.setValue("slug", slug);
    }
  }, [watchName, basicForm]);

  useEffect(() => {
    if (step === 5) {
      // Animation starten
      const timer = setTimeout(() => {
        setIsAnimatingSuccess(true);
      }, 100);
      // Nach Animation zum Dashboard
      const redirectTimer = setTimeout(() => {
        router.replace("/dashboard");
      }, 3000);
      return () => {
        clearTimeout(timer);
        clearTimeout(redirectTimer);
      };
    }
  }, [step, router]);

  const handleBasicSubmit = (data: BasicOrgForm) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleOptionalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(4);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const basicData = basicForm.getValues();
      await createOrg.mutateAsync({
        name: basicData.name,
        slug: basicData.slug,
        email: basicData.email,
        type: basicData.organizationType === "forwarder" ? "forwarder" : "shipper",
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
        phone: formData.phone,
        website: formData.website,
        vatNumber: formData.taxNumber,
        description: formData.industry,
        // Add more fields if you collect them in the form
        // registrationNumber: formData.registrationNumber,
        // logo: formData.logo,
        // primaryColor: formData.primaryColor,
        // settings: formData.settings,
      });
      setStep(5);
    } catch (err: unknown) {
      let trpcMessage: string | undefined = undefined;
      if (typeof err === "object" && err !== null) {
        // @ts-expect-error: shape and data may exist on TRPC errors
        trpcMessage = err.shape?.message || err.data?.message;
      }
      setError(
        trpcMessage ||
        (err instanceof Error ? err.message : "Registrierung konnte nicht abgeschlossen werden.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const addArrayItem = (
    field: "services" | "certifications" | "coverageAreas",
    item: string
  ) => {
    if (!item.trim()) return;
    const currentArray = (formData[field] as string[]) || [];
    if (!currentArray.includes(item)) {
      setFormData((prev) => ({ ...prev, [field]: [...currentArray, item] }));
    }
  };

  const removeArrayItem = (
    field: "services" | "certifications" | "coverageAreas",
    index: number
  ) => {
    const currentArray = (formData[field] as string[]) || [];
    setFormData((prev) => ({
      ...prev,
      [field]: currentArray.filter((_, i) => i !== index),
    }));
  };

  const organizationType = basicForm.watch("organizationType");

  if (step < 0 || step >= steps.length) return null;

  return (
    <div className="min-h-screen w-full flex flex-row items-stretch bg-gradient-to-br from-[#f8fafc] to-[#e0e7ff] overflow-hidden">
      {/* Left: Branding, Logo, Illustration */}
      <AnimatePresence initial={false}>
        {!onboardingStarted && (
          <motion.div
            key="left-panel"
            initial={false}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="hidden md:flex flex-col flex-1 bg-gradient-to-br from-[#6366f1]/10 to-[#a5b4fc]/10 p-12 relative z-10"
            style={{ minWidth: 0 }}
          >
            <div className="flex-1 flex flex-col justify-center items-center">
              <h1 className="text-4xl font-extrabold mb-4 text-primary text-center">
                Willkommen!
              </h1>
              <p className="text-lg text-muted-foreground max-w-md text-center mb-8">
                Richte deine Organisation ein und entdecke, wie einfach Logistik
                sein kann.
              </p>
              <div className="flex items-center justify-center rounded-full bg-primary/20">
                <div className="w-60 h-60 rounded-full bg-secondary/70">
                  <WelcomeIllustration />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right: Stepper and Form */}
      <motion.div
        key="right-panel"
        initial={false}
        animate={
          onboardingStarted ? { flexBasis: "100%" } : { flexBasis: "50%" }
        }
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className={`flex flex-col items-center min-h-screen w-full bg-white/80 shadow-2xl relative z-20 py-8 ${
          step === 0 ? "justify-center" : "justify-start"
        }`}
        style={{ minWidth: 0, flex: 1 }}
      >
        <div className="w-full max-w-4xl flex flex-col items-center px-4">
          {/* Animated logo above stepper when onboardingStarted */}
          <AnimatePresence initial={false}>
            {onboardingStarted && (
              <motion.div
                key="logo-center"
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="mb-4 flex justify-center w-20 h-20 mx-auto"
              >
                <Logo className="w-full h-full text-primary" />
              </motion.div>
            )}
          </AnimatePresence>

          <Stepper step={step} />

          {/* Form Content Container */}
          <div className="w-full max-w-2xl">
            {/* Animate the form content */}
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="flex flex-col items-center gap-8"
                >
                  {onboardingStarted && (
                    <motion.div
                      key="logo-center"
                      initial={{ opacity: 0, y: -40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -40 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      className="mb-4 flex justify-center w-20 h-20 mx-auto"
                    >
                      <Logo className="w-full h-full text-primary" />
                    </motion.div>
                  )}
                  <Button
                    className="w-full mt-2"
                    onClick={() => {
                      setOnboardingStarted(true);
                      setStep(1);
                    }}
                  >
                    Los geht&apos;s
                  </Button>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">
                      Welche Art von Unternehmen sind Sie?
                    </h2>
                    <p className="text-muted-foreground">
                      Dies hilft uns, Ihre Erfahrung anzupassen
                    </p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div
                      className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 rounded-lg p-6 ${
                        organizationType === "company"
                          ? "border-blue-400 bg-blue-50"
                          : "border-slate-200 hover:border-blue-400 bg-white"
                      }`}
                      onClick={() =>
                        basicForm.setValue("organizationType", "company")
                      }
                    >
                      <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 border border-blue-100">
                          <Building2 className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">
                          Unternehmen
                        </h3>
                        <p className="text-slate-600 text-sm">
                          Produktions-, Handels- oder
                          Dienstleistungsunternehmen, das Produkte versendet
                        </p>
                      </div>
                    </div>
                    <div
                      className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 rounded-lg p-6 ${
                        organizationType === "forwarder"
                          ? "border-green-400 bg-green-50"
                          : "border-slate-200 hover:border-green-400 bg-white"
                      }`}
                      onClick={() =>
                        basicForm.setValue("organizationType", "forwarder")
                      }
                    >
                      <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100">
                          <Truck className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">
                          Spediteur
                        </h3>
                        <p className="text-slate-600 text-sm">
                          Logistikunternehmen, das Sendungen für andere
                          Unternehmen organisiert
                        </p>
                      </div>
                    </div>
                  </div>
                  <form
                    onSubmit={basicForm.handleSubmit(handleBasicSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <Input
                          className="h-12 text-lg"
                          placeholder="Name der Organisation"
                          {...basicForm.register("name")}
                        />
                        {basicForm.formState.errors.name && (
                          <p className="text-sm text-red-600 mt-1">
                            {basicForm.formState.errors.name.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Input
                          className="h-12 text-lg"
                          placeholder="Slug (z.B. pivote)"
                          {...basicForm.register("slug")}
                        />
                        {basicForm.formState.errors.slug && (
                          <p className="text-sm text-red-600 mt-1">
                            {basicForm.formState.errors.slug.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Input
                        className="h-12 text-lg"
                        placeholder="Email"
                        {...basicForm.register("email")}
                      />
                      {basicForm.formState.errors.email && (
                        <p className="text-sm text-red-600 mt-1">
                          {basicForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-1/3 bg-transparent"
                        onClick={() => {
                          setOnboardingStarted(false);
                          setStep(0);
                        }}
                      >
                        Zurück
                      </Button>
                      <Button type="submit" className="w-2/3">
                        Weiter
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {step === 2 && (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  onSubmit={handleDetailsSubmit}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">
                      Unternehmensdetails
                    </h2>
                    <Badge variant="secondary" className="capitalize">
                      {organizationType === "company" ? (
                        <>
                          <Building2 className="w-3 h-3 mr-1" />
                          Unternehmen
                        </>
                      ) : (
                        <>
                          <Truck className="w-3 h-3 mr-1" />
                          Spediteur
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {organizationType === "company" && (
                        <Input
                          className="h-12 text-lg"
                          placeholder="Branche (z.B. Fertigung, Handel)"
                          value={formData.industry || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              industry: e.target.value,
                            }))
                          }
                        />
                      )}
                    </div>
                    <Textarea
                      placeholder="Straßenadresse"
                      rows={2}
                      value={formData.address || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <Input
                        placeholder="Stadt"
                        value={formData.city || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="PLZ"
                        value={formData.postalCode || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            postalCode: e.target.value,
                          }))
                        }
                      />
                      <Select
                        value={formData.country || ""}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, country: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Land auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Input
                        placeholder="Telefonnummer"
                        value={formData.phone || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="Website (optional)"
                        value={formData.website || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            website: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-1/3 bg-transparent"
                      onClick={() => setStep(1)}
                    >
                      Zurück
                    </Button>
                    <Button type="submit" className="w-2/3">
                      Weiter
                    </Button>
                  </div>
                </motion.form>
              )}

              {step === 3 && (
                <motion.form
                  key="step3"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  onSubmit={handleOptionalSubmit}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold mb-4 text-center">
                    Zusatzinfos (Optional)
                  </h2>
                  <div className="space-y-6">
                    <Input
                      placeholder="Steuernummer / USt-IdNr. (optional)"
                      value={formData.taxNumber || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          taxNumber: e.target.value,
                        }))
                      }
                    />
                    {organizationType === "company" && (
                      <Input
                        type="number"
                        placeholder="Geschätzte jährliche Sendungen (optional)"
                        value={formData.annualShipments || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            annualShipments:
                              Number.parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                    )}
                    {organizationType === "forwarder" && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-3">
                            Angebotene Dienstleistungen
                          </h3>
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                            {forwarderServices.map((service) => (
                              <Button
                                key={service}
                                type="button"
                                variant={
                                  (
                                    (formData.services as string[]) || []
                                  ).includes(service)
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className="justify-start text-xs"
                                onClick={() => {
                                  const currentServices =
                                    (formData.services as string[]) || [];
                                  if (currentServices.includes(service)) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      services: currentServices.filter(
                                        (s) => s !== service
                                      ),
                                    }));
                                  } else {
                                    setFormData((prev) => ({
                                      ...prev,
                                      services: [...currentServices, service],
                                    }));
                                  }
                                }}
                              >
                                {service}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-3">
                            Zertifizierungen
                          </h3>
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                            {certifications.map((cert) => (
                              <Button
                                key={cert}
                                type="button"
                                variant={
                                  (
                                    (formData.certifications as string[]) || []
                                  ).includes(cert)
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className="justify-start text-xs"
                                onClick={() => {
                                  const currentCerts =
                                    (formData.certifications as string[]) || [];
                                  if (currentCerts.includes(cert)) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      certifications: currentCerts.filter(
                                        (c) => c !== cert
                                      ),
                                    }));
                                  } else {
                                    setFormData((prev) => ({
                                      ...prev,
                                      certifications: [...currentCerts, cert],
                                    }));
                                  }
                                }}
                              >
                                {cert}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-3">
                            Abdeckungsgebiete
                          </h3>
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Abdeckungsgebiet hinzufügen (z.B. Europa)"
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addArrayItem(
                                      "coverageAreas",
                                      e.currentTarget.value
                                    );
                                    e.currentTarget.value = "";
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={(e) => {
                                  const input = e.currentTarget
                                    .previousElementSibling as HTMLInputElement;
                                  addArrayItem("coverageAreas", input.value);
                                  input.value = "";
                                }}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {((formData.coverageAreas as string[]) || []).map(
                                (area, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="flex items-center gap-1"
                                  >
                                    {area}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-auto p-0 w-4 h-4"
                                      onClick={() =>
                                        removeArrayItem("coverageAreas", index)
                                      }
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-1/3 bg-transparent"
                      onClick={() => setStep(2)}
                    >
                      Zurück
                    </Button>
                    <Button type="submit" className="w-2/3">
                      Weiter
                    </Button>
                  </div>
                </motion.form>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="flex flex-col items-center gap-8"
                >
                  <svg
                    width="96"
                    height="96"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="mb-2"
                  >
                    <circle cx="12" cy="12" r="12" fill="#D1FAE5" />
                    <path
                      d="M7 13l3 3 7-7"
                      stroke="#10B981"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <h2 className="text-2xl font-bold text-center">
                    Fast geschafft!
                  </h2>
                  <p className="text-center text-muted-foreground">
                    Klicke auf &quot;Organisation anlegen&quot; um loszulegen.
                  </p>
                  <Button
                    className="w-full h-12 text-lg"
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting || createOrg.isPending}
                  >
                    {isSubmitting || createOrg.isPending
                      ? "Anlegen..."
                      : "Organisation anlegen"}
                  </Button>
                  {createOrg.error && (
                    <div className="text-red-600 text-sm mt-2">
                      {createOrg.error.message}
                    </div>
                  )}
                </motion.div>
              )}

              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="text-center space-y-8"
                >
                  {/* Animiertes Erfolgs-Icon */}
                  <div className="relative">
                    <div
                      className={`
                        mx-auto w-32 h-32 bg-green-50 rounded-full flex items-center justify-center border border-green-100
                         transition-all duration-1000 ease-out
                        ${isAnimatingSuccess ? "scale-100 opacity-100" : "scale-50 opacity-0"}
                      `}
                    >
                      <div
                        className={`
                          w-24 h-24 bg-green-100 rounded-full flex items-center justify-center
                          transition-all duration-700 delay-300 ease-out
                          ${isAnimatingSuccess ? "scale-100 opacity-100" : "scale-50 opacity-0"}
                        `}
                      >
                        <Check
                          className={`
                            w-12 h-12 text-green-600
                             transition-all duration-500 delay-600 ease-out
                            ${isAnimatingSuccess ? "scale-100 opacity-100" : "scale-0 opacity-0"}
                          `}
                        />
                      </div>
                    </div>
                    {/* Glitzer-Animation */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(6)].map((_, i) => (
                        <Sparkles
                          key={i}
                          className={`
                            absolute w-4 h-4 text-yellow-400
                            transition-all duration-1000 delay-700 ease-out
                            ${isAnimatingSuccess ? "opacity-100" : "opacity-0"}
                          `}
                          style={{
                            top: `${20 + Math.sin((i * 60 * Math.PI) / 180) * 40}%`,
                            left: `${50 + Math.cos((i * 60 * Math.PI) / 180) * 40}%`,
                            animationDelay: `${700 + i * 100}ms`,
                            animation: isAnimatingSuccess
                              ? "pulse 2s infinite"
                              : "none",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Erfolgsmeldung */}
                  <div
                    className={`
                      space-y-4 transition-all duration-700 delay-500 ease-out
                      ${isAnimatingSuccess ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
                    `}
                  >
                    <h2 className="text-3xl font-bold text-slate-900">
                      Willkommen an Bord! 🎉
                    </h2>
                    <p className="text-lg text-slate-600 max-w-md mx-auto">
                      Ihr Unternehmen wurde erfolgreich erstellt. Sie werden
                      automatisch zum Dashboard weitergeleitet.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
