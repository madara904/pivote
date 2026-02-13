"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ServiceIcon } from "@/components/ui/service-icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  Calendar,
  Building2,
  FileText,
  ArrowLeft,
  CheckCircle,
  Download,
  MapPin,
  Mail,
  Scale,
  Box,
  ChevronRight,
  ShieldAlert,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageContainer } from "@/components/ui/page-layout";
import { cn } from "@/lib/utils";
import { formatGermanDate } from "@/lib/date-utils";

export default function InquiryDetailsView({
  inquiryId,
}: {
  inquiryId: string;
}) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const trpcOptions = useTRPC();

  const { data: detail } = useSuspenseQuery(
    trpcOptions.inquiry.forwarder.getInquiryDetail.queryOptions({ inquiryId }),
  );

  const isWon = detail.quotationStatus === "accepted";
  const inquiry = detail.inquiry;
  const backHref = tabParam
    ? `/dashboard/forwarder/frachtanfragen?tab=${tabParam}`
    : "/dashboard/forwarder/frachtanfragen";

  return (
    <PageContainer>
      <div className="w-full max-w-[1400px] mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href={backHref}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-slate-300">/</span>
            <span className="text-sm font-bold text-slate-900">
              {inquiry.referenceNumber}
            </span>
            {isWon && (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50 h-5 px-2 text-[10px]">
                Gewonnen
              </Badge>
            )}
          </div>
        </div>
        <div>
          <div className="grid grid-cols-12">
            {/* HAUPTBEREICH (Links & Mitte) */}
            <div className="col-span-12 lg:col-span-8 p-8 md:border-r">
              {/* 1. Route Visual (Minimalist) */}
              <div className="flex items-center justify-between mb-16 bg-slate-50/50 p-8 rounded-2xl border border-slate-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">
                    Origin
                  </p>
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    {inquiry.originCity}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {inquiry.originCountry}
                  </p>
                </div>

                <div className="flex-1 flex flex-col items-center px-12">
                  <div className="w-full flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 via-primary/20 to-slate-200" />
                    <ServiceIcon
                      serviceType={inquiry.serviceType}
                      className="h-5 w-5 text-slate-400"
                    />
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 via-primary/20 to-slate-200" />
                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest">
                    {inquiry.serviceType}
                  </p>
                </div>

                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">
                    Destination
                  </p>
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    {inquiry.destinationCity}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {inquiry.destinationCountry}
                  </p>
                </div>
              </div>

              {/* 2. Cargo Manifest Table (Sehr clean) */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Package className="h-4 w-4 text-slate-400" />
                    Ladung & Packstücke
                  </h3>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">
                        Total Weight
                      </p>
                      <p className="text-sm font-bold">
                        {detail.inquiry.totalGrossWeight} kg
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">
                        Total Volume
                      </p>
                      <p className="text-sm font-bold">
                        {detail.inquiry.totalVolume} m³
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 border-b border-slate-100 hover:bg-slate-50/50">
                        <TableHead className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase">
                          Pos.
                        </TableHead>
                        <TableHead className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase">
                          Anzahl
                        </TableHead>
                        <TableHead className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase">
                          Maße (LBH)
                        </TableHead>
                        <TableHead className="px-4 py-3 text-right text-[11px] font-bold text-slate-500 uppercase">
                          Gewicht
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-50">
                      {detail.packages.map((pkg, i) => (
                        <TableRow
                          key={pkg.id}
                          className="hover:bg-slate-50/30 transition-colors"
                        >
                          <TableCell className="px-4 py-4 text-slate-400 font-medium">
                            {(i + 1).toString().padStart(2, "0")}
                          </TableCell>
                          <TableCell className="px-4 py-4 font-semibold text-slate-900">
                            {pkg.pieces}x Packstücke
                          </TableCell>
                          <TableCell className="px-4 py-4 text-slate-500">
                            {pkg.length} × {pkg.width} × {pkg.height}{" "}
                            <span className="text-[10px]">cm</span>
                          </TableCell>
                          <TableCell className="px-4 py-4 text-right font-bold text-slate-900">
                            {pkg.grossWeight} kg
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* 3. Details / Description */}
              <div className="mt-12 grid grid-cols-2 gap-12">
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Warenbeschreibung
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {inquiry.cargoDescription ||
                      "Keine zusätzliche Beschreibung hinterlegt."}
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Anforderungen
                  </h4>
                  <div className="flex flex-col gap-2">
                    <Requirement
                      item="Gefahrgut"
                      active={detail.packageSummary.hasDangerousGoods}
                      icon={ShieldAlert}
                    />
                    <Requirement
                      item="Temperaturkontrolle"
                      active={detail.packageSummary.temperatureControlled}
                      icon={Clock}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SIDEBAR (Rechts) */}
            <div className="col-span-12 lg:col-span-4 p-8 space-y-10 bg-white">
              {/* Timeline */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Status & Termine
                </h3>
                <div className="space-y-4">
                  <SidebarInfo
                    label="Anfrage erstellt"
                    value={formatGermanDate(detail.sentAt) || "—"}
                    icon={Calendar}
                  />
                  <SidebarInfo
                    label="Gültig bis"
                    value={formatGermanDate(inquiry.validityDate) || "—"}
                    icon={Clock}
                    highlight
                  />
                </div>
              </div>

              <Separator className="bg-slate-100" />

              {/* Versender */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Kunde
                </h3>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-white border shadow-sm flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {inquiry.shipperOrganization.name}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <Mail className="h-3 w-3" />{" "}
                      {inquiry.shipperOrganization.email}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" /> Ref:{" "}
                      {inquiry.shipperReference || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

// Minimalistische Helper-Komponenten
function SidebarInfo({ label, value, icon: Icon, highlight = false }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span
        className={cn(
          "text-xs font-bold",
          highlight ? "text-primary" : "text-slate-900",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function Requirement({ item, active, icon: Icon }: any) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors",
        active
          ? "bg-slate-900 text-white border-slate-900 shadow-md"
          : "bg-white text-slate-400 border-slate-100",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {item}: {active ? "Ja" : "Nein"}
    </div>
  );
}
