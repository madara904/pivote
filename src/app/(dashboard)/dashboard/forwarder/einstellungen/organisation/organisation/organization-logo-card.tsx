"use client";

import { Building2, Loader2, Pencil, Trash2 } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing/uploadthing-utils";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface OrganizationLogoCardProps {
  selectedOrgId: string | null;
  selectedOrgLogo?: string | null;
  selectedOrgIsOwner: boolean;
  onLogoUploaded: (url: string) => void;
  onLogoError: (message: string) => void;
}

export default function OrganizationLogoCard({
  selectedOrgId,
  selectedOrgLogo,
  selectedOrgIsOwner,
  onLogoUploaded,
  onLogoError,
}: OrganizationLogoCardProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const deleteOrganizationLogo = useMutation(trpc.organization.deleteOrganizationLogo.mutationOptions({
    onSuccess: () => {
      toast.success("Logo erfolgreich gelöscht.");
      queryClient.invalidateQueries(trpc.organization.getMyOrganizations.queryFilter());
    },
    onError: (error: unknown) => {
      toast.error((error as unknown as { message: string }).message);
    },
  }));
  if (!selectedOrgId) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 border-b border-border/50">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Organisations-Logo</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Klicken Sie auf das Bild, um es zu ändern.
        </p>
      </div>

      <div className="md:col-span-2 flex flex-col gap-4">
        <div className="flex items-center gap-6">
          

          <div className="relative group h-24 w-24 rounded-xl overflow-hidden border bg-muted/20 shadow-sm border-border/50">
            

            <div className="absolute inset-0 flex items-center justify-center">
              {selectedOrgLogo ? (
                <img 
                  src={selectedOrgLogo} 
                  alt="Logo" 
                  className="h-full w-full object-cover" 
                />
              ) : (
                <Building2 className="h-10 w-10 text-muted-foreground/30" />
              )}
            </div>


            {selectedOrgIsOwner && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:bg-black/20 flex items-center justify-center cursor-pointer">
                <UploadButton
                  endpoint="organizationLogo"
                  headers={{ "x-organization-id": selectedOrgId }}
                  onClientUploadComplete={(res) => {
                    if (res?.[0]) onLogoUploaded(res[0].url);
                  }}
                  onUploadError={(error: Error) => onLogoError(error.message)}
                  appearance={{
                    container: "absolute inset-0 w-full h-full",
                    button: "w-full h-full bg-transparent border-none text-transparent after:hidden before:hidden focus-within:ring-0 cursor-pointer",
                    allowedContent: "hidden",
                  }}
                  content={{
                    button: ({ isUploading }) => 
                      isUploading ? (
                        <Loader2 className="animate-spin text-white w-6 h-6" />
                      ) : (
                        <Pencil className="text-white w-6 h-6 drop-shadow-md" />
                      ),
                  }}
                />
              </div>
            )}
          </div>
          {selectedOrgLogo && selectedOrgIsOwner && (
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
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4 mr-2" />
                Entfernen
              </Button>
            </ConfirmationDialog>
          )}
        </div>
        
        <p className="text-[12px] text-muted-foreground">
          Quadratisch, PNG oder JPG bevorzugt.
        </p>
      </div>
    </div>
  );
}