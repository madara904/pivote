"use client"

import * as React from "react"
import { useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  type ColumnDef,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  FileText, 
  X, 
  Edit, 
  Trash2, 
  FolderOpen,
  ArrowRight,
  Package,
  Calendar
} from "lucide-react"
import { ServiceIcon } from "@/components/ui/service-icon"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { QuotationViewDialog } from "./quotation-view-dialog"
import { EditQuotationDialog } from "./edit-quotation-dialog"
import { DocumentsNotesDialog } from "./documents-notes-dialog"
import { cn } from "@/lib/utils"
import { formatGermanDate } from "@/lib/date-utils"

// Types (identisch behalten für Type-Safety)
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
  documentCount?: number
  noteCount?: number
  totalVolume?: string | number
  validityDate?: Date | string | null
  hasDangerousGoods?: boolean
}

interface InquiryDataTableProps<TData extends FreightInquiry> {
  data: TData[]
  columns: ReadonlyArray<ColumnDef<TData, any>>
  className?: string
}

// --- Action Buttons (Refactored & Cleaned) ---

function RejectInquiryButton({ inquiryId }: { inquiryId: string }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const rejectInquiry = useMutation(trpc.inquiry.forwarder.rejectInquiry.mutationOptions({
    onSuccess: async () => {
      toast.info("Anfrage abgelehnt");
      await queryClient.invalidateQueries(trpc.inquiry.forwarder.getMyInquiriesFast.queryFilter());
    },
    onError: (error: any) => toast.error(error?.message || "Fehler beim Ablehnen"),
  }));

  return (
    <ConfirmationDialog
      title="Ablehnen?"
      description="Möchten Sie diese Anfrage wirklich ablehnen?"
      confirmText="Ja, ablehnen"
      variant="destructive"
      onConfirm={() => rejectInquiry.mutate({ inquiryId })}
    >
      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
        <X className="h-4 w-4" />
      </Button>
    </ConfirmationDialog>
  );
}

function DeleteQuotationButton({ quotationId }: { quotationId: string }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const deleteQuotation = useMutation(trpc.quotation.forwarder.deleteQuotation.mutationOptions({
    onSuccess: async () => {
      toast.success("Angebot gelöscht");
      await queryClient.invalidateQueries(trpc.inquiry.forwarder.getMyInquiriesFast.queryFilter());
    },
    onError: (error: any) => toast.error(error?.message || "Fehler beim Löschen"),
  }));

  return (
    <ConfirmationDialog
      title="Angebot löschen?"
      description="Diese Aktion kann nicht rückgängig gemacht werden."
      confirmText="Löschen"
      variant="destructive"
      onConfirm={() => deleteQuotation.mutate({ quotationId })}
    >
      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
    </ConfirmationDialog>
  );
}

// --- Main Component ---

