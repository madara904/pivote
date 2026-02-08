"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DotLoading } from "@/components/ui/dot-loading";
import { Input } from "@/components/ui/input";
import { IconInput } from "@/components/ui/icon-input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import Logo from "@/components/logo";

// Schema & Types (beibehalten aus deinem Original)
const organizationSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
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
  vatNumber: z
    .string()
    .min(1, "Bitte geben Sie eine UST-ID ein")
    .regex(/^[0-9]{9}$/, "Die UST-ID muss aus genau 9 Ziffern bestehen"),
  registrationNumber: z.string().optional(),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

const steps = [
  { id: 1, title: "Typ", description: "Geschäftsbereich" },
  { id: 2, title: "Basis", description: "Grunddaten" },
  { id: 3, title: "Kontakt", description: "Kontaktdaten" },
  { id: 4, title: "Details", description: "Rechtliches" },
  { id: 5, title: "Check", description: "Zusammenfassung" },
];

export default function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [orgType, setOrgType] = useState<string | undefined>(undefined);
  const router = useRouter();
  const trpcOptions = useTRPC();

  const createOrg = useMutation(trpcOptions.organization.createOrganization.mutationOptions({
    onSuccess: async (data) => {
      setOrgType(data.organization.type);
      setRedirecting(true);
    },
    onError: (error: any) => {
      toast.error(`Fehler: ${error.message || "Unbekannter Fehler"}`);
    },
  }));

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
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
    },
  });

  useEffect(() => {
    if (redirecting && orgType) {
      router.push(`/dashboard/${orgType}`);
    }
  }, [redirecting, orgType, router]);

  const nextStep = async () => {
    let fieldsToValidate: (keyof OrganizationFormData)[] = [];
    if (currentStep === 1) fieldsToValidate = ["type"];
    if (currentStep === 2) fieldsToValidate = ["name", "email"];
    if (currentStep === 4) fieldsToValidate = ["vatNumber"];

    if (fieldsToValidate.length > 0) {
      const isValid = await form.trigger(fieldsToValidate);
      if (!isValid) return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = (data: OrganizationFormData) => {
    setIsSubmitting(true);
    createOrg.mutate({ ...data, vatNumber: `DE${data.vatNumber}` }, {
      onSettled: () => setIsSubmitting(false)
    });
  };

  return (
    <div className="flex min-h-screen bg-background overflow-hidden font-sans">
      

      <div className="hidden lg:flex w-[400px] bg-accent relative flex-col p-12">
        <div className="relative z-10 flex flex-col h-full">
          <div className="mb-12">
            <h1 className="text-4xl font-black tracking-tighter text-muted-foreground uppercase leading-[0.9]">
              Onboarding<br /><span className="text-muted-foreground/90 text-2xl">Organisation</span>
            </h1>
          </div>

          <div className="flex-1 space-y-10">
            {steps.map((step) => (
              <div key={step.id} className={cn(
                "flex items-start gap-5 transition-all duration-500",
                currentStep === step.id ? "opacity-100 translate-x-2" : "opacity-60"
              )}>
                <div className={cn(
                  "h-7 w-7 rounded-sm border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                  currentStep >= step.id ? "border-muted-foreground bg-muted-foreground/10 text-muted-foreground" : "border-muted-foreground/50 text-muted-foreground/50"
                )}>
                  {currentStep > step.id ? <Check className="h-4 w-4" /> : <span className="text-[11px] font-black">{step.id}</span>}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground leading-none mb-1">
                    {step.title}
                  </span>
                  <span className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-tight">{step.description}</span>
                </div>
              </div>
            ))}
            <div className="absolute bottom-0 left-0">
              <Logo className="h-12 w-auto text-secondary-foreground" />
            </div>
          </div>

        </div>
      </div>

      {/* RECHTE SEITE: DAS FORMULAR */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative">
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-24 overflow-y-auto">
          <div className="w-full max-w-[580px]">
            <Form {...form}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div className="mb-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-3 block">
                      Schritt 0{currentStep}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-foreground leading-none">
                      {steps[currentStep - 1].description}
                    </h2>
                  </div>

                  {/* STEP 1: TYP */}
                  {currentStep === 1 && (
                    <div className="grid grid-cols-1 gap-4">
                      {["shipper", "forwarder"].map((t) => (
                        <div
                          key={t}
                          onClick={() => form.setValue("type", t as any)}
                          className={cn(
                            "group p-6 border-2 transition-all cursor-pointer flex items-center justify-between relative overflow-hidden",
                            form.watch("type") === t 
                              ? "border-primary bg-primary/[0.02]" 
                              : "border-border hover:border-foreground/20 bg-muted/40"
                          )}
                        >
                          <div className="flex items-center gap-5 relative z-10">
                            <div className={cn(
                              "h-14 w-14 border-2 flex items-center justify-center transition-colors bg-background",
                              form.watch("type") === t ? "border-primary text-primary" : "border-border text-muted-foreground group-hover:text-foreground/70"
                            )}>
                              {t === "shipper" ? <Building2 size={28} /> : <Truck size={28} />}
                            </div>
                            <div>
                              <h4 className="font-black text-lg uppercase tracking-tight leading-none mb-1">
                                {t === "shipper" ? "Versender" : "Spediteur"}
                              </h4>
                              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Organisation</p>
                            </div>
                          </div>
                          <ChevronRight className={cn(
                            "h-5 w-5 transition-all",
                            form.watch("type") === t ? "text-primary translate-x-0" : "opacity-0 -translate-x-4"
                          )} />
                        </div>
                      ))}
                      <FormMessage>{form.formState.errors.type?.message}</FormMessage>
                    </div>
                  )}

                  {/* STEP 2: BASIS */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Organisationsname *</FormLabel>
                            <FormControl>
                              <Input placeholder="z.B. Logistik GmbH" className="h-14 rounded-none border-2 focus-visible:ring-0 focus-visible:border-primary px-4 font-bold" {...field} />
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
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Geschäfts E-Mail *</FormLabel>
                            <FormControl>
                              <IconInput
                                icon={<Mail className="h-5 w-5" />}
                                type="email"
                                placeholder="kontakt@firma.de"
                                className="h-14 rounded-none border-2 font-bold"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* STEP 3: KONTAKT (Grid Layout) */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="phone" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Telefon</FormLabel>
                            <Input placeholder="+49..." className="h-12 rounded-none border-2 font-bold" {...field} />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="website" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Website</FormLabel>
                            <Input placeholder="https://..." className="h-12 rounded-none border-2 font-bold" {...field} />
                          </FormItem>
                        )} />
                      </div>
                      <Separator />
                      <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Straße & Hausnummer</FormLabel>
                          <Input className="h-12 rounded-none border-2 font-bold" {...field} />
                        </FormItem>
                      )} />
                      <div className="grid grid-cols-3 gap-4">
                        <FormField control={form.control} name="postalCode" render={({ field }) => (
                          <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">PLZ</FormLabel>
                          <Input className="h-12 rounded-none border-2 font-bold" {...field} /></FormItem>
                        )} />
                        <FormField control={form.control} name="city" render={({ field }) => (
                          <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stadt</FormLabel>
                          <Input className="h-12 rounded-none border-2 font-bold" {...field} /></FormItem>
                        )} />
                        <FormField control={form.control} name="country" render={({ field }) => (
                          <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Land</FormLabel>
                          <Input className="h-12 rounded-none border-2 font-bold" {...field} /></FormItem>
                        )} />
                      </div>
                    </div>
                  )}

                  {/* STEP 4: DETAILS */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <FormField control={form.control} name="vatNumber" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Umsatzsteuer-ID (USt-IdNr.)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground">DE</span>
                              <Input maxLength={9} className="h-14 rounded-none border-2 pl-12 font-bold text-xl tracking-widest" placeholder="123456789" {...field} onChange={e => field.onChange(e.target.value.replace(/\D/g, ""))} />
                            </div>
                          </FormControl>
                          <FormDescription className="text-[10px] uppercase font-bold text-muted-foreground mt-2">Nur die 9-stellige Ziffernfolge eingeben</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  )}

                  {/* STEP 5: SUMMARY (Dashboard Stats Look) */}
                  {currentStep === 5 && (
                    <div className="space-y-4">
                      <div className="p-6 border-2 bg-primary text-background flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Gewählte Organisation</p>
                          <h4 className="text-2xl font-black uppercase tracking-tighter">{form.getValues("type") === "shipper" ? "Versender" : "Spediteur"}</h4>
                        </div>
                        {form.getValues("type") === "shipper" ? <Building2 size={32} /> : <Truck size={32} />}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border-2 border-border">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Name</p>
                          <p className="font-bold truncate uppercase tracking-tight">{form.getValues("name")}</p>
                        </div>
                        <div className="p-4 border-2 border-border">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">USt-IdNr.</p>
                          <p className="font-mono font-bold tracking-tighter">DE{form.getValues("vatNumber")}</p>
                        </div>
                      </div>
                      <div className="p-4 border-2 border-border bg-muted/40">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">Kontakt-Details</p>
                        <div className="flex flex-col gap-1 text-sm font-bold uppercase tracking-tight">
                           <span>{form.getValues("email")}</span>
                           <span className="text-muted-foreground">{form.getValues("phone") || "Keine Telefonnummer"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </Form>
          </div>
        </div>

        {/* NAVIGATION FOOTER */}
        <div className="h-24 border-t flex items-center justify-between px-6 sm:px-12 lg:px-24 bg-background/80 backdrop-blur-md sticky bottom-0 z-20">
          <Button
            type="button"
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
            className="text-[10px] font-black uppercase tracking-[0.2em] hover:bg-muted rounded-none h-12"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
          </Button>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex flex-col items-end gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Fortschritt</span>
              <div className="w-32 h-1 bg-muted relative">
                <motion.div 
                  className="absolute h-full bg-primary"
                  animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={nextStep}
                className="h-12 px-10 rounded-none bg-foreground text-background hover:bg-primary hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all"
              >
                Weiter <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={form.handleSubmit(handleSubmit)}
                disabled={isSubmitting || createOrg.isPending}
                className="h-12 px-10 rounded-none bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em]"
              >
                {(isSubmitting || createOrg.isPending) ? (
                  <DotLoading size="sm" />
                ) : (
                  <>Finalisieren <Check className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}