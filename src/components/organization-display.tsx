"use client";

import { useActiveOrganization } from "@/lib/auth-client";
import {
  extractOrganizationMetadata,
  isForwarder,
  isShipper,
} from "@/lib/schemas/organization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Truck,
  MapPin,
  Phone,
  Globe,
  Package,
  Award,
  Map,
} from "lucide-react";

export function OrganizationDisplay() {
  const { data: organization } = useActiveOrganization();

  // Extract typed metadata
  const metadata = extractOrganizationMetadata(organization);

  if (!organization || !metadata) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-slate-600">No organization data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-4">
      <Card>
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isShipper(organization) ? (
              <>
                <Building2 className="w-5 h-5 text-blue-600" />
              </>
            ) : (
              <>
                <Truck className="w-5 h-5 text-green-600" />
              </>
            )}
            {organization.name}
          </CardTitle>
        </CardHeader>
      </Card>
        <CardHeader>
          <CardTitle>Organizationsdetails</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-slate-900">Adresse</h4>
              <p className="text-slate-600">
                {metadata.address}
                <br />
                {metadata.postalCode}, {metadata.city}
                <br />
                {metadata.country}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-slate-500" />
              <div>
                <h4 className="font-medium text-slate-900">Telefon</h4>
                <p className="text-slate-600">{metadata.phone}</p>
              </div>
            </div>

            {metadata.website && (
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-slate-500" />
                <div>
                  <h4 className="font-medium text-slate-900">Website</h4>
                  <p className="text-slate-600">{metadata.website}</p>
                </div>
              </div>
            )}
          </div>

          {metadata.taxNumber && (
            <div>
              <h4 className="font-medium text-slate-900">
                Steuernummer / USt-IdNr.
              </h4>
              <p className="text-slate-600">{metadata.taxNumber}</p>
            </div>
          )}

          {isShipper(organization) && metadata.industry && (
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-slate-500" />
              <div>
                <h4 className="font-medium text-slate-900">Branche</h4>
                <p className="text-slate-600">{metadata.industry}</p>
              </div>
            </div>
          )}

          {isForwarder(organization) && (
            <>
              {metadata.services && metadata.services.length > 0 && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-2 flex items-center">
                    <Package className="w-4 h-4 text-slate-500 mr-2" />
                    Dienstleistungen
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {metadata.services.map((service, index) => (
                      <Badge key={index} variant="outline">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {metadata.certifications &&
                metadata.certifications.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2 flex items-center">
                      <Award className="w-4 h-4 text-slate-500 mr-2" />
                      Zertifizierungen
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {metadata.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {metadata.coverageAreas && metadata.coverageAreas.length > 0 && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-2 flex items-center">
                    <Map className="w-4 h-4 text-slate-500 mr-2" />
                    Abdeckungsgebiete
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {metadata.coverageAreas.map((area, index) => (
                      <Badge key={index} variant="outline">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
