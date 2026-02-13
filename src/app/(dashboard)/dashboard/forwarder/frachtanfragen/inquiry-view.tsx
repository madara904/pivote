"use client";

import React, { useMemo, useState } from "react";
import { useQueryState, parseAsStringEnum } from "nuqs";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import {
  Search,
  Inbox,
  Send,
  Trophy,
  Plane,
  Ship,
  Truck,
  Train,
  ArrowRight,
  Box,
  CalendarDays,
  MoreVertical,
  FileText,
  XCircle,
  Clock,
  ExternalLink,
  Pencil,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Types
import type { FreightInquiry } from "./components/inquiry-data-table";
import { DocumentsNotesDialog } from "./components/documents-notes-dialog";
import { QuotationViewDialog } from "./components/quotation-view-dialog";
import { EditQuotationDialog } from "./components/edit-quotation-dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { toast } from "sonner";

const filterInquiries = (inquiries: FreightInquiry[], query: string) => {
  if (!query.trim()) return inquiries;
  const lowerQuery = query.toLowerCase().trim();
  return inquiries.filter(
    (item) =>
      item.referenceNumber.toLowerCase().includes(lowerQuery) ||
      item.shipperName.toLowerCase().includes(lowerQuery) ||
      item.origin.code.toLowerCase().includes(lowerQuery) ||
      item.destination.code.toLowerCase().includes(lowerQuery),
  );
};

const transformInquiries = (rawData: Array<any>): FreightInquiry[] =>
  (rawData || []).map((item) => ({
    id: item.inquiryId,
    referenceNumber: item.inquiry.referenceNumber,
    status: item.inquiry.status,
    quotationStatus: item.quotationStatus,
    quotationId: item.quotationId,
    responseStatus: item.responseStatus,
    sentAt: item.sentAt,
    responseDate: item.viewedAt || undefined,
    quotedPrice: item.quotationPrice ? Number(item.quotationPrice) : undefined,
    currency: item.quotationCurrency || "EUR",
    serviceType: item.inquiry.serviceType,
    serviceDirection: item.inquiry.serviceDirection,
    cargoType: item.inquiry.cargoType,
    cargoDescription: item.inquiry.cargoDescription,
    weight: item.inquiry.totalGrossWeight,
    unit: "kg",
    pieces: item.inquiry.totalPieces,
    shipperName: item.inquiry.shipperOrganization.name,
    origin: {
      code: item.inquiry.originCity,
      country: item.inquiry.originCountry,
    },
    destination: {
      code: item.inquiry.destinationCity,
      country: item.inquiry.destinationCountry,
    },
    documentCount: item.documentCount,
    noteCount: item.noteCount,
    totalVolume: item.inquiry.totalVolume,
    hasDangerousGoods: item.packageSummary.hasDangerousGoods,
    validityDate: item.inquiry.validityDate,
  }));

const categorizeInquiries = (rawData: Array<any>, searchQuery: string) => {
  const transformed = transformInquiries(rawData);
  const buckets = {
    open: [] as FreightInquiry[],
    quoted: [] as FreightInquiry[],
    won: [] as FreightInquiry[],
    archived: [] as FreightInquiry[],
  };

  transformed.forEach((inq) => {
    const isWon = inq.quotationStatus === "accepted";
    const isLost = inq.quotationStatus === "rejected";
    const isForwarderRejected = inq.responseStatus === "rejected";
    const isArchived = ["expired", "cancelled"].includes(inq.status);
    const isQuoted =
      inq.responseStatus === "quoted" &&
      !isWon &&
      !isLost &&
      !isForwarderRejected;

    if (isWon) buckets.won.push(inq);
    else if (isLost || isForwarderRejected) buckets.archived.push(inq);
    else if (isArchived) buckets.archived.push(inq);
    else if (isQuoted) buckets.quoted.push(inq);
    else buckets.open.push(inq);
  });

  return {
    categorized: {
      open: filterInquiries(buckets.open, searchQuery),
      quoted: filterInquiries(buckets.quoted, searchQuery),
      won: filterInquiries(buckets.won, searchQuery),
      archived: filterInquiries(buckets.archived, searchQuery),
    },
    metrics: {
      open: buckets.open.length,
      quoted: buckets.quoted.length,
      won: buckets.won.length,
      archived: buckets.archived.length,
    },
  };
};

export default function InquiryView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [selectedDocumentsNotesInquiryId, setSelectedDocumentsNotesInquiryId] =
    useState<string | null>(null);
  const [selectedQuotationInquiryId, setSelectedQuotationInquiryId] = useState<
    string | null
  >(null);
  const [selectedEditQuotationId, setSelectedEditQuotationId] = useState<{
    quotationId: string;
    inquiryId: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsStringEnum(["open", "quoted", "won", "archived"])
      .withDefault("open")
      .withOptions({ history: "push", shallow: false }),
  );

  const trpcOptions = useTRPC();
  const { data: rawData } = useSuspenseQuery({
    ...trpcOptions.inquiry.forwarder.getMyInquiriesFast.queryOptions(),
    staleTime: 1000 * 30,
  });

  const { categorized, metrics } = useMemo(
    () => categorizeInquiries(rawData || [], debouncedSearchQuery),
    [rawData, debouncedSearchQuery],
  );
  const currentData = categorized[activeTab as keyof typeof categorized] || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-6 overflow-x-auto pb-2 no-scrollbar">
            <TabButton
              active={activeTab === "open"}
              onClick={() => setActiveTab("open")}
              label="Neue Anfragen"
              count={metrics.open}
              icon={<Inbox className="w-3 h-3" />}
            />
            <TabButton
              active={activeTab === "quoted"}
              onClick={() => setActiveTab("quoted")}
              label="Aktuell"
              count={metrics.quoted}
              icon={<Send className="w-3 h-3" />}
            />
            <TabButton
              active={activeTab === "won"}
              onClick={() => setActiveTab("won")}
              label="Aufträge"
              count={metrics.won}
              icon={<Trophy className="w-3 h-3" />}
            />
            <TabButton
              active={activeTab === "archived"}
              onClick={() => setActiveTab("archived")}
              label="Archiv"
              count={metrics.archived}
              icon={<Box className="w-3 h-3" />}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              className="h-10 w-full md:w-[280px] pl-9 pr-3 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-all shadow-sm"
              placeholder="Referenz, Versender oder Route..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Separator className="opacity-50" />

      <div className="space-y-4">
        {currentData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Inbox className="w-10 h-10 mb-3 opacity-20" />
            <span className="text-xs uppercase tracking-[0.2em] font-bold">
              Keine Anfragen in dieser Kategorie
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {currentData.map((inquiry) => (
              <ListItem
                key={inquiry.id}
                inquiry={inquiry}
                tab={activeTab || "open"}
                onOpenDocumentsNotes={() =>
                  setSelectedDocumentsNotesInquiryId(inquiry.id)
                }
                onOpenQuotation={() => setSelectedQuotationInquiryId(inquiry.id)}
                onOpenEditQuotation={(quotationId) =>
                  setSelectedEditQuotationId({
                    quotationId,
                    inquiryId: inquiry.id,
                  })
                }
              />
            ))}
          </div>
        )}
      </div>

      {selectedDocumentsNotesInquiryId && (
        <DocumentsNotesDialog
          inquiryId={selectedDocumentsNotesInquiryId}
          open={!!selectedDocumentsNotesInquiryId}
          onOpenChange={(open) =>
            !open && setSelectedDocumentsNotesInquiryId(null)
          }
          documentCount={
            currentData.find((r) => r.id === selectedDocumentsNotesInquiryId)
              ?.documentCount
          }
          noteCount={
            currentData.find((r) => r.id === selectedDocumentsNotesInquiryId)
              ?.noteCount
          }
        />
      )}
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
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  icon: React.ReactNode;
}) {
  return (
    <Button
      onClick={onClick}
      variant={"outline"}
      className={cn(
        "flex items-center gap-2 pb-3 transition-all duration-200 whitespace-nowrap",
        active
          ? "border-primary text-slate-900"
          : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200",
      )}
    >
      <span className={active ? "text-primary" : ""}>{icon}</span>
      <span className="text-[10px] uppercase font-bold tracking-wider">
        {label}
      </span>
      {!!count && count > 0 && (
        <span
          className={cn(
            "text-[9px] px-1.5 py-0.5 rounded font-bold transition-colors",
            active ? "bg-primary text-white" : "bg-slate-100 text-slate-500",
          )}
        >
          {count}
        </span>
      )}
    </Button>
  );
}

