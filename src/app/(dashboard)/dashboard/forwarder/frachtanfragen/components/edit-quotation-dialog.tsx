"use client";

import { useState, useEffect } from "react";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "lucide-react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { sanitizeMoneyInput, sanitizeIntegerInput } from "@/lib/form-sanitization";
import { DotLoading } from "@/components/ui/dot-loading";

interface EditQuotationDialogProps {
  quotationId: string;
  inquiryId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditQuotationDialog({ quotationId, inquiryId, open, onOpenChange }: EditQuotationDialogProps) {
  const utils = trpc.useUtils();
  const [formData, setFormData] = useState({
    totalPrice: 0,
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

  const { data: quotationData, isLoading: isLoadingQuotation } = trpc.quotation.forwarder.getQuotation.useQuery(
    { quotationId },
    { enabled: open && !!quotationId }
  );

  // Load quotation data into form when it's available
  useEffect(() => {
    if (quotationData) {
      const validUntilDate = quotationData.validUntil 
        ? new Date(quotationData.validUntil).toISOString().split('T')[0]
        : "";
      
      setFormData({
        totalPrice: quotationData.totalPrice || 0,
        currency: quotationData.currency || "EUR",
        airlineFlight: quotationData.airlineFlight || "",
        transitTime: quotationData.transitTime ? String(quotationData.transitTime) : "",
        validUntil: validUntilDate,
        notes: quotationData.notes || "",
        terms: quotationData.terms || "",
        preCarriage: quotationData.preCarriage ? String(quotationData.preCarriage) : "",
        mainCarriage: quotationData.mainCarriage ? String(quotationData.mainCarriage) : "",
        onCarriage: quotationData.onCarriage ? String(quotationData.onCarriage) : "",
        additionalCharges: quotationData.additionalCharges ? String(quotationData.additionalCharges) : "",
      });
    }
  }, [quotationData]);

  const correctQuotation = trpc.quotation.forwarder.correctQuotation.useMutation({
    onSuccess: () => {
      utils.inquiry.forwarder.getMyInquiriesFast.invalidate();
      utils.quotation.forwarder.getInquiryQuotations.invalidate({ inquiryId });
      toast.success("Angebot erfolgreich korrigiert");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Fehler beim Korrigieren: ${error.message}`);
    }
  });

  // Calculate total price from cost breakdown
  const calculatedTotal =
    Number(formData.preCarriage || 0) +
    Number(formData.mainCarriage || 0) +
    Number(formData.onCarriage || 0) +
    Number(formData.additionalCharges || 0);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleMoneyInputChange = (field: string, value: string) => {
    const sanitized = sanitizeMoneyInput(value);
    handleInputChange(field, sanitized);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (calculatedTotal <= 0) {
      newErrors.preCarriage = "Mindestens ein Kostenpunkt muss einen Wert größer als 0 haben";
    }

    if (calculatedTotal > 1000000) {
      newErrors.totalPrice = "Gesamtpreis darf nicht mehr als 1.000.000 € betragen";
    }

    if (!formData.validUntil) {
      newErrors.validUntil = "Gültigkeitsdatum ist erforderlich";
    }

    if (formData.transitTime && Number(formData.transitTime) < 1) {
      newErrors.transitTime = "Transitzeit muss mindestens 1 Tag betragen";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      correctQuotation.mutate({
        quotationId,
        inquiryId,
        totalPrice: calculatedTotal,
        currency: formData.currency,
        airlineFlight: formData.airlineFlight || undefined,
        transitTime: formData.transitTime ? Number(formData.transitTime) : undefined,
        validUntil: new Date(formData.validUntil),
        notes: formData.notes || undefined,
        terms: formData.terms || undefined,
        preCarriage: Number(formData.preCarriage || 0) || 0,
        mainCarriage: Number(formData.mainCarriage || 0) || 0,
        onCarriage: Number(formData.onCarriage || 0) || 0,
        additionalCharges: Number(formData.additionalCharges || 0) || 0,
      });
    }
  };

  const isLoading = correctQuotation.isPending || isLoadingQuotation;

  if (!open) {
    return null;
  }

  if (isLoadingQuotation) {
    return (
      <ResponsiveModal open={open} onOpenChange={onOpenChange} title="Angebot korrigieren">
        <div className="flex items-center justify-center py-8">
          <DotLoading size="lg" />
        </div>
      </ResponsiveModal>
    );
  }

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} title="Angebot korrigieren">
      <div className="space-y-6">
        {/* Cost Breakdown */}
        <Card className="p-4 sm:p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Kostenaufschlüsselung</h2>
              <p className="text-sm text-muted-foreground">
                Geben Sie die einzelnen Kostenpunkte ein. Mindestens ein Wert muss größer als 0 sein.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Pre-carriage */}
              <div className="space-y-2">
                <Label htmlFor="preCarriage" className="text-sm font-medium">
                  Vorlauf (Pre-carriage)
                </Label>
                <div className="relative">
                  <Input
                    id="preCarriage"
                    type="text"
                    inputMode="decimal"
                    value={formData.preCarriage}
                    onChange={(e) => handleMoneyInputChange("preCarriage", e.target.value)}
                    className="pr-12"
                    placeholder="0.00"
                    disabled={isLoading}
                    maxLength={10}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {formData.currency}
                  </span>
                </div>
              </div>

              {/* Main carriage */}
              <div className="space-y-2">
                <Label htmlFor="mainCarriage" className="text-sm font-medium">
                  Hauptlauf (Main carriage)
                </Label>
                <div className="relative">
                  <Input
                    id="mainCarriage"
                    type="text"
                    inputMode="decimal"
                    value={formData.mainCarriage}
                    onChange={(e) => handleMoneyInputChange("mainCarriage", e.target.value)}
                    className="pr-12"
                    placeholder="0.00"
                    disabled={isLoading}
                    maxLength={10}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {formData.currency}
                  </span>
                </div>
              </div>

              {/* On-carriage */}
              <div className="space-y-2">
                <Label htmlFor="onCarriage" className="text-sm font-medium">
                  Nachlauf (On-carriage)
                </Label>
                <div className="relative">
                  <Input
                    id="onCarriage"
                    type="text"
                    inputMode="decimal"
                    value={formData.onCarriage}
                    onChange={(e) => handleMoneyInputChange("onCarriage", e.target.value)}
                    className="pr-12"
                    placeholder="0.00"
                    disabled={isLoading}
                    maxLength={10}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {formData.currency}
                  </span>
                </div>
              </div>

              {/* Additional charges */}
              <div className="space-y-2">
                <Label htmlFor="additionalCharges" className="text-sm font-medium">
                  Zusatzkosten
                </Label>
                <div className="relative">
                  <Input
                    id="additionalCharges"
                    type="text"
                    inputMode="decimal"
                    value={formData.additionalCharges}
                    onChange={(e) => handleMoneyInputChange("additionalCharges", e.target.value)}
                    className="pr-12"
                    placeholder="0.00"
                    disabled={isLoading}
                    maxLength={10}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {formData.currency}
                  </span>
                </div>
              </div>
            </div>

            {errors.preCarriage && <p className="text-sm text-red-600">{errors.preCarriage}</p>}

            {/* Total Price Display */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">Gesamtpreis</p>
                  <p className="text-2xl sm:text-3xl font-semibold break-words">
                    {calculatedTotal.toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    <span className="text-lg sm:text-xl text-muted-foreground">{formData.currency}</span>
                  </p>
                </div>
              </div>
              {errors.totalPrice && <p className="mt-2 text-sm text-red-600">{errors.totalPrice}</p>}
            </div>
          </div>
        </Card>

        {/* Shipment Details */}
        <Card className="p-4 sm:p-6">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Versanddetails</h2>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Airline/Flight */}
              <div className="space-y-2">
                <Label htmlFor="airlineFlight" className="text-sm font-medium">
                  Fluggesellschaft / Flugnummer
                  <span className="ml-1 text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="airlineFlight"
                  type="text"
                  value={formData.airlineFlight}
                  onChange={(e) => handleInputChange("airlineFlight", e.target.value)}
                  placeholder="z.B. LH 123"
                  disabled={isLoading}
                />
              </div>

              {/* Transit Time */}
              <div className="space-y-2">
                <Label htmlFor="transitTime" className="text-sm font-medium">
                  Transitzeit (Tage)
                  <span className="ml-1 text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="transitTime"
                  type="text"
                  inputMode="numeric"
                  value={formData.transitTime}
                  onChange={(e) => {
                    const sanitized = sanitizeIntegerInput(e.target.value, { minValue: 1, maxValue: 365 });
                    handleInputChange("transitTime", sanitized);
                  }}
                  placeholder="z.B. 3"
                  disabled={isLoading}
                  maxLength={7}
                />
                {errors.transitTime && <p className="text-sm text-red-600">{errors.transitTime}</p>}
              </div>

              {/* Valid Until */}
              <div className="space-y-2">
                <Label htmlFor="validUntil" className="text-sm font-medium">
                  Gültig bis
                  <span className="ml-1 text-red-600">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => handleInputChange("validUntil", e.target.value)}
                    className="pr-10"
                    disabled={isLoading}
                  />
                  <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
                {errors.validUntil && <p className="text-sm text-red-600">{errors.validUntil}</p>}
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm font-medium">
                  Währung
                </Label>
                <Input
                  id="currency"
                  type="text"
                  value={formData.currency}
                  onChange={(e) => handleInputChange("currency", e.target.value)}
                  placeholder="EUR"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Additional Information */}
        <Card className="p-4 sm:p-6">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Zusätzliche Informationen</h2>

            <div className="space-y-6">
              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notizen
                  <span className="ml-1 text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Zusätzliche Informationen oder Hinweise..."
                  rows={4}
                  className="resize-none"
                  disabled={isLoading}
                />
              </div>

              {/* Terms */}
              <div className="space-y-2">
                <Label htmlFor="terms" className="text-sm font-medium">
                  Geschäftsbedingungen
                  <span className="ml-1 text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => handleInputChange("terms", e.target.value)}
                  placeholder="Allgemeine Geschäftsbedingungen, Zahlungsbedingungen, etc..."
                  rows={4}
                  className="resize-none"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 border-t pt-6">
          <Button
            variant="outline"
            size="lg"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <span className="truncate">Abbrechen</span>
          </Button>
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <span className="truncate">{isLoading ? "Wird verarbeitet..." : "Korrektur einreichen"}</span>
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
}