export function InquiryDataTable<TData extends FreightInquiry>({
  data,
  columns,
  className,
}: InquiryDataTableProps<TData>) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  
  // Dialog States
  const [selectedQuotationInquiryId, setSelectedQuotationInquiryId] = useState<string | null>(null);
  const [selectedEditQuotationId, setSelectedEditQuotationId] = useState<{ quotationId: string; inquiryId: string } | null>(null);
  const [selectedDocumentsNotesInquiryId, setSelectedDocumentsNotesInquiryId] = useState<string | null>(null);

  const table = useReactTable({
    data,
    columns: columns as ColumnDef<TData, any>[],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  })

  const buildHref = (path: string) => tabParam ? `${path}?tab=${tabParam}` : path;

  if (table.getRowModel().rows.length === 0) return null;

  return (
    <div className={className}>
      <div className="flex flex-col gap-4">
        {table.getRowModel().rows.map(row => {
          const r = row.original;
          
          // Status Logic
          const isWon = r.quotationStatus === "accepted";
          const isLost = r.quotationStatus === "rejected";
          const isQuoted = r.responseStatus === "quoted";
          const isForwarderRejected = r.responseStatus === "rejected";
          const isExpired = r.status === "expired";
          const isCancelled = r.status === "cancelled";
          const isOpen = r.status === "open" && !isQuoted && !isLost && !isWon && !isForwarderRejected;
          
          // Permissions
          const canOffer = isOpen;
          const canViewQuotation = isQuoted || isWon || isLost;
          const canEditQuotation = r.quotationStatus === "submitted";

          return (
            <Card key={row.id} className="group relative overflow-hidden border-slate-200 transition-all hover:shadow-md hover:border-primary/20 bg-white">
              
              {/* Status Stripe (Left Border Color) */}
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1",
                isWon ? "bg-emerald-500" :
                isLost || isExpired || isCancelled ? "bg-slate-300" :
                isQuoted ? "bg-blue-500" : "bg-primary"
              )} />

              <div className="flex flex-col lg:flex-row p-5 gap-6 items-start lg:items-center">
                
                {/* 1. Mini Route Visual (Aligned with Detail Page) */}
                <div className="w-full lg:w-48 shrink-0 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-slate-900">{r.origin.code}</span>
                    <ServiceIcon serviceType={r.serviceType} className="h-3 w-3 text-slate-400" />
                    <span className="text-sm font-bold text-slate-900">{r.destination.code}</span>
                  </div>
                  <div className="w-full flex items-center gap-1 opacity-60 mb-2">
                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 via-primary/40 to-slate-200" />
                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 uppercase font-medium">
                    <span className="truncate max-w-[45%]">{r.origin.country}</span>
                    <span className="truncate max-w-[45%] text-right">{r.destination.country}</span>
                  </div>
                </div>

                {/* 2. Main Info Area */}
                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">{r.referenceNumber}</span>
                      {isWon && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50 text-[10px] px-1.5 py-0">Gewonnen</Badge>}
                      {isLost && <Badge variant="outline" className="text-slate-500 text-[10px] px-1.5 py-0">Abgelehnt</Badge>}
                      {isQuoted && !isWon && !isLost && <Badge className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50 text-[10px] px-1.5 py-0">Angeboten</Badge>}
                      {isExpired && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Abgelaufen</Badge>}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 truncate">{r.shipperName}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" /> {r.pieces} colli
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="font-medium text-slate-700">{r.weight} {r.unit}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>{r.cargoType}</span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center md:items-end gap-1">
                     {/* Validity or Date Info */}
                     <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        <span>Eingang: {r.sentAt ? formatGermanDate(r.sentAt) : "—"}</span>
                     </div>
                     {r.validityDate && (
                       <div className="flex items-center gap-2 text-xs font-medium text-amber-600">
                          <Clock className="h-3 w-3" />
                          <span>Gültig bis: {formatGermanDate(r.validityDate)}</span>
                       </div>
                     )}
                     
                     {/* Price Display if Quoted */}
                     {r.quotedPrice && (isQuoted || isWon || isLost) && (
                        <div className="mt-1 text-sm font-bold text-primary">
                          {new Intl.NumberFormat("de-DE", { style: "currency", currency: r.currency || "EUR" }).format(r.quotedPrice)}
                        </div>
                     )}
                  </div>
                </div>

                {/* 3. Actions Area (Clean Icons & Buttons) */}
                <div className="flex items-center gap-2 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 w-full lg:w-auto justify-end">
                  
                  {/* Dokumente Button (Nur wenn relevant) */}
                  {((r.documentCount || 0) > 0 || (r.noteCount || 0) > 0) && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setSelectedDocumentsNotesInquiryId(r.id)}
                      className={cn("h-8 w-8", (r.documentCount || 0) > 0 ? "text-primary bg-primary/5" : "text-slate-400")}
                      title="Dokumente & Notizen"
                    >
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                  )}

 
                  {canOffer && (
                    <>
                      <RejectInquiryButton inquiryId={r.id} />
                      <Link prefetch href={buildHref(`/dashboard/forwarder/frachtanfragen/${r.id}/angebot`)}>
                        <Button size="sm" className="h-8 text-xs font-semibold shadow-sm">
                          Angebot erstellen
                        </Button>
                      </Link>
                    </>
                  )}

                  {canViewQuotation && (
                    <>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedQuotationInquiryId(r.id)} title="Angebot ansehen">
                        <FileText className="h-4 w-4 text-slate-500" />
                      </Button>
                      {canEditQuotation && (
                         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => r.quotationId && setSelectedEditQuotationId({ quotationId: r.quotationId, inquiryId: r.id })} title="Angebot korrigieren">
                          <Edit className="h-4 w-4 text-slate-500" />
                        </Button>
                      )}
                    </>
                  )}

                  <Link prefetch href={buildHref(`/dashboard/forwarder/frachtanfragen/${r.id}`)}>
                    <Button variant="outline" size="sm" className="h-8 gap-2 text-xs border-slate-200">
                      Details <ArrowRight className="h-3 w-3 opacity-50" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

 
      <div className="flex items-center justify-between py-4">
        <div className="text-xs text-muted-foreground">
          Seite {table.getState().pagination.pageIndex + 1} von {table.getPageCount() || 1}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="h-8 text-xs">Zurück</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="h-8 text-xs">Weiter</Button>
        </div>
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
      {selectedDocumentsNotesInquiryId && (
        <DocumentsNotesDialog
          inquiryId={selectedDocumentsNotesInquiryId}
          open={!!selectedDocumentsNotesInquiryId}
          onOpenChange={(open) => !open && setSelectedDocumentsNotesInquiryId(null)}
          documentCount={data.find(r => r.id === selectedDocumentsNotesInquiryId)?.documentCount}
          noteCount={data.find(r => r.id === selectedDocumentsNotesInquiryId)?.noteCount}
        />
      )}
    </div>
  )
}