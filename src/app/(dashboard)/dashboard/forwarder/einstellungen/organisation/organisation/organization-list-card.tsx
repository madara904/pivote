"use client";

import Image from "next/image";
import { Edit3, Trash2, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { SettingsCard } from "../../components/settings-card";
import { cn } from "@/lib/utils";

export interface OrganizationListItem {
  id: string;
  name: string;
  email: string;
  type: string;
  logo?: string | null;
  membershipRole?: string | null;
}

interface OrganizationListCardProps {
  organizations: OrganizationListItem[] | undefined;
  isLoading: boolean;
  errorMessage?: string | null;
  selectedOrgId: string | null;
  onSelect: (orgId: string) => void;
  canEdit: (org: OrganizationListItem) => boolean;
  canDelete: (org: OrganizationListItem) => boolean;
  onEdit: (orgId: string) => void;
  onDelete: (orgId: string) => void;
  deletePending: boolean;
}

export default function OrganizationListCard({
  organizations,
  isLoading,
  errorMessage,
  selectedOrgId,
  onSelect,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  deletePending,
}: OrganizationListCardProps) {
  return (
    <SettingsCard
      title="Meine Organisation"
      description="Verwalten Sie die Unternehmen, in denen Sie Mitglied sind."
      icon={Building2}
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground py-4">
            <Loader2 className="size-4 animate-spin" />
            Lade Organisationen...
          </div>
        ) : errorMessage ? (
          <div className="p-4 rounded-md bg-destructive/10 text-destructive text-[12px] border border-destructive/20">
            {errorMessage}
          </div>
        ) : organizations && organizations.length > 0 ? (
          <div className="border border-border overflow-hidden divide-y divide-border">
            {organizations.map((org) => (
              <div
                key={org.id}
                className={cn(
                  "p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors",
                  selectedOrgId === org.id ? "bg-muted/40" : "hover:bg-muted/30"
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(org.id)}
                  className="flex items-center gap-3 text-left w-full min-w-0"
                >
                  <div className="size-10 shrink-0 overflow-hidden border border-border bg-muted/50 flex items-center justify-center">
                    {org.logo ? (
                      <Image src={org.logo} alt={org.name} width={40} height={40} className="object-cover size-full" />
                    ) : (
                      <Building2 className="size-5 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13px] font-bold leading-none truncate">{org.name}</p>
                      {selectedOrgId === org.id && (
                        <span className="rounded-sm bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary shrink-0">
                          Ausgewählt
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{org.email}</p>
                  </div>
                </button>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => onEdit(org.id)}
                    disabled={!canEdit(org)}
                    title="Bearbeiten"
                  >
                    <Edit3 className="size-4" />
                  </Button>
                  <ConfirmationDialog
                    title="Organisation löschen"
                    description={`Möchten Sie die Organisation "${org.name}" wirklich verlassen? Diese Aktion kann nicht rückgängig gemacht werden.`}
                    confirmText="Organisation verlassen"
                    cancelText="Abbrechen"
                    variant="destructive"
                    onConfirm={() => onDelete(org.id)}
                    loading={deletePending}
                    loadingText="Wird entfernt..."
                    disabled={deletePending || !canDelete(org)}
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={deletePending || !canDelete(org)}
                      title="Löschen"
                    >
                      {deletePending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  </ConfirmationDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-border/80 bg-muted/20">
            <p className="text-[12px] text-muted-foreground">Keine Organisationen gefunden.</p>
          </div>
        )}
      </div>
    </SettingsCard>
  );
}
