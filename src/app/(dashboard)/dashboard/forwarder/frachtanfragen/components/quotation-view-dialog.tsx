"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { Badge } from "@/components/ui/badge";
import { DotLoading } from "@/components/ui/dot-loading";
import { Separator } from "@/components/ui/separator";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { formatGermanDate } from "@/lib/date-utils";

interface QuotationViewDialogProps {
  inquiryId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuotationViewDialog({ inquiryId, open, onOpenChange }: QuotationViewDialogProps) {
  const trpcOptions = useTRPC();
  const { data: quotations, isLoading } = useQuery({
    ...trpcOptions.quotation.forwarder.getInquiryQuotations.queryOptions({ inquiryId }),
    enabled: open,
  });

  if (!open) {
    return null;
  }

  if (isLoading) {
    return (
      <ResponsiveModal open={open} onOpenChange={onOpenChange} title="Angebot laden...">
        <div className="flex items-center justify-center py-8">
          <DotLoading size="lg"/>
        </div>
      </ResponsiveModal>
    );
  }

  if (!quotations || quotations.length === 0) {
    return (
      <ResponsiveModal open={open} onOpenChange={onOpenChange} title="Kein Angebot gefunden">
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">Kein Angebot für diese Anfrage gefunden.</p>
        </div>
      </ResponsiveModal>
    );
  }

  const quotation = quotations[quotations.length - 1]; // Get the latest quotation

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Angebot ${quotation.quotationNumber || ""}`}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Angebotsnummer</p>
            <p className="text-base font-semibold">{quotation.quotationNumber || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge variant={quotation.status === "submitted" ? "default" : "secondary"}>
              {quotation.status === "submitted" ? "Eingereicht" : quotation.status === "accepted" ? "Angenommen" : quotation.status === "rejected" ? "Abgelehnt" : quotation.status}
            </Badge>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Kostenaufstellung</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Vorlauf</span>
              <span className="text-sm font-medium">{new Intl.NumberFormat("de-DE", { style: "currency", currency: quotation.currency || "EUR" }).format(quotation.preCarriage)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Hauptlauf</span>
              <span className="text-sm font-medium">{new Intl.NumberFormat("de-DE", { style: "currency", currency: quotation.currency || "EUR" }).format(quotation.mainCarriage)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Nachlauf</span>
              <span className="text-sm font-medium">{new Intl.NumberFormat("de-DE", { style: "currency", currency: quotation.currency || "EUR" }).format(quotation.onCarriage)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Zusatzkosten</span>
              <span className="text-sm font-medium">{new Intl.NumberFormat("de-DE", { style: "currency", currency: quotation.currency || "EUR" }).format(quotation.additionalCharges)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-base font-semibold">Gesamtpreis</span>
              <span className="text-lg font-bold text-primary">{new Intl.NumberFormat("de-DE", { style: "currency", currency: quotation.currency || "EUR" }).format(quotation.totalPrice)}</span>
            </div>
          </div>
        </div>

        {(quotation.airlineFlight || quotation.transitTime) && (
          <>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quotation.airlineFlight && (
                <div>
                  <p className="text-sm text-muted-foreground">Flugnummer</p>
                  <p className="text-base font-medium">{quotation.airlineFlight}</p>
                </div>
              )}
              {quotation.transitTime && (
                <div>
                  <p className="text-sm text-muted-foreground">Transitzeit</p>
                  <p className="text-base font-medium">{quotation.transitTime} Tage</p>
                </div>
              )}
            </div>
          </>
        )}

        {quotation.validUntil && (
          <>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Gültig bis</p>
              <p className="text-base font-medium">
                {formatGermanDate(quotation.validUntil) || "—"}
              </p>
            </div>
          </>
        )}

        {quotation.notes && (
          <>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Notizen</p>
              <p className="text-sm whitespace-pre-wrap">{quotation.notes}</p>
            </div>
          </>
        )}

        {quotation.terms && (
          <>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Bedingungen</p>
              <p className="text-sm whitespace-pre-wrap">{quotation.terms}</p>
            </div>
          </>
        )}

        {quotation.submittedAt && (
          <>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Eingereicht am</p>
              <p className="text-sm font-medium">
                {formatGermanDate(quotation.submittedAt) || "—"}
              </p>
            </div>
          </>
        )}
      </div>
    </ResponsiveModal>
  );
}

