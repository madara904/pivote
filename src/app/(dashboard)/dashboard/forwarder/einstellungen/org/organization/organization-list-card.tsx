"use client";

import { Edit3, Trash2, Loader2, } from "lucide-react";
import { Button } from "@/components/ui/button";

import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

export interface OrganizationListItem {
  id: string;
  name: string;
  email: string;
  type: string;
  membershipRole?: string | null;
}

interface OrganizationListCardProps {
  organizations: OrganizationListItem[] | undefined;
  isLoading: boolean;
  errorMessage?: string | null;
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
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  deletePending,
}: OrganizationListCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 border-b border-border/50">
      {/* Linke Spalte: Info */}
      <div>
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          Meine Organisation
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Verwalten Sie die Unternehmen, in denen Sie Mitglied sind.
        </p>
      </div>

      {/* Rechte Spalte: Die Liste (nimmt 2 Spalten ein) */}
      <div className="md:col-span-2 space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Lade Organisationen...
          </div>
        ) : errorMessage ? (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
            {errorMessage}
          </div>
        ) : organizations && organizations.length > 0 ? (
          <div className="rounded-xl border bg-card overflow-hidden divide-y">
            {organizations.map((org) => (
              <div 
                key={org.id} 
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold leading-none">{org.name}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => onEdit(org.id)}
                    disabled={!canEdit(org)}
                    title="Bearbeiten"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  {canDelete(org) ? (
                    <ConfirmationDialog
                      title="Organisation löschen"
                      description={`Möchten Sie die Organisation "${org.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden. Alle Daten, Mitglieder und Verbindungen werden permanent gelöscht.`}
                      confirmText="Organisation löschen"
                      cancelText="Abbrechen"
                      variant="destructive"
                      onConfirm={() => onDelete(org.id)}
                      disabled={deletePending}
                      loading={deletePending}
                      loadingText="Löschen..."
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={deletePending || !canDelete(org)}
                        title="Löschen"
                      >
                        {deletePending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </ConfirmationDialog>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={true}
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed rounded-xl">
            <p className="text-sm text-muted-foreground">Keine Organisationen gefunden.</p>
          </div>
        )}
      </div>
    </div>
  );
}