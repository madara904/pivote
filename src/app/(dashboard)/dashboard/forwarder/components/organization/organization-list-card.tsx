"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Organisationen</CardTitle>
        <CardDescription>Wähle eine Organisation zum Bearbeiten.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div>Lade...</div>
        ) : errorMessage ? (
          <div className="text-red-600">Fehler: {errorMessage}</div>
        ) : organizations && organizations.length > 0 ? (
          <ul className="space-y-2">
            {organizations.map((org) => (
              <li key={org.id} className="border rounded-lg p-3 flex items-center justify-between">
                <span>
                  <b>{org.name}</b>{" "}
                  <span className="text-xs text-muted-foreground">({org.type})</span>
                  <br />
                  <span className="text-xs text-muted-foreground">{org.email}</span>
                </span>
                <span className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(org.id)}
                    disabled={!canEdit(org)}
                  >
                    Bearbeiten
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(org.id)}
                    disabled={deletePending || !canDelete(org)}
                  >
                    Löschen
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div>Keine Organisationen gefunden.</div>
        )}
      </CardContent>
    </Card>
  );
}
