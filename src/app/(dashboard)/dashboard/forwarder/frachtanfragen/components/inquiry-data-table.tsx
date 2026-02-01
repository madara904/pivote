"use client"

import * as React from "react"
import { useState } from "react"
import {
  useReactTable,
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Euro, Clock, CheckCircle2, XCircle, Eye, FileText, X, Edit, Trash2 } from "lucide-react"
import { ServiceIcon } from "@/components/ui/service-icon"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { QuotationViewDialog } from "./quotation-view-dialog"
import { EditQuotationDialog } from "./edit-quotation-dialog"

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?"

const getServiceLabel = (serviceType: string) => {
  if (serviceType === "air_freight") return "Luftfracht";
  if (serviceType === "sea_freight") return "Seefracht";
  if (serviceType === "road_freight") return "Straßenfracht";
  return serviceType;
}

const getDirectionLabel = (direction?: string) => {
  if (direction === "import") return "Import";
  if (direction === "export") return "Export";
  return direction || "—";
}

export type FreightInquiry = {
  id: string
  referenceNumber: string
  status: string
  quotationStatus?: string | null
  quotationId?: string | null
  responseStatus?: string | null
  sentAt?: Date
  responseDate?: Date
  quotedPrice?: number
  currency?: string
  serviceType: string
  serviceDirection: string
  cargoType: string
  cargoDescription?: string | null
  weight: string | number
  unit?: string
  pieces?: number
  shipperName: string
  origin: { code: string; country: string }
  destination: { code: string; country: string }
}

interface InquiryDataTableProps<TData extends FreightInquiry> {
  data: TData[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ReadonlyArray<ColumnDef<TData, any>>
  className?: string
}

function RejectInquiryButton({ inquiryId }: { inquiryId: string }) {
  const utils = trpc.useUtils();
  const rejectInquiry = trpc.inquiry.forwarder.rejectInquiry.useMutation({
    onSuccess: () => {
      toast.info("Anfrage erfolgreich abgelehnt");
      utils.inquiry.forwarder.getMyInquiriesFast.invalidate();
    },
    onError: (error) => {
      toast.error(`Fehler beim Ablehnen: ${error.message}`);
    }
  });

  const handleReject = () => {
    rejectInquiry.mutate({ inquiryId });
  };

  return (
    <ConfirmationDialog
      title="Anfrage ablehnen"
      description="Möchten Sie diese Anfrage wirklich ablehnen? Diese Aktion kann nicht rückgängig gemacht werden."
      confirmText="Anfrage ablehnen"
      cancelText="Abbrechen"
      variant="destructive"
      onConfirm={handleReject}
      loading={rejectInquiry.isPending}
      loadingText="Wird abgelehnt..."
      disabled={rejectInquiry.isPending}
    >
      <Button
        size="sm"
        variant="outline"
        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
        disabled={rejectInquiry.isPending}
      >
        <X className="h-4 w-4 mr-2 shrink-0" />
        <span className="truncate">Anfrage ablehnen</span>
      </Button>
    </ConfirmationDialog>
  );
}

function DeleteQuotationButton({ quotationId }: { quotationId: string }) {
  const utils = trpc.useUtils();
  const deleteQuotation = trpc.quotation.forwarder.deleteQuotation.useMutation({
    onSuccess: () => {
      toast.success("Angebot erfolgreich gelöscht");
      utils.inquiry.forwarder.getMyInquiriesFast.invalidate();
    },
    onError: (error) => {
      toast.error(`Fehler beim Löschen: ${error.message}`);
    }
  });

  return (
    <ConfirmationDialog
      title="Angebot löschen"
      description="Möchten Sie dieses Angebot wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
      confirmText="Angebot löschen"
      cancelText="Abbrechen"
      variant="destructive"
      onConfirm={() => deleteQuotation.mutate({ quotationId })}
      loading={deleteQuotation.isPending}
      loadingText="Wird gelöscht..."
      disabled={deleteQuotation.isPending}
    >
      <Button
        size="sm"
        variant="outline"
        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
        disabled={deleteQuotation.isPending}
      >
        <Trash2 className="h-4 w-4 mr-2 shrink-0" />
        <span className="truncate">Angebot löschen</span>
      </Button>
    </ConfirmationDialog>
  );
}

export function InquiryDataTable<TData extends FreightInquiry>({
  data,
  columns,
  className,
}: InquiryDataTableProps<TData>) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [selectedQuotationInquiryId, setSelectedQuotationInquiryId] = useState<string | null>(null);
  const [selectedEditQuotationId, setSelectedEditQuotationId] = useState<{ quotationId: string; inquiryId: string } | null>(null);

  // Helper to build href with preserved tab parameter
  const buildHref = (path: string) => {
    if (tabParam) {
      return `${path}?tab=${tabParam}`;
    }
    return path;
  };

