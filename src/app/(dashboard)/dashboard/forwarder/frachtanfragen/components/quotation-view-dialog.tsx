"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
        <div className="space-y-4 py-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
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
        {/* Header Info */}
        <div className="p-6 rounded-xl border border-slate-100 bg-slate-50/30 space-y-4">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Angebot</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between sm:block sm:space-y-1">
              <span className="text-xs font-medium text-slate-500">Angebotsnummer</span>
              <span className="text-xs font-bold text-slate-900 sm:block">{quotation.quotationNumber || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between sm:block sm:space-y-1">
              <span className="text-xs font-medium text-slate-500">Status</span>
              <Badge variant={quotation.status === "submitted" ? "default" : "secondary"} className="h-5 px-2 text-[10px]">
                {quotation.status === "submitted" ? "Eingereicht" : quotation.status === "accepted" ? "Angenommen" : quotation.status === "rejected" ? "Abgelehnt" : quotation.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="p-6 rounded-xl border border-slate-100 bg-slate-50/30 space-y-6">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Kostenaufstellung</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Vorlauf</span>
              <span className="text-xs font-bold text-slate-900">{new Intl.NumberFormat("de-DE", { style: "currency", currency: quotation.currency || "EUR" }).format(quotation.preCarriage)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Hauptlauf</span>
              <span className="text-xs font-bold text-slate-900">{new Intl.NumberFormat("de-DE", { style: "currency", currency: quotation.currency || "EUR" }).format(quotation.mainCarriage)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Nachlauf</span>
              <span className="text-xs font-bold text-slate-900">{new Intl.NumberFormat("de-DE", { style: "currency", currency: quotation.currency || "EUR" }).format(quotation.onCarriage)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Zusatzkosten</span>
              <span className="text-xs font-bold text-slate-900">{new Intl.NumberFormat("de-DE", { style: "currency", currency: quotation.currency || "EUR" }).format(quotation.additionalCharges)}</span>
            </div>
            <Separator className="bg-slate-100" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gesamtpreis</span>
              <span className="text-lg font-bold text-primary">{new Intl.NumberFormat("de-DE", { style: "currency", currency: quotation.currency || "EUR" }).format(quotation.totalPrice)}</span>
            </div>
          </div>
        </div>

        {(quotation.airlineFlight || quotation.transitTime) && (
          <div className="p-6 rounded-xl border border-slate-100 bg-slate-50/30 space-y-4">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Versanddetails</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quotation.airlineFlight && (
                <div className="flex items-center justify-between sm:block sm:space-y-1">
                  <span className="text-xs font-medium text-slate-500">Flugnummer</span>
                  <span className="text-xs font-bold text-slate-900 sm:block">{quotation.airlineFlight}</span>
                </div>
              )}
              {quotation.transitTime && (
                <div className="flex items-center justify-between sm:block sm:space-y-1">
                  <span className="text-xs font-medium text-slate-500">Transitzeit</span>
                  <span className="text-xs font-bold text-slate-900 sm:block">{quotation.transitTime} Tage</span>
                </div>
              )}
            </div>
          </div>
        )}

        {(quotation.validUntil || quotation.submittedAt) && (
          <div className="p-6 rounded-xl border border-slate-100 bg-slate-50/30 space-y-4">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status & Termine</h3>
            <div className="space-y-3">
              {quotation.validUntil && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Gültig bis</span>
                  <span className="text-xs font-bold text-primary">{formatGermanDate(quotation.validUntil) || "—"}</span>
                </div>
              )}
              {quotation.submittedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Eingereicht am</span>
                  <span className="text-xs font-bold text-slate-900">{formatGermanDate(quotation.submittedAt) || "—"}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {(quotation.notes || quotation.terms) && (
          <div className="p-6 rounded-xl border border-slate-100 bg-slate-50/30 space-y-6">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Zusätzliche Informationen</h3>
            <div className="space-y-4">
              {quotation.notes && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notizen</p>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{quotation.notes}</p>
                </div>
              )}
              {quotation.terms && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bedingungen</p>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{quotation.terms}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ResponsiveModal>
  );
}

