"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Plane,
  Ship,
  Truck,
  Train,
  Package,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Package2,
  Calendar,
  User,
  Building2,
  Weight,
  Ruler,
  Thermometer,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import QuotationModal from "./quotation-modal";
import { DotLoading } from "@/components/ui/dot-loading";

interface InquiryDetailViewProps {
  inquiryId: string;
}

const InquiryDetailView = ({ inquiryId }: InquiryDetailViewProps) => {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data, isError, error, isPending } =
    trpc.inquiry.forwarder.getInquiryDetail.useQuery({ inquiryId });
  const { data: quotationCheck } =
    trpc.quotation.forwarder.checkQuotationExists.useQuery({ inquiryId });

  if (isPending) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <DotLoading size="md" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Fehler beim Laden der Frachtanfrage:{" "}
            {error?.message || "Unbekannter Fehler"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-muted-foreground">
          Frachtanfrage nicht gefunden.
        </div>
      </div>
    );
  }

  const inquiry = data.inquiry;
  const packages = data.packages;
  const packageSummary = data.packageSummary;
  const quotation = quotationCheck?.quotation;
  const isQuotationRejected = quotation?.status === "rejected";

  const handleQuotationCreated = () => {
    // Invalidate and refetch inquiry data
    utils.inquiry.forwarder.getInquiryDetail.invalidate({ inquiryId });
    // Also invalidate the inquiries list
    utils.inquiry.forwarder.getMyInquiriesFast.invalidate();
  };

  const getServiceTypeIcon = (serviceType: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      air_freight: <Plane className="h-5 w-5" />,
      sea_freight: <Ship className="h-5 w-5" />,
      road_freight: <Truck className="h-5 w-5" />,
      rail_freight: <Train className="h-5 w-5" />,
    };
    return iconMap[serviceType] || <Package className="h-5 w-5" />;
  };

  const formatServiceType = (serviceType: string) => {
    const serviceTypeMap: Record<string, string> = {
      air_freight: "Luftfracht",
      sea_freight: "Seefracht",
      road_freight: "Straßentransport",
      rail_freight: "Bahnfracht",
    };
    return serviceTypeMap[serviceType] || serviceType;
  };

  const formatCargoType = (cargoType: string) => {
    const cargoTypeMap: Record<string, string> = {
      general: "General",
      dangerous: "Gefahrgut",
      perishable: "Verderbliche Ware",
      fragile: "Zerbrechlich",
      oversized: "Übergröße",
    };
    return cargoTypeMap[cargoType] || cargoType;
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      draft: "Entwurf",
      offen: "Offen",
      awarded: "Vergeben",
      closed: "Geschlossen",
      cancelled: "Storniert",
      expired: "Abgelaufen",
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      draft: <Clock className="h-4 w-4 text-slate-600" />,
      offen: <CheckCircle className="h-4 w-4 text-blue-400" />,
      awarded: <CheckCircle className="h-4 w-4 text-green-400" />,
      closed: <XCircle className="h-4 w-4 text-gray-400" />,
      cancelled: <XCircle className="h-4 w-4 text-red-400" />,
      expired: <Clock className="h-4 w-4 text-orange-400" />,
    };
    return iconMap[status] || <Clock className="h-4 w-4 text-slate-600" />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {inquiry.referenceNumber}
            </h1>
            <p className="text-muted-foreground">{inquiry.title}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            {getStatusIcon(inquiry.status)}
            <Badge
              variant={
                isQuotationRejected
                  ? "destructive"
                  : inquiry.status === "offen"
                    ? "default"
                    : "secondary"
              }
            >
              {isQuotationRejected ? "Abgelehnt" : formatStatus(inquiry.status)}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <QuotationModal
              inquiryId={inquiryId}
              onQuotationCreated={handleQuotationCreated}
            />
            <Button variant="outline" size="sm">
              Nachricht senden
            </Button>
            <Button variant="outline" size="sm">
              Details exportieren
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service, Cargo & Route Information */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getServiceTypeIcon(inquiry.serviceType)}
                Service, Fracht & Route
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Service & Cargo Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Service Type
                  </label>
                  <p className="text-lg font-semibold">
                    {formatServiceType(inquiry.serviceType)}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Cargo Type
                  </label>
                  <div className="flex items-center gap-2">
                    {inquiry.cargoType === "dangerous" && (
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    )}
                    <p className="text-lg font-semibold">
                      {formatCargoType(inquiry.cargoType)}
                    </p>
                  </div>
                </div>
                <div className="lg:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Cargo Description
                  </label>
                  <p className="text-sm">
                    {inquiry.cargoDescription || "Keine Beschreibung verfügbar"}
                  </p>
                </div>
              </div>

              {/* Route with Line */}
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Route
                </h4>
                <div className="flex items-center justify-between relative">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-cyan-100 rounded-full mb-2">
                      <MapPin className="h-6 w-6 text-cyan-600" />
                    </div>
                    <p className="font-semibold">{inquiry.originCity}</p>
                    <p className="text-sm text-muted-foreground">
                      {inquiry.originCountry}
                    </p>
                  </div>

                  {/* Connecting Line */}
                  <div className="flex-1 mx-6 relative">
                    <div className="h-px bg-gray-300 absolute top-1/2 left-0 right-0 transform -translate-y-1/2"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                      {getServiceTypeIcon(inquiry.serviceType)}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-rose-100 rounded-full mb-2">
                      <MapPin className="h-6 w-6 text-rose-600" />
                    </div>
                    <p className="font-semibold">{inquiry.destinationCity}</p>
                    <p className="text-sm text-muted-foreground">
                      {inquiry.destinationCountry}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package Information - Integrated */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package2 className="h-5 w-5" />
                Paket Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-6 bg-gray-50 rounded-lg h-32 flex flex-col justify-center">
                  <Weight className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">
                    {inquiry.totalGrossWeight} kg
                  </p>
                  <p className="text-sm text-muted-foreground">Gesamtgewicht</p>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg h-32 flex flex-col justify-center">
                  <Package className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">{inquiry.totalPieces}</p>
                  <p className="text-sm text-muted-foreground">Anzahl Pakete</p>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg h-32 flex flex-col justify-center">
                  <Ruler className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold">{inquiry.totalVolume} m³</p>
                  <p className="text-sm text-muted-foreground">Volumen</p>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg h-32 flex flex-col justify-center">
                  <Weight className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <p className="text-2xl font-bold">
                    {inquiry.totalChargeableWeight} kg
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Berechenbares Gewicht
                  </p>
                </div>
              </div>

              {/* Individual Package Details */}
              {packages && packages.length > 0 && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">Einzelne Pakete</h4>
                  <div className="space-y-3">
                    {packages.map((pkg, index) => (
                      <div
                        key={pkg.id}
                        className="border rounded-lg p-4 bg-white"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-blue-600">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <h5 className="font-semibold">
                                Paket {pkg.packageNumber}
                              </h5>
                              {pkg.description && (
                                <p className="text-sm text-muted-foreground">
                                  {pkg.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {pkg.isDangerous && (
                              <Badge
                                variant="destructive"
                                className="flex items-center gap-1"
                              >
                                <Shield className="h-3 w-3" />
                                Gefahrgut
                              </Badge>
                            )}
                            {pkg.temperature && (
                              <Badge
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                <Thermometer className="h-3 w-3" />
                                {pkg.temperature}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="space-y-1">
                            <span className="text-muted-foreground">
                              Gewicht:
                            </span>
                            <p className="font-medium">{pkg.grossWeight} kg</p>
                            {pkg.chargeableWeight && (
                              <p className="text-xs text-muted-foreground">
                                Frachtpflichtig: {pkg.chargeableWeight} kg
                              </p>
                            )}
                          </div>
                          <div className="space-y-1">
                            <span className="text-muted-foreground">
                              Stückzahl:
                            </span>
                            <p className="font-medium">{pkg.pieces}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-muted-foreground">
                              Volumen:
                            </span>
                            <p className="font-medium">
                              {pkg.volume ? `${pkg.volume} m³` : "N/A"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-muted-foreground">
                              Abmessungen:
                            </span>
                            <p className="font-medium">
                              {pkg.length && pkg.width && pkg.height
                                ? `${pkg.length} × ${pkg.width} × ${pkg.height} cm`
                                : "N/A"}
                            </p>
                          </div>
                        </div>

                        {(pkg.dangerousGoodsClass ||
                          pkg.unNumber ||
                          pkg.specialHandling) && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                              {pkg.dangerousGoodsClass && (
                                <div>
                                  <span className="text-muted-foreground">
                                    Gefahrgutklasse:
                                  </span>
                                  <p className="font-medium">
                                    {pkg.dangerousGoodsClass}
                                  </p>
                                </div>
                              )}
                              {pkg.unNumber && (
                                <div>
                                  <span className="text-muted-foreground">
                                    UN-Nummer:
                                  </span>
                                  <p className="font-medium">{pkg.unNumber}</p>
                                </div>
                              )}
                              {pkg.specialHandling && (
                                <div>
                                  <span className="text-muted-foreground">
                                    Spezielle Behandlung:
                                  </span>
                                  <p className="font-medium">
                                    {pkg.specialHandling}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Requirements */}
              {(packageSummary.hasDangerousGoods ||
                packageSummary.temperatureControlled ||
                packageSummary.specialHandling) && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Besondere Anforderungen</h4>
                  <div className="flex flex-wrap gap-2">
                    {packageSummary.hasDangerousGoods && (
                      <Badge
                        variant="destructive"
                        className="flex items-center gap-1"
                      >
                        <Shield className="h-3 w-3" />
                        Gefahrgut
                      </Badge>
                    )}
                    {packageSummary.temperatureControlled && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <Thermometer className="h-3 w-3" />
                        Temperaturkontrolle
                      </Badge>
                    )}
                    {packageSummary.specialHandling && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Package className="h-3 w-3" />
                        Spezielle Behandlung
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Additional Info */}
        <div className="space-y-6">
          {/* Shipper Information */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Shipper
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Organisation
                </label>
                <p className="font-semibold">
                  {inquiry.shipperOrganization.name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  E-Mail
                </label>
                <p className="text-sm">{inquiry.shipperOrganization.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Erstellt von
                </label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{inquiry.createdBy.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Erstellt</p>
                  <p className="text-xs text-muted-foreground">
                    {data.statusDateInfo.formattedSentDate}
                  </p>
                </div>
              </div>
              {data.statusDateInfo.formattedViewedDate && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Angesehen</p>
                    <p className="text-xs text-muted-foreground">
                      {data.statusDateInfo.formattedViewedDate}
                    </p>
                  </div>
                </div>
              )}
              {inquiry.validityDate && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Gültigkeitsdatum</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(inquiry.validityDate).toLocaleDateString(
                        "de-DE"
                      )}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InquiryDetailView;
