"use client";

import Image from "next/image";
import { UploadButton } from "@/lib/uploadthing/uploadthing-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface OrganizationLogoCardProps {
  selectedOrgId: string | null;
  selectedOrgName?: string | null;
  selectedOrgLogo?: string | null;
  selectedOrgIsOwner: boolean;
  hasOrganizations: boolean;
  onLogoUploaded: (url: string) => void;
  onLogoError: (message: string) => void;
}

export default function OrganizationLogoCard({
  selectedOrgId,
  selectedOrgName,
  selectedOrgLogo,
  selectedOrgIsOwner,
  hasOrganizations,
  onLogoUploaded,
  onLogoError,
}: OrganizationLogoCardProps) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Logo</CardTitle>
        <CardDescription>
          {selectedOrgName
            ? `Laden Sie ein Logo für ${selectedOrgName} hoch oder ändern Sie das bestehende Logo.`
            : "Laden Sie ein Logo für Ihre Organisation hoch."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedOrgId && selectedOrgName ? (
          selectedOrgLogo ? (
            <div className="flex items-start gap-6">
              <div className="relative w-48 h-48 border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Image
                  src={selectedOrgLogo}
                  alt={`${selectedOrgName} Logo`}
                  fill
                  className="object-contain p-4"
                  unoptimized
                  onError={(e) => {
                    console.error("Image load error:", e);
                  }}
                />
              </div>
              <div className="flex flex-col justify-end h-48">
                {selectedOrgIsOwner ? (
                  <UploadButton
                    endpoint="organizationLogo"
                    className="ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90 ut-button:rounded-md ut-button:px-4 ut-button:py-2 ut-button:font-medium ut-button:transition-colors ut-allowed-content:text-muted-foreground ut-allowed-content:text-xs"
                    appearance={{
                      button: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                      allowedContent: "text-xs text-muted-foreground mt-1",
                      container: "w-full",
                    }}
                    content={{
                      button: ({ ready, isUploading }) => {
                        if (isUploading) return "Wird hochgeladen...";
                        if (!ready) return "Vorbereitung...";
                        return "Logo ändern";
                      },
                      allowedContent: ({ ready }) => {
                        if (!ready) return "Bereite vor...";
                        return "Max. 2MB • PNG, JPG, GIF";
                      },
                    }}
                    headers={{
                      "x-organization-id": selectedOrgId,
                    }}
                    onClientUploadComplete={(res) => {
                      if (res && res[0]?.url) {
                        onLogoUploaded(res[0].url);
                      } else {
                        onLogoError("Fehler: Ungültige Antwort vom Upload-Server");
                      }
                    }}
                    onUploadError={(error: Error) => {
                      onLogoError(`Fehler beim Hochladen: ${error.message}`);
                    }}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nur der Besitzer kann das Logo ändern.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedOrgIsOwner ? (
                <UploadButton
                  endpoint="organizationLogo"
                  className="ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90 ut-button:rounded-md ut-button:px-4 ut-button:py-2 ut-button:font-medium ut-button:transition-colors ut-allowed-content:text-muted-foreground ut-allowed-content:text-xs"
                  appearance={{
                    button: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                    allowedContent: "text-xs text-muted-foreground mt-1",
                    container: "w-full",
                  }}
                  content={{
                    button: ({ ready, isUploading }) => {
                      if (isUploading) return "Wird hochgeladen...";
                      if (!ready) return "Vorbereitung...";
                      return "Logo hochladen";
                    },
                    allowedContent: ({ ready }) => {
                      if (!ready) return "Bereite vor...";
                      return "Max. 2MB • PNG, JPG, GIF";
                    },
                  }}
                  headers={{
                    "x-organization-id": selectedOrgId,
                  }}
                  onClientUploadComplete={(res) => {
                    if (res && res[0]?.url) {
                      onLogoUploaded(res[0].url);
                    } else {
                      onLogoError("Fehler: Ungültige Antwort vom Upload-Server");
                    }
                  }}
                  onUploadError={(error: Error) => {
                    onLogoError(`Fehler beim Hochladen: ${error.message}`);
                  }}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nur der Besitzer kann das Logo hochladen.
                </p>
              )}
            </div>
          )
        ) : hasOrganizations ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Lade Organisationen...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Erstellen Sie zuerst eine Organisation, um ein Logo hochzuladen.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