  const table = useReactTable<TData>({
    data,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: [...columns] as ColumnDef<TData, any>[],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  })

  return (
    <div className={className}>
      <div className="space-y-4">
        {table.getRowModel().rows.length === 0 ? null : (
          table.getRowModel().rows.map(row => {
            const r = row.original
            const isArchived =
              r.status === "expired" ||
              r.status === "cancelled" ||
              r.status === "closed" ||
              r.status === "rejected" ||
              r.responseStatus === "rejected"
            const isWon = r.quotationStatus === "accepted"
            const isLost = r.quotationStatus === "rejected"
            const canOffer =
              r.status === "open" &&
              r.responseStatus !== "quoted" &&
              r.responseStatus !== "rejected"
            const canViewQuotation =
              r.responseStatus === "quoted" || isWon
            const canEditQuotation =
              r.quotationStatus === "submitted" || r.quotationStatus === "withdrawn"
            return (
              <Card key={row.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col xl:flex-row gap-6">
                    <div className="w-full xl:w-48 flex-shrink-0">
                      <div className="h-28 w-full flex items-center justify-center">
                        <div className="flex flex-col items-center gap-1 text-center">
                          <div className="text-xs text-muted-foreground uppercase tracking-wide">Route</div>
                          <div className="text-base font-semibold text-foreground">
                            {r.origin.code} → {r.destination.code}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {r.origin.country} → {r.destination.country}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground break-words">{r.referenceNumber}</h3>
                        <Badge variant="outline" className="text-xs font-medium flex items-center gap-1">
                          <ServiceIcon serviceType={r.serviceType} className="h-3.5 w-3.5" />
                          <span>{getServiceLabel(r.serviceType)}</span>
                          <span className="text-muted-foreground">•</span>
                          <span>{getDirectionLabel(r.serviceDirection)}</span>
                        </Badge>
                        {r.quotationStatus === "accepted" ? (
                          <Badge variant="default" className="gap-1 shrink-0 bg-green-600 hover:bg-green-700 text-white">
                            <CheckCircle2 className="h-3 w-3" />
                            <span className="hidden sm:inline">Gewonnen</span>
                            <span className="sm:hidden">Gew.</span>
                          </Badge>
                        ) : (r.status === "expired" || r.status === "cancelled" || r.status === "closed") ? (
                          <Badge variant="destructive" className="gap-1 shrink-0">
                            <XCircle className="h-3 w-3" />
                            <span className="hidden sm:inline">{r.status === "expired" ? "Abgelaufen" : r.status === "cancelled" ? "Abgebrochen" : "Geschlossen"}</span>
                            <span className="sm:hidden">{r.status === "expired" ? "Abg." : r.status === "cancelled" ? "Abb." : "Geschl."}</span>
                          </Badge>
                        ) : r.responseStatus === "quoted" ? (
                          <Badge variant="default" className="gap-1 shrink-0">
                            <CheckCircle2 className="h-3 w-3" />
                            <span className="hidden sm:inline">Angebot abgegeben</span>
                            <span className="sm:hidden">Abgegeben</span>
                          </Badge>
                        ) : r.responseStatus === "rejected" ? (
                          <Badge variant="outline" className="gap-1 text-muted-foreground shrink-0">
                            <XCircle className="h-3 w-3" />
                            Abgelehnt
                          </Badge>
                        ) : r.status === "open" ? (
                          <Badge variant="secondary" className="gap-1 shrink-0">
                            <CheckCircle2 className="h-3 w-3" />
                            Offen
                          </Badge>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                          {getInitials(r.shipperName)}
                        </div>
                        <span className="font-medium text-foreground">{r.shipperName}</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <div className="text-xs text-muted-foreground">Fracht</div>
                          <div className="font-semibold">{r.weight} {r.unit || "kg"}</div>
                          <div className="text-xs text-muted-foreground">{r.pieces || 1} PKG</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Service</div>
                          <div className="font-semibold">
                            {r.serviceType === "air_freight" ? "Luftfracht" : r.serviceType === "sea_freight" ? "Seefracht" : r.serviceType}
                          </div>
                          <div className="text-xs text-muted-foreground">{r.serviceDirection === "import" ? "Import" : "Export"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Ware</div>
                          <div className="font-semibold">{r.cargoType === "general" ? "Allgemein" : r.cargoType}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">{r.cargoDescription || "Keine Beschreibung"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Timeline</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Gesendet {r.sentAt ? new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(r.sentAt) : "—"}</span>
                          </div>
                          {r.responseDate && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              Antwort {new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(r.responseDate)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-full xl:w-64 flex flex-col gap-3">
                      {r.quotedPrice && (r.responseStatus === "quoted" || r.quotationStatus === "accepted" || r.status === "expired") && (
                        <div className="flex items-center gap-1 text-base sm:text-lg font-bold text-primary">
                          <Euro className="h-4 w-4 shrink-0" />
                          <span className="whitespace-nowrap">{new Intl.NumberFormat("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(r.quotedPrice)} {r.currency || "EUR"}</span>
                        </div>
                      )}

                      <div className="space-y-2">
                        {!isArchived && canOffer && (
                          <>
                            <Link prefetch href={buildHref(`/dashboard/forwarder/frachtanfragen/${r.id}/angebot`)} className="block">
                              <Button size="sm" className="w-full">
                                <FileText className="h-4 w-4 mr-2 shrink-0" />
                                <span className="truncate">Angebot abgeben</span>
                              </Button>
                            </Link>
                            <Link prefetch href={buildHref(`/dashboard/forwarder/frachtanfragen/${r.id}`)} className="block">
                              <Button size="sm" className="w-full" variant="outline">
                                <Eye className="h-4 w-4 mr-2 shrink-0" />
                                <span className="truncate">Anfrage anzeigen</span>
                              </Button>
                            </Link>
                            <RejectInquiryButton inquiryId={r.id} />
                          </>
                        )}

                        {!isArchived && !canOffer && canViewQuotation && (
                          <>
                            <Button
                              size="sm"
                              className="w-full"
                              variant="default"
                              onClick={() => setSelectedQuotationInquiryId(r.id)}
                            >
                              <FileText className="h-4 w-4 mr-2 shrink-0" />
                              <span className="truncate">Angebot anzeigen</span>
                            </Button>
                            <Link prefetch href={buildHref(`/dashboard/forwarder/frachtanfragen/${r.id}`)} className="block">
                              <Button size="sm" className="w-full" variant="outline">
                                <Eye className="h-4 w-4 mr-2 shrink-0" />
                                <span className="truncate">Anfrage anzeigen</span>
                              </Button>
                            </Link>
                            {canEditQuotation && (
                              <>
                                <Button
                                  size="sm"
                                  className="w-full"
                                  variant="outline"
                                  onClick={() => r.quotationId && setSelectedEditQuotationId({ quotationId: r.quotationId, inquiryId: r.id })}
                                >
                                  <Edit className="h-4 w-4 mr-2 shrink-0" />
                                  <span className="truncate">Angebot korrigieren</span>
                                </Button>
                                {r.quotationId && (
                                  <DeleteQuotationButton quotationId={r.quotationId} />
                                )}
                              </>
                            )}
                          </>
                        )}

                        {isArchived && (
                          <>
                            <Link prefetch href={buildHref(`/dashboard/forwarder/frachtanfragen/${r.id}`)} className="block">
                              <Button size="sm" className="w-full">
                                <Eye className="h-4 w-4 mr-2 shrink-0" />
                                <span className="truncate">Anfrage anzeigen</span>
                              </Button>
                            </Link>
                            {canViewQuotation && (
                              <Button
                                size="sm"
                                className="w-full"
                                variant="outline"
                                onClick={() => setSelectedQuotationInquiryId(r.id)}
                              >
                                <FileText className="h-4 w-4 mr-2 shrink-0" />
                                <span className="truncate">Angebot anzeigen</span>
                              </Button>
                            )}
                          </>
                        )}

                        {isLost && !isArchived && (
                          <>
                            <Link prefetch href={buildHref(`/dashboard/forwarder/frachtanfragen/${r.id}`)} className="block">
                              <Button size="sm" className="w-full">
                                <Eye className="h-4 w-4 mr-2 shrink-0" />
                                <span className="truncate">Anfrage anzeigen</span>
                              </Button>
                            </Link>
                            {canViewQuotation && (
                              <Button
                                size="sm"
                                className="w-full"
                                variant="outline"
                                onClick={() => setSelectedQuotationInquiryId(r.id)}
                              >
                                <FileText className="h-4 w-4 mr-2 shrink-0" />
                                <span className="truncate">Angebot anzeigen</span>
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
      {selectedQuotationInquiryId && (
        <QuotationViewDialog
          inquiryId={selectedQuotationInquiryId}
          open={!!selectedQuotationInquiryId}
          onOpenChange={(open) => !open && setSelectedQuotationInquiryId(null)}
        />
      )}
      {selectedEditQuotationId && (
        <EditQuotationDialog
          quotationId={selectedEditQuotationId.quotationId}
          inquiryId={selectedEditQuotationId.inquiryId}
          open={!!selectedEditQuotationId}
          onOpenChange={(open) => !open && setSelectedEditQuotationId(null)}
        />
      )}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-2 py-3">
        <div className="text-xs text-muted-foreground order-2 sm:order-1">
          Seite {table.getState().pagination.pageIndex + 1} von {table.getPageCount() || 1}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-initial" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Zurück</Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-initial" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Weiter</Button>
        </div>
      </div>
    </div>
  )
}

