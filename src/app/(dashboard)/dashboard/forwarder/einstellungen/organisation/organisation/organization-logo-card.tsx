"use client";

import { Building2, Loader2, Pencil, Trash2, ImageIcon } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing/uploadthing-utils";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useMemo, useState } from "react";
import Image from "next/image";
import { SettingsCard } from "../../components/settings-card";

interface OrganizationLogoCardProps {
  selectedOrgId: string | null;
  selectedOrgLogo?: string | null;
  selectedOrgCanManage: boolean;
  onLogoUploaded: (url: string) => void;
  onLogoReset: (url: string | null) => void;
  onLogoError: (message: string) => void;
}

export default function OrganizationLogoCard({
  selectedOrgId,
  selectedOrgLogo,
  selectedOrgCanManage,
  onLogoUploaded,
  onLogoReset,
  onLogoError,
}: OrganizationLogoCardProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [temporaryLogo, setTemporaryLogo] = useState<string | null | undefined>(undefined);
  const [previousLogo, setPreviousLogo] = useState<string | null | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const displayedLogo = temporaryLogo === undefined ? (selectedOrgLogo ?? null) : temporaryLogo;

  const canUndo = useMemo(
    () => previousLogo !== undefined && previousLogo !== displayedLogo,
    [previousLogo, displayedLogo]
  );
  const deleteOrganizationLogo = useMutation(
    trpc.organization.deleteOrganizationLogo.mutationOptions({
      onSuccess: () => {
        toast.success("Logo erfolgreich gelöscht.");
        setTemporaryLogo(null);
        setPreviousLogo(undefined);
        queryClient.invalidateQueries(trpc.organization.getMyOrganizations.queryFilter());
      },
      onError: (error: unknown) => {
        toast.error((error as unknown as { message: string }).message);
      },
    })
  );

  if (!selectedOrgId) return null;

  return (
    <SettingsCard
      title="Organisations-Logo"
      description="Klicken Sie auf das Bild, um es zu ändern."
      icon={ImageIcon}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative group h-24 w-24 overflow-hidden border border-border bg-muted/30">
            <div className="absolute inset-0 flex items-center justify-center">
              {displayedLogo ? (
                <Image
                  src={displayedLogo}
                  alt="Logo"
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <Building2 className="size-10 text-muted-foreground/30" />
              )}
            </div>

            {selectedOrgCanManage && (
              <div className="absolute inset-0 flex cursor-pointer items-center justify-center opacity-0 transition group-hover:opacity-100 group-hover:bg-black/20">
                <UploadButton
                  endpoint="organizationLogo"
                  headers={{ "x-organization-id": selectedOrgId }}
                  onUploadBegin={() => {
                    setUploading(true);
                    setPreviousLogo(selectedOrgLogo ?? null);
                  }}
                  onClientUploadComplete={(res) => {
                    setUploading(false);
                    if (res?.[0]) {
                      setTemporaryLogo(res[0].url);
                      onLogoUploaded(res[0].url);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    setUploading(false);
                    setTemporaryLogo(undefined);
                    onLogoError(error.message);
                  }}
                  appearance={{
                    container: "absolute inset-0 w-full h-full",
                    button:
                      "w-full h-full bg-transparent border-none text-transparent after:hidden before:hidden focus-within:ring-0 cursor-pointer",
                    allowedContent: "hidden",
                  }}
                  content={{
                    button: ({ isUploading }) =>
                      isUploading ? (
                        <Loader2 className="animate-spin text-white size-6" />
                      ) : (
                        <Pencil className="text-white size-6 drop-shadow-md" />
                      ),
                  }}
                />
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {displayedLogo && selectedOrgCanManage && (
              <ConfirmationDialog
                title="Logo löschen"
                description="Möchten Sie dieses Logo wirklich löschen?"
                confirmText="Logo löschen"
                cancelText="Abbrechen"
                variant="destructive"
                onConfirm={() => deleteOrganizationLogo.mutate({ organizationId: selectedOrgId })}
                loading={deleteOrganizationLogo.isPending}
                loadingText="Wird gelöscht..."
                disabled={deleteOrganizationLogo.isPending}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[11px] font-bold text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4 mr-2" />
                  Entfernen
                </Button>
              </ConfirmationDialog>
            )}
            {canUndo && selectedOrgCanManage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTemporaryLogo(previousLogo ?? null);
                  onLogoReset(previousLogo ?? null);
                }}
                disabled={uploading || deleteOrganizationLogo.isPending}
                className="font-bold text-[11px]"
              >
                Zurücksetzen
              </Button>
            )}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">
          {selectedOrgCanManage
            ? uploading
              ? "Logo wird hochgeladen..."
              : "Quadratisch, PNG oder JPG bevorzugt."
            : "Nur Owner oder Admin können das Logo bearbeiten."}
        </p>
      </div>
    </SettingsCard>
  );
}
