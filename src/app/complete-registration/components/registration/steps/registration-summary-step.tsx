"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Truck,
  Edit,
  MapPin,
  Phone,
  Globe,
  Package,
  Award,
  Map,
  ArrowRight,
} from "lucide-react";
import { organization } from "@/lib/auth-client";
import type { OrganizationDetails } from "@/lib/schemas/organization";

interface RegistrationSummaryStepProps {
  organizationDetails: OrganizationDetails;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function RegistrationSummaryStep({
  organizationDetails,
  onEdit,
  onSubmit,
  isSubmitting,
}: RegistrationSummaryStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const slug = generateSlug(organizationDetails.name);

      const createdOrg = await organization.create({
        name: organizationDetails.name,
        slug: slug,
        metadata: {
          organizationType: organizationDetails.organizationType,
          address: organizationDetails.address,
          city: organizationDetails.city,
          postalCode: organizationDetails.postalCode,
          country: organizationDetails.country,
          phone: organizationDetails.phone,
          website: organizationDetails.website || undefined,
          taxNumber: organizationDetails.taxNumber || undefined,
          industry: organizationDetails.industry || undefined,

          ...(organizationDetails.organizationType === "forwarder" && {
            services: organizationDetails.services || [],
            certifications: organizationDetails.certifications || [],
            coverageAreas: organizationDetails.coverageAreas || [],
          }),
        },
      });

      if (!createdOrg.data) {
        if (createdOrg.error) {
          console.error("Better Auth error:", createdOrg.error);

          if (
            createdOrg.error.code === "ORGANIZATION_LIMIT_EXCEEDED" ||
            createdOrg.error.code === "USER_ALREADY_HAS_ORGANIZATION"
          ) {
            throw new Error(
              "Sie haben bereits eine Organisation erstellt. Sie können nur eine Organisation pro Benutzer haben."
            );
          } else if (
            createdOrg.error.code === "SLUG_ALREADY_TAKEN" ||
            createdOrg.error.code === "ORGANIZATION_SLUG_EXISTS"
          ) {
            throw new Error(
              "Dieser Organisationsname ist bereits vergeben. Bitte wählen Sie einen anderen Namen."
            );
          } else if (
            createdOrg.error.code === "UNAUTHORIZED" ||
            createdOrg.error.code === "FORBIDDEN"
          ) {
            throw new Error(
              "Sie sind nicht berechtigt, eine Organisation zu erstellen."
            );
          } else {
            throw new Error(
              createdOrg.error.message ||
                "Fehler beim Erstellen der Organisation"
            );
          }
        }
        throw new Error("Fehler beim Erstellen der Organisation");
      }

      const setActiveResult = await organization.setActive({
        organizationId: createdOrg.data.id,
      });

      if (!setActiveResult.data) {
        console.error("Failed to set active organization:", setActiveResult.error);
      }

      onSubmit();
    } catch (err) {
      console.error("Registrierungsfehler:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Registrierung konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loading = isSubmitting || isLoading;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-slate-600">
          Bitte überprüfen Sie Ihre Angaben vor dem Abschluss der Registrierung
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg flex items-center">
              {organizationDetails.organizationType === "shipper" ? (
                <>
                  <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                  Shipper
                </>
              ) : (
                <>
                  <Truck className="w-5 h-5 mr-2 text-green-600" />
                  Spediteur
                </>
              )}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEdit(1)}>
              <Edit className="w-4 h-4 mr-1" />
              Bearbeiten
            </Button>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="capitalize">
              {organizationDetails.organizationType === "shipper"
                ? "Shipper"
                : "Spediteur"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-none border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Unternehmensdetails</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEdit(2)}>
              <Edit className="w-4 h-4 mr-1" />
              Bearbeiten
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-slate-900 mb-1">
                  Unternehmensname
                </h4>
                <p className="text-slate-600">{organizationDetails.name}</p>
              </div>
              {organizationDetails.industry && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">Branche</h4>
                  <p className="text-slate-600">
                    {organizationDetails.industry}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-slate-900 mb-1">
                  Geschäftsadresse
                </h4>
                <p className="text-slate-600">
                  {organizationDetails.address}
                  <br />
                  {organizationDetails.city}, {organizationDetails.postalCode}
                  <br />
                  {organizationDetails.country}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-slate-500" />
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">Telefon</h4>
                  <p className="text-slate-600">{organizationDetails.phone}</p>
                </div>
              </div>
              {organizationDetails.website && (
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-slate-500" />
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Website</h4>
                    <p className="text-slate-600">
                      {organizationDetails.website}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {organizationDetails.taxNumber && (
              <div>
                <h4 className="font-medium text-slate-900 mb-1">
                  Steuernummer / USt-IdNr.
                </h4>
                <p className="text-slate-600">
                  {organizationDetails.taxNumber}
                </p>
              </div>
            )}

            {organizationDetails.organizationType === "shipper" &&
              organizationDetails.industry && (
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-slate-500" />
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Branche</h4>
                    <p className="text-slate-600">
                      {organizationDetails.industry}
                    </p>
                  </div>
                </div>
              )}

            {organizationDetails.organizationType === "forwarder" && (
              <>
                {organizationDetails.services &&
                  organizationDetails.services.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2 flex items-center">
                        <Package className="w-4 h-4 text-slate-500 mr-2" />
                        Angebotene Dienstleistungen
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {organizationDetails.services.map((service, index) => (
                          <Badge key={index} variant="outline">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {organizationDetails.certifications &&
                  organizationDetails.certifications.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2 flex items-center">
                        <Award className="w-4 h-4 text-slate-500 mr-2" />
                        Zertifizierungen
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {organizationDetails.certifications.map(
                          (cert, index) => (
                            <Badge key={index} variant="outline">
                              {cert}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {organizationDetails.coverageAreas &&
                  organizationDetails.coverageAreas.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2 flex items-center">
                        <Map className="w-4 h-4 text-slate-500 mr-2" />
                        Abdeckungsgebiete
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {organizationDetails.coverageAreas.map(
                          (area, index) => (
                            <Badge key={index} variant="outline">
                              {area}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Button
        onClick={handleFinalSubmit}
        className="w-full"
        size="lg"
        disabled={loading}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Organisation wird erstellt...
          </>
        ) : (
          <>
            Registrierung abschließen
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}