function ListItem({
  inquiry,
  tab,
  onOpenDocumentsNotes,
  onOpenQuotation,
  onOpenEditQuotation,
}: {
  inquiry: FreightInquiry;
  tab: string;
  onOpenDocumentsNotes: () => void;
  onOpenQuotation: () => void;
  onOpenEditQuotation: (quotationId: string) => void;
}) {
  const Icon =
    inquiry.serviceType === "air_freight"
      ? Plane
      : inquiry.serviceType === "sea_freight"
        ? Ship
        : inquiry.serviceType === "rail_freight"
          ? Train
          : Truck;

  const isNew = !inquiry.responseDate && tab === "open";
  const isQuoted = inquiry.responseStatus === "quoted";
  const isLost = inquiry.quotationStatus === "rejected";
  const isForwarderRejected = inquiry.responseStatus === "rejected";
  const isLostInArchive = tab === "archived" && isLost;
  const isRejectedInArchive = tab === "archived" && isForwarderRejected;
  const isNominated = inquiry.quotationStatus === "accepted";
  const hasNotes = (inquiry.noteCount ?? 0) > 0;
  const hasDocuments = (inquiry.documentCount ?? 0) > 0;
  const hasDocumentsOrNotes = hasNotes || hasDocuments;
  const canViewQuotation = isQuoted || isNominated || isLost;
  const canEditQuotation =
    inquiry.quotationStatus === "submitted" && !!inquiry.quotationId;
  const hasAnyDropdownAction = canViewQuotation || canEditQuotation || isNominated;
  const withTab = (path: string) => (tab ? `${path}?tab=${tab}` : path);

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const rejectInquiry = useMutation(
    trpc.inquiry.forwarder.rejectInquiry.mutationOptions({
      onSuccess: async () => {
        toast.info("Anfrage abgelehnt");
        await queryClient.invalidateQueries(
          trpc.inquiry.forwarder.getMyInquiriesFast.queryFilter(),
        );
      },
      onError: (error: unknown) => {
        if (error && typeof error === "object" && "message" in error) {
          toast.error((error as { message?: string }).message || "Fehler beim Ablehnen");
        } else {
          toast.error("Fehler beim Ablehnen");
        }
      },
    }),
  );

  return (
    <div
      className={cn(
        "group relative flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border transition-all duration-200",
        isNominated
          ? "border-green-200 bg-green-50/50 hover:border-green-300 hover:shadow-lg hover:shadow-green-200/50"
          : "border-slate-200 bg-white hover:border-primary/30 hover:shadow-lg hover:shadow-slate-200/50",
      )}
    >
      <div className="flex items-center gap-4 flex-1">
        <div
          className={cn(
            "h-12 w-12 rounded-lg flex items-center justify-center border shadow-sm shrink-0",
            inquiry.serviceType === "air_freight"
              ? "bg-sky-50 border-sky-100 text-sky-600"
              : inquiry.serviceType === "sea_freight"
                ? "bg-blue-50 border-blue-100 text-blue-600"
                : "bg-amber-50 border-amber-100 text-amber-600",
          )}
        >
          <Icon className="w-6 h-6" strokeWidth={1.5} />
        </div>

        <div className="min-w-[120px]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 leading-none">
              {inquiry.referenceNumber}
            </span>
            {isLostInArchive && (
              <Badge
                variant="destructive"
                className="text-[10px] px-1.5 py-0 h-5"
              >
                Nicht erhalten
              </Badge>
            )}
            {isRejectedInArchive && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-5 text-slate-600 border-slate-300"
              >
                Abgelehnt
              </Badge>
            )}
          </div>
          <p className="text-[10px] uppercase tracking-tight font-semibold text-slate-500 mt-1 truncate max-w-[150px]">
            {inquiry.shipperName}
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-6 px-6 border-l border-slate-100 ml-4">
          <div className="text-right">
            <span className="block text-xs font-bold text-slate-800">
              {inquiry.origin.code}
            </span>
            <span className="text-[9px] text-slate-400 uppercase font-medium">
              {inquiry.origin.country}
            </span>
          </div>
          <ArrowRight className="w-3 h-3 text-slate-300" />
          <div>
            <span className="block text-xs font-bold text-slate-800">
              {inquiry.destination.code}
            </span>
            <span className="text-[9px] text-slate-400 uppercase font-medium">
              {inquiry.destination.country}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-1 my-4 md:my-0 md:px-8 border-l border-slate-100 ml-4">
        <div className="flex items-center gap-2">
          <Box className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-700">
            {inquiry.pieces} Stk / {inquiry.weight} {inquiry.unit}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-700">
            {inquiry.totalVolume || "-"} m³
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-700">
            {inquiry.validityDate
              ? new Date(inquiry.validityDate).toLocaleDateString("de-DE")
              : "-"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[200px] justify-end">
        {inquiry.quotedPrice && (
          <div className="text-right mr-4">
            <div className="flex items-center gap-1.5 justify-end">
              {isNominated && (
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              )}
              <span className="block text-sm font-black text-primary tracking-tight">
                {new Intl.NumberFormat("de-DE", {
                  style: "currency",
                  currency: inquiry.currency,
                }).format(inquiry.quotedPrice)}
              </span>
            </div>
            <span className="text-[9px] uppercase font-bold text-slate-400">
              Dein Angebot
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Link
            prefetch
            href={withTab(`/dashboard/forwarder/frachtanfragen/${inquiry.id}`)}
          >
            <Button
              size="sm"
              variant={tab === "open" ? "outline" : "secondary"}
              className="h-8 text-[10px] font-bold uppercase"
            >
              Details <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
          {tab === "open" && (
            <Link
              prefetch
              href={withTab(`/dashboard/forwarder/frachtanfragen/${inquiry.id}/angebot`)}
            >
              <Button
                size="sm"
                className="h-8 text-[10px] font-bold uppercase shadow-sm"
              >
                Anbieten
              </Button>
            </Link>
          )}
          {tab === "open" && (
            <ConfirmationDialog
              title="Anfrage ablehnen?"
              description="Möchtest du diese Anfrage wirklich ablehnen?"
              confirmText="Ja, ablehnen"
              cancelText="Abbrechen"
              variant="destructive"
              onConfirm={() => rejectInquiry.mutate({ inquiryId: inquiry.id })}
              loading={rejectInquiry.isPending}
              loadingText="Wird abgelehnt..."
              disabled={rejectInquiry.isPending}
            >
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-[10px] font-bold uppercase border-slate-200 hover:bg-slate-50 text-slate-600"
                disabled={rejectInquiry.isPending}
              >
                <XCircle className="w-3.5 h-3.5 mr-1.5" /> Ablehnen
              </Button>
            </ConfirmationDialog>
          )}
          {hasAnyDropdownAction && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-slate-400"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {canViewQuotation && (
                  <DropdownMenuItem
                    onClick={onOpenQuotation}
                    className="cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2 text-slate-600" />
                    <span className="text-[10px] font-bold uppercase">
                      Angebot ansehen
                    </span>
                  </DropdownMenuItem>
                )}
                {canEditQuotation && inquiry.quotationId && (
                  <DropdownMenuItem
                    onClick={() => onOpenEditQuotation(inquiry.quotationId!)}
                    className="cursor-pointer"
                  >
                    <Pencil className="w-4 h-4 mr-2 text-slate-600" />
                    <span className="text-[10px] font-bold uppercase">
                      Angebot korrigieren
                    </span>
                  </DropdownMenuItem>
                )}
                {isNominated && (
                  <DropdownMenuItem
                    onClick={onOpenDocumentsNotes}
                    className="cursor-pointer"
                  >
                    <FileText className="w-4 h-4 mr-2 text-slate-600" />
                    <span className="text-[10px] font-bold uppercase">
                      Dokumente & Notizen{" "}
                      {hasDocumentsOrNotes &&
                        `(${(inquiry.documentCount ?? 0) + (inquiry.noteCount ?? 0)})`}
                    </span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
