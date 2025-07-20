"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Truck, ArrowRight, Plus, X } from "lucide-react";
import {
  organizationDetailsSchema,
  type OrganizationDetails,
} from "@/lib/schemas/organization";

type OrganizationType = "shipper" | "forwarder";

interface OrganizationDetailsStepProps {
  organizationType: OrganizationType;
  initialData: Partial<OrganizationDetails>;
  onSubmit: (details: OrganizationDetails) => void;
}

const countries = [
  "Deutschland",
  "Österreich",
  "Schweiz",
  "Niederlande",
  "Belgien",
  "Frankreich",
  "Italien",
  "Spanien",
  "Polen",
  "Tschechien",
  "Vereinigtes Königreich",
  "Vereinigte Staaten",
  "Kanada",
  "Australien",
  "Japan",
  "Singapur",
  "Sonstige",
];

const forwarderServices = [
  "Seefracht",
  "Luftfracht",
  "Straßentransport",
  "Bahntransport",
  "Zollabfertigung",
  "Lagerung",
  "Distribution",
  "Projektfracht",
  "Gefahrgut",
  "Temperaturkontrolliert",
];

const certifications = [
  "ISO 9001",
  "ISO 14001",
  "IATA",
  "FIATA",
  "C-TPAT",
  "AEO",
  "TAPA",
  "GDP",
  "HACCP",
];

export function OrganizationDetailsStep({
  organizationType,
  initialData,
  onSubmit,
}: OrganizationDetailsStepProps) {
  const [formData, setFormData] = useState<Partial<OrganizationDetails>>({
    ...initialData,
    services: initialData.services || [],
    certifications: initialData.certifications || [],
    coverageAreas: initialData.coverageAreas || [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = organizationDetailsSchema.safeParse({
      ...formData,
      organizationType,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSubmit(result.data);
  };

  const handleChange = (
    field: keyof OrganizationDetails,
    value: string | number | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const addArrayItem = (
    field: "services" | "certifications" | "coverageAreas",
    item: string
  ) => {
    if (!item.trim()) return;
    const currentArray = (formData[field] as string[]) || [];
    if (!currentArray.includes(item)) {
      handleChange(field, [...currentArray, item]);
    }
  };

  const removeArrayItem = (
    field: "services" | "certifications" | "coverageAreas",
    index: number
  ) => {
    const currentArray = (formData[field] as string[]) || [];
    handleChange(
      field,
      currentArray.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-2">
        <Badge variant="secondary" className="capitalize">
          {organizationType === "shipper" ? (
            <>
              <Building2 className="w-3 h-3 mr-1" />
              Shipper
            </>
          ) : (
            <>
              <Truck className="w-3 h-3 mr-1" />
              Spediteur
            </>
          )}
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-slate-900">
            Grundinformationen
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Unternehmensname *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Geben Sie Ihren Unternehmensnamen ein"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {organizationType === "shipper" && (
              <div className="space-y-2">
                <Label htmlFor="industry">Branche</Label>
                <Input
                  id="industry"
                  value={formData.industry || ""}
                  onChange={(e) => handleChange("industry", e.target.value)}
                  placeholder="z.B. Fertigung, Handel, Logistik"
                  className={errors.industry ? "border-red-500" : ""}
                />
                {errors.industry && (
                  <p className="text-sm text-red-600">{errors.industry}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-medium text-slate-900">
            Adressinformationen
          </h3>

          <div className="space-y-2">
            <Label htmlFor="address">Straßenadresse *</Label>
            <Textarea
              id="address"
              value={formData.address || ""}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Geben Sie Ihre Straßenadresse ein"
              rows={2}
              className={errors.address ? "border-red-500" : ""}
            />
            {errors.address && (
              <p className="text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="city">Stadt *</Label>
              <Input
                id="city"
                value={formData.city || ""}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="Stadt"
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && (
                <p className="text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Postleitzahl *</Label>
              <Input
                id="postalCode"
                value={formData.postalCode || ""}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                placeholder="PLZ"
                className={errors.postalCode ? "border-red-500" : ""}
              />
              {errors.postalCode && (
                <p className="text-sm text-red-600">{errors.postalCode}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Land *</Label>
              <Select
                value={formData.country || ""}
                onValueChange={(value) => handleChange("country", value)}
              >
                <SelectTrigger
                  className={errors.country ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Land auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && (
                <p className="text-sm text-red-600">{errors.country}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-medium text-slate-900">
            Kontaktinformationen
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefonnummer *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+49 (0) 123 456789"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website || ""}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://ihr-unternehmen.de"
                className={errors.website ? "border-red-500" : ""}
              />
              {errors.website && (
                <p className="text-sm text-red-600">{errors.website}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxNumber">Steuernummer / USt-IdNr.</Label>
            <Input
              id="taxNumber"
              value={formData.taxNumber || ""}
              onChange={(e) => handleChange("taxNumber", e.target.value)}
              placeholder="Geben Sie Ihre Steuernummer oder USt-IdNr. ein"
              className={errors.taxNumber ? "border-red-500" : ""}
            />
            {errors.taxNumber && (
              <p className="text-sm text-red-600">{errors.taxNumber}</p>
            )}
          </div>
        </div>

        {organizationType === "shipper" && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-slate-900">
              Geschäftsdetails
            </h3>
            <div className="space-y-2">
              <Label htmlFor="industry">Branche</Label>
              <Input
                id="industry"
                value={formData.industry || ""}
                onChange={(e) => handleChange("industry", e.target.value)}
                placeholder="z.B. Fertigung, Handel, Logistik"
                className={errors.industry ? "border-red-500" : ""}
              />
              {errors.industry && (
                <p className="text-sm text-red-600">{errors.industry}</p>
              )}
            </div>
          </div>
        )}

        {organizationType === "forwarder" && (
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-slate-900">
                Angebotene Dienstleistungen
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {forwarderServices.map((service) => (
                  <Button
                    key={service}
                    type="button"
                    variant={
                      ((formData.services as string[]) || []).includes(service)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    className="justify-start"
                    onClick={() => {
                      const currentServices =
                        (formData.services as string[]) || [];
                      if (currentServices.includes(service)) {
                        handleChange(
                          "services",
                          currentServices.filter((s) => s !== service)
                        );
                      } else {
                        handleChange("services", [...currentServices, service]);
                      }
                    }}
                  >
                    {service}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-medium text-slate-900">
                Zertifizierungen
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {certifications.map((cert) => (
                  <Button
                    key={cert}
                    type="button"
                    variant={
                      ((formData.certifications as string[]) || []).includes(
                        cert
                      )
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    className="justify-start"
                    onClick={() => {
                      const currentCerts =
                        (formData.certifications as string[]) || [];
                      if (currentCerts.includes(cert)) {
                        handleChange(
                          "certifications",
                          currentCerts.filter((c) => c !== cert)
                        );
                      } else {
                        handleChange("certifications", [...currentCerts, cert]);
                      }
                    }}
                  >
                    {cert}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-medium text-slate-900">
                Abdeckungsgebiete
              </h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Abdeckungsgebiet hinzufügen (z.B. Europa, Asien-Pazifik)"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addArrayItem("coverageAreas", e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget
                        .previousElementSibling as HTMLInputElement;
                      addArrayItem("coverageAreas", input.value);
                      input.value = "";
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {((formData.coverageAreas as string[]) || []).map(
                    (area, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {area}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 w-4 h-4"
                          onClick={() =>
                            removeArrayItem("coverageAreas", index)
                          }
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <Button type="submit" className="w-full" size="lg">
          Zur Überprüfung weiter
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>
    </div>
  );
}
