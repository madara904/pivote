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
import { trpc } from "@/trpc/client";
import { PageLayout, PageHeaderWithBorder, PageContainer } from "@/components/ui/page-layout";

export default function InquiryDetailsView({ inquiryId }: { inquiryId: string }) {
  const [detail] = trpc.inquiry.forwarder.getInquiryDetail.useSuspenseQuery({
    inquiryId,
  });

  const inquiry = detail.inquiry;

  return (
    <PageLayout>
      <PageHeaderWithBorder>
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <Link href="/dashboard/forwarder/frachtanfragen">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground break-words">{inquiry.referenceNumber}</h1>
              <Badge variant="secondary" className="shrink-0 self-start sm:self-auto">
                {inquiry.status}
              </Badge>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground break-words">{inquiry.title}</p>
          </div>
        </div>
      </PageHeaderWithBorder>

      <PageContainer>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="p-4 sm:p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Service Details</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">Versandservice und Routeninformationen</p>
                </div>

                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <ServiceIcon serviceType={inquiry.serviceType} className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-muted-foreground">Service-Typ</p>
                        <p className="text-base font-medium text-foreground break-words">
                          {inquiry.serviceType === "air_freight"
                            ? "Luftfracht"
                            : inquiry.serviceType === "sea_freight"
                              ? "Seefracht"
                              : "Straßenfracht"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <FileText className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-muted-foreground">Richtung</p>
                        <p className="text-base font-medium text-foreground capitalize break-words">{inquiry.serviceDirection === "import" ? "Import" : "Export"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="mb-3 text-sm text-muted-foreground">Route</p>
                  <RouteDisplay
                    origin={{ code: inquiry.originCity, city: inquiry.originCity, country: inquiry.originCountry }}
                    destination={{ code: inquiry.destinationCity, city: inquiry.destinationCity, country: inquiry.destinationCountry }}
                  />
                </div>
              </div>
            </Card>


            <Card className="p-4 sm:p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Frachtinformationen</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">Details zur Versandfracht</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Frachttyp</p>
                    <p className="mt-1 text-base font-medium text-foreground capitalize">
                      {inquiry.cargoType.replace("_", " ")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Beschreibung</p>
                    <p className="mt-1 text-base leading-relaxed text-foreground">{inquiry.cargoDescription}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Gesamtanzahl Stück</p>
                    <p className="mt-1 text-base sm:text-lg font-semibold text-foreground break-words">{inquiry.totalPieces}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Bruttogewicht</p>
                    <p className="mt-1 text-base sm:text-lg font-semibold text-foreground break-words">{inquiry.totalGrossWeight} kg</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Berechenbares Gewicht</p>
                    <p className="mt-1 text-base sm:text-lg font-semibold text-foreground break-words">{inquiry.totalChargeableWeight} kg</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Volumen</p>
                    <p className="mt-1 text-base sm:text-lg font-semibold text-foreground break-words">{inquiry.totalVolume} m³</p>
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
                    {detail.packageSummary.count} {detail.packageSummary.count === 1 ? "Paket" : "Pakete"} in dieser
                    Sendung
                  </p>
                </div>

                <div className="space-y-4">
                  {detail.packages.map((pkg, index) => (
                    <div key={pkg.id}>
                      {index > 0 && <Separator className="mb-4" />}
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-base font-semibold text-foreground">Paket {pkg.packageNumber}</p>
                              {pkg.isDangerous && (
                                <Badge variant="destructive" className="gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  DG
                                </Badge>
                              )}
                            </div>
                            <p className="mt-0.5 text-sm text-muted-foreground">{pkg.description}</p>
                          </div>
                        </div>

                        <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <p className="text-xs sm:text-sm text-muted-foreground">Stück</p>
                            <p className="mt-0.5 text-sm sm:text-base font-medium text-foreground break-words">{pkg.pieces}</p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-muted-foreground">Bruttogewicht</p>
                            <p className="mt-0.5 text-sm sm:text-base font-medium text-foreground break-words">{pkg.grossWeight} kg</p>
                          </div>
                          {pkg.chargeableWeight && (
                            <div>
                              <p className="text-xs sm:text-sm text-muted-foreground">Berechenbares Gewicht</p>
                              <p className="mt-0.5 text-sm sm:text-base font-medium text-foreground break-words">{pkg.chargeableWeight} kg</p>
                            </div>
                          )}
                          {pkg.length && pkg.width && pkg.height && (
                            <div>
                              <p className="text-xs sm:text-sm text-muted-foreground">Abmessungen (L×B×H)</p>
                              <p className="mt-0.5 text-sm sm:text-base font-medium text-foreground break-words">
                                {pkg.length} × {pkg.width} × {pkg.height} cm
                              </p>
                            </div>
                          )}
                          {pkg.volume && (
                            <div>
                              <p className="text-xs sm:text-sm text-muted-foreground">Volumen</p>
                              <p className="mt-0.5 text-sm sm:text-base font-medium text-foreground break-words">{pkg.volume} m³</p>
                            </div>
                          )}
                        </div>

                        {(pkg.temperature || pkg.specialHandling || pkg.isDangerous) && (
                          <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                            {pkg.temperature && (
                              <div className="flex items-center gap-2">
                                <Thermometer className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-foreground">Temperatur: {pkg.temperature}</span>
                              </div>
                            )}
                            {pkg.specialHandling && (
                              <div className="flex items-center gap-2">
                                <Wrench className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-foreground">{pkg.specialHandling}</span>
                              </div>
                            )}
                            {pkg.isDangerous && (
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                                <span className="text-sm text-foreground">
                                  Klasse {pkg.dangerousGoodsClass} - {pkg.unNumber}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-4 sm:p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Status</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">Aktueller Status der Anfrage</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Antwortstatus</p>
                    <Badge variant="secondary" className="mt-1.5">
                      {detail.responseStatus || "Ausstehend"}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-muted-foreground">Gesendet</p>
                        <p className="text-sm font-medium text-foreground">
                          {detail.sentAt
                            ? new Date(detail.sentAt).toLocaleDateString("de-DE", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "Nicht verfügbar"}
                        </p>
                      </div>
                    </div>

                    {detail.viewedAt && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-muted-foreground">Angesehen</p>
                          <p className="text-sm font-medium text-foreground">
                            {new Date(detail.viewedAt).toLocaleDateString("de-DE", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-muted-foreground">Gültig bis</p>
                        <p className="text-sm font-medium text-foreground">
                          {inquiry.validityDate
                            ? new Date(inquiry.validityDate).toLocaleDateString("de-DE", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "Nicht verfügbar"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Versender</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">Organisationsdetails</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">Unternehmen</p>
                      <p className="mt-0.5 text-base font-medium text-foreground">{inquiry.shipperOrganization.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <User className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">Kontakt</p>
                      <p className="mt-0.5 text-base font-medium text-foreground">{inquiry.createdBy.name}</p>
                    </div>
                  </div>

                  <Separator />

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

            <Card className="p-4 sm:p-6">
              <div className="space-y-4">
                <Button className="w-full" size="lg">
                  Angebot abgeben
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Weitere Informationen anfordern
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  Anfrage ablehnen
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </PageContainer>
    </PageLayout>
  );
}

