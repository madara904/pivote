"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RouteDisplay } from "@/components/ui/route-display";
import { ServiceIcon } from "@/components/ui/service-icon";
import {
  Package,
  Thermometer,
  AlertTriangle,
  Wrench,
  Calendar,
  Building2,
  User,
  FileText,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/trpc/client";
import { PageLayout, PageHeaderWithBorder, PageContainer } from "@/components/ui/page-layout";

const getServiceLabel = (serviceType: string) => {
  if (serviceType === "air_freight") return "Luftfracht";
  if (serviceType === "sea_freight") return "Seefracht";
  if (serviceType === "road_freight") return "Straßenfracht";
  return serviceType;
};

const getDirectionLabel = (direction?: string | null) => {
  if (direction === "import") return "Import";
  if (direction === "export") return "Export";
  return "—";
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function InquiryDetailsView({ inquiryId }: { inquiryId: string }) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [detail] = trpc.inquiry.forwarder.getInquiryDetail.useSuspenseQuery({
    inquiryId,
  });

  const inquiry = detail.inquiry;
  const toNumber = (value?: string | number | null) => {
    if (value === null || value === undefined) return 0;
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const packageTotals = detail.packages.reduce(
    (acc, pkg) => ({
      pieces: acc.pieces + toNumber(pkg.pieces),
      grossWeight: acc.grossWeight + toNumber(pkg.grossWeight),
      chargeableWeight: acc.chargeableWeight + toNumber(pkg.chargeableWeight),
      volume: acc.volume + toNumber(pkg.volume),
    }),
    { pieces: 0, grossWeight: 0, chargeableWeight: 0, volume: 0 }
  );


  // Build back link with preserved tab parameter
  const backHref = tabParam 
    ? `/dashboard/forwarder/frachtanfragen?tab=${tabParam}`
    : "/dashboard/forwarder/frachtanfragen";

  return (
    <PageLayout>
      <PageHeaderWithBorder>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <Link href={backHref}>
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-semibold text-foreground break-words">
                  {inquiry.referenceNumber}
                </h1>
                <Badge variant="secondary" className="capitalize">{inquiry.status}</Badge>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground break-words">{inquiry.title}</p>
              {inquiry.shipperReference && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Referenz des Versenders: <span className="font-medium text-foreground">{inquiry.shipperReference}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline">Weitere Informationen anfordern</Button>
          </div>
        </div>
      </PageHeaderWithBorder>

      <PageContainer className="pt-4">
        <div className="space-y-6">
          <Card className="p-4 sm:p-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Route</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <ServiceIcon serviceType={inquiry.serviceType} className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      {inquiry.originCity} → {inquiry.destinationCity}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {inquiry.originCountry} → {inquiry.destinationCountry}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Transport</p>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-foreground">{getServiceLabel(inquiry.serviceType)}</p>
                  <p className="text-sm text-muted-foreground">{getDirectionLabel(inquiry.serviceDirection)}</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card className="p-4 sm:p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Frachtinformationen</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">Details zur Versandfracht</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Frachttyp</p>
                      <p className="mt-1 text-base font-medium text-foreground capitalize">
                        {inquiry.cargoType.replace("_", " ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Beschreibung</p>
                      <p className="mt-1 text-base leading-relaxed text-foreground">{inquiry.cargoDescription || "—"}</p>
                    </div>
                  </div>

                  {(detail.packageSummary.hasDangerousGoods ||
                    detail.packageSummary.temperatureControlled ||
                    detail.packageSummary.specialHandling) && (
                    <>
                      <Separator />
                      <div>
                        <p className="mb-3 text-sm text-muted-foreground">Besondere Anforderungen</p>
                        <div className="flex flex-wrap gap-2">
                          {detail.packageSummary.hasDangerousGoods && (
                            <Badge variant="destructive" className="gap-1.5">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Gefahrgut
                            </Badge>
                          )}
                          {detail.packageSummary.temperatureControlled && (
                            <Badge variant="secondary" className="gap-1.5">
                              <Thermometer className="h-3.5 w-3.5" />
                              Temperaturkontrolliert
                            </Badge>
                          )}
                          {detail.packageSummary.specialHandling && (
                            <Badge variant="secondary" className="gap-1.5">
                              <Wrench className="h-3.5 w-3.5" />
                              Besondere Behandlung
                            </Badge>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              <Card className="p-4 sm:p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Paketdetails</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Zusammenfassung aller Pakete in dieser Sendung
                    </p>
                  </div>

                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">Paket</th>
                          <th className="px-3 py-2 text-left font-medium">Stück</th>
                          <th className="px-3 py-2 text-left font-medium">Brutto</th>
                          <th className="px-3 py-2 text-left font-medium">Chargeable</th>
                          <th className="px-3 py-2 text-left font-medium">Abmessungen</th>
                          <th className="px-3 py-2 text-left font-medium">Volumen</th>
                          <th className="px-3 py-2 text-left font-medium">DG</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {detail.packages.map((pkg) => (
                          <tr key={pkg.id} className="text-foreground">
                            <td className="px-3 py-2">{pkg.packageNumber}</td>
                            <td className="px-3 py-2">{pkg.pieces}</td>
                            <td className="px-3 py-2">{pkg.grossWeight} kg</td>
                            <td className="px-3 py-2">{pkg.chargeableWeight ?? "—"}{pkg.chargeableWeight ? " kg" : ""}</td>
                            <td className="px-3 py-2">
                              {pkg.length && pkg.width && pkg.height
                                ? `${pkg.length} × ${pkg.width} × ${pkg.height} cm`
                                : "—"}
                            </td>
                            <td className="px-3 py-2">{pkg.volume ?? "—"}{pkg.volume ? " m³" : ""}</td>
                            <td className="px-3 py-2">{pkg.isDangerous ? "Ja" : "Nein"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Gesamtgewicht</p>
                      <p className="mt-0.5 text-sm sm:text-base font-medium text-foreground">{packageTotals.grossWeight.toFixed(2)} kg</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Stück gesamt</p>
                      <p className="mt-0.5 text-sm sm:text-base font-medium text-foreground">{packageTotals.pieces}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Chargeable gesamt</p>
                      <p className="mt-0.5 text-sm sm:text-base font-medium text-foreground">{packageTotals.chargeableWeight.toFixed(2)} kg</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Volumen gesamt</p>
                      <p className="mt-0.5 text-sm sm:text-base font-medium text-foreground">{packageTotals.volume.toFixed(3)} m³</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-4 sm:p-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Timeline</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Gesendet</p>
                        <p className="text-sm font-medium text-foreground">{formatDate(detail.sentAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Angesehen</p>
                        <p className="text-sm font-medium text-foreground">{formatDate(detail.viewedAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Gültig bis</p>
                        <p className="text-sm font-medium text-foreground">{formatDate(inquiry.validityDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 sm:p-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Versender</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Unternehmen</p>
                        <p className="mt-0.5 text-base font-medium text-foreground">{inquiry.shipperOrganization.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <User className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Kontakt</p>
                        <p className="mt-0.5 text-base font-medium text-foreground">{inquiry.createdBy.name}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a
                        href={`mailto:${inquiry.shipperOrganization.email}`}
                        className="mt-0.5 text-sm font-medium text-primary hover:underline"
                      >
                        {inquiry.shipperOrganization.email}
                      </a>
                    </div>
                  </div>
                </div>
              </Card>

            </div>
          </div>
        </div>
      </PageContainer>
    </PageLayout>
  );
}

