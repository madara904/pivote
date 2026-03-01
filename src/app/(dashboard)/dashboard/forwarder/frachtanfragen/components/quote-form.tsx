"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Euro, FileText, Truck } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  sanitizeMoneyInput,
  sanitizeIntegerInput,
  roundToTwoDecimals,
} from "@/lib/form-sanitization";
import UpgradeDialog from "@/components/upgrade-dialog";
import { SettingsCard } from "@/app/(dashboard)/dashboard/forwarder/einstellungen/components/settings-card";
import { DatePicker } from "@/components/ui/date-picker";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { cn } from "@/lib/utils";

interface QuoteFormProps {
  inquiryId: string;
  inquiryReference?: string;
}

export function QuoteForm({ inquiryId }: QuoteFormProps) {
  const router = useRouter();
  const trpcOptions = useTRPC();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    currency: "EUR",
    airlineFlight: "",
    transitTime: "",
    validUntil: "",
    notes: "",
    terms: "",
    preCarriage: "",
    mainCarriage: "",
    onCarriage: "",
    additionalCharges: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  const createQuotation = useMutation(
    trpcOptions.quotation.forwarder.createQuotation.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpcOptions.inquiry.forwarder.getMyInquiriesFast.queryFilter()
        );
        toast.info("Angebot erfolgreich eingereicht");
        router.push("/dashboard/forwarder/frachtanfragen?tab=quoted");
        setUpgradeDialogOpen(false);
      },
      onError: (error: unknown) => {
        if (
          error &&
          typeof error === "object" &&
          "data" in error &&
          (error as { data?: { code?: string } }).data?.code !== "FORBIDDEN"
        ) {
          if ("message" in error) {
            toast.error(
              `Fehler beim Erstellen: ${(error as { message?: string }).message}`
            );
          }
          setUpgradeDialogOpen(false);
        } else {
          setUpgradeDialogOpen(true);
        }
      },
    })
  );

  const calculatedTotal = roundToTwoDecimals(
    Number(formData.preCarriage || 0) +
      Number(formData.mainCarriage || 0) +
      Number(formData.onCarriage || 0) +
      Number(formData.additionalCharges || 0)
  );

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleMoneyInputChange = (field: string, value: string) => {
    handleInputChange(field, sanitizeMoneyInput(value));
  };

  /** Anzeige mit Komma (DE) für Geldbeträge */
  const formatMoneyDisplay = (val: string) => val?.replace(".", ",") ?? "";

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (calculatedTotal <= 0) {
      newErrors.preCarriage =
        "Mindestens ein Kostenpunkt muss einen Wert größer als 0 haben";
    }

    if (calculatedTotal > 1000000) {
      newErrors.totalPrice =
        "Gesamtpreis darf nicht mehr als 1.000.000 € betragen";
    }

    if (!formData.validUntil) {
      newErrors.validUntil = "Gültigkeitsdatum ist erforderlich";
    }

    if (formData.transitTime && Number(formData.transitTime) < 1) {
      newErrors.transitTime =
        "Transitzeit muss mindestens 1 Tag betragen";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPayload = () => ({
    inquiryId,
    totalPrice: calculatedTotal,
    currency: formData.currency,
    airlineFlight: formData.airlineFlight || undefined,
    transitTime: formData.transitTime
      ? Number(formData.transitTime)
      : undefined,
    validUntil: formData.validUntil ? new Date(formData.validUntil) : new Date(),
    notes: formData.notes || undefined,
    terms: formData.terms || undefined,
    preCarriage: roundToTwoDecimals(Number(formData.preCarriage || 0) || 0),
    mainCarriage: roundToTwoDecimals(Number(formData.mainCarriage || 0) || 0),
    onCarriage: roundToTwoDecimals(Number(formData.onCarriage || 0) || 0),
    additionalCharges: roundToTwoDecimals(
      Number(formData.additionalCharges || 0) || 0
    ),
  });

  const handleSubmit = () => {
    if (validateForm()) {
      createQuotation.mutate({
        ...getPayload(),
        validUntil: new Date(formData.validUntil),
      });
    }
  };

  const isLoading = createQuotation.isPending;

  const isQuotaError = createQuotation.error?.data?.code === "FORBIDDEN";
  const quotaErrorMessage = createQuotation.error?.message;

  const inputClass = "h-10 text-[13px]";
  const labelClass = "text-[12px] font-medium";
  const errorClass = "text-[11px] text-destructive mt-1";

  return (
    <>
      {isQuotaError && quotaErrorMessage && (
        <UpgradeDialog
          open={upgradeDialogOpen}
          onOpenChange={setUpgradeDialogOpen}
          title="Angebot erstellen"
          description={quotaErrorMessage}
        />
      )}

      <div className="space-y-6">
        {/* Kostenaufschlüsselung */}
        <SettingsCard
          title="Kostenaufschlüsselung"
          description={
            <span className="inline-flex items-center gap-1.5">
              Geben Sie die einzelnen Kostenpunkte ein. Mindestens ein Wert muss
              größer als 0 sein.
              <InfoTooltip
                content="Vorlauf (Pre-carriage): Transport zum Flughafen. Hauptlauf (Main carriage): Luftfracht. Nachlauf (On-carriage): Transport vom Zielflughafen. Zusatzkosten: z.B. Versicherung, Dokumente. Beträge in Euro mit Cent (z.B. 123,45)."
                ariaLabel="Erklärung der Kostenpositionen"
              />
            </span>
          }
          icon={Euro}
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  id: "preCarriage",
                  label: "Vorlauf (Pre-carriage)",
                },
                {
                  id: "mainCarriage",
                  label: "Hauptlauf (Main carriage)",
                },
                {
                  id: "onCarriage",
                  label: "Nachlauf (On-carriage)",
                },
                {
                  id: "additionalCharges",
                  label: "Zusatzkosten",
                },
              ].map(({ id, label }) => (
                <div key={id} className="space-y-1.5">
                  <Label htmlFor={id} className={labelClass}>
                    {label}
                  </Label>
                  <div className="relative">
                    <Input
                      id={id}
                      type="text"
                      inputMode="decimal"
                      value={formatMoneyDisplay(
                        String(formData[id as keyof typeof formData] ?? "")
                      )}
                      onChange={(e) =>
                        handleMoneyInputChange(id, e.target.value)
                      }
                      className={cn(inputClass, "pr-12")}
                      placeholder="0,00"
                      disabled={isLoading}
                      maxLength={10}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground">
                      {formData.currency}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {errors.preCarriage && (
              <p className={errorClass}>{errors.preCarriage}</p>
            )}

            <div className="border-t border-border pt-4">
              <p className="text-[12px] text-muted-foreground inline-flex items-center gap-1.5">
                Gesamtpreis
                <InfoTooltip
                  content="Wird automatisch aus allen Kostenpositionen berechnet. Cent-Beträge werden korrekt gerundet."
                  ariaLabel="Info Gesamtpreis"
                />
              </p>
              <p className="text-xl font-bold text-foreground">
                {calculatedTotal.toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                <span className="text-base font-medium text-muted-foreground">
                  {formData.currency}
                </span>
              </p>
              {errors.totalPrice && (
                <p className={errorClass}>{errors.totalPrice}</p>
              )}
            </div>
          </div>
        </SettingsCard>

        {/* Versanddetails */}
        <SettingsCard
          title="Versanddetails"
          description="Flug, Transitzeit und Gültigkeit des Angebots."
          icon={Truck}
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="airlineFlight" className={labelClass}>
                  Fluggesellschaft / Flugnummer
                  <span className="ml-1 font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="airlineFlight"
                  type="text"
                  value={formData.airlineFlight}
                  onChange={(e) =>
                    handleInputChange("airlineFlight", e.target.value)
                  }
                  className={inputClass}
                  placeholder="z.B. LH 123"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="transitTime" className={labelClass}>
                  <span className="inline-flex items-center gap-1.5">
                    Transitzeit (Tage)
                    <InfoTooltip
                      content="Geschätzte Lieferzeit in Tagen vom Abholort bis zum Ziel."
                      ariaLabel="Info Transitzeit"
                    />
                  </span>
                  <span className="ml-1 font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="transitTime"
                  type="text"
                  inputMode="numeric"
                  value={formData.transitTime}
                  onChange={(e) => {
                    handleInputChange(
                      "transitTime",
                      sanitizeIntegerInput(e.target.value, {
                        minValue: 1,
                        maxValue: 365,
                      })
                    );
                  }}
                  className={inputClass}
                  placeholder="z.B. 3"
                  disabled={isLoading}
                  maxLength={7}
                />
                {errors.transitTime && (
                  <p className={errorClass}>{errors.transitTime}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <span id="validUntil-label" className={labelClass}>
                  <span className="inline-flex items-center gap-1.5">
                    Gültig bis
                    <InfoTooltip
                      content="Bis zu diesem Datum gilt das Angebot. Danach muss der Kunde ggf. neu anfragen."
                      ariaLabel="Info Gültigkeitsdatum"
                    />
                  </span>
                  <span className="text-destructive"> *</span>
                </span>
                <DatePicker
                  id="validUntil"
                  aria-labelledby="validUntil-label"
                  value={formData.validUntil || undefined}
                  onChange={(d) =>
                    handleInputChange(
                      "validUntil",
                      d ? d.toISOString().split("T")[0] ?? "" : ""
                    )
                  }
                  placeholder="Datum wählen"
                  disabled={isLoading}
                  minDate={new Date()}
                />
                {errors.validUntil && (
                  <p className={errorClass}>{errors.validUntil}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="currency" className={labelClass}>
                  Währung
                </Label>
                <Input
                  id="currency"
                  type="text"
                  value={formData.currency}
                  onChange={(e) =>
                    handleInputChange("currency", e.target.value)
                  }
                  className={inputClass}
                  placeholder="EUR"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </SettingsCard>

        {/* Zusätzliche Informationen */}
        <SettingsCard
          title="Zusätzliche Informationen"
          description="Notizen und Geschäftsbedingungen für das Angebot."
          icon={FileText}
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="notes" className={labelClass}>
                Notizen
                <span className="ml-1 font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Zusätzliche Informationen oder Hinweise..."
                rows={4}
                className="resize-none text-[13px]"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="terms" className={labelClass}>
                Geschäftsbedingungen
                <span className="ml-1 font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="terms"
                value={formData.terms}
                onChange={(e) => handleInputChange("terms", e.target.value)}
                placeholder="Allgemeine Geschäftsbedingungen, Zahlungsbedingungen, etc."
                rows={4}
                className="resize-none text-[13px]"
                disabled={isLoading}
              />
            </div>
          </div>
        </SettingsCard>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full font-bold text-[11px] sm:w-auto"
          >
            {isLoading ? "Wird verarbeitet..." : "Angebot einreichen"}
          </Button>
        </div>
      </div>
    </>
  );
}
