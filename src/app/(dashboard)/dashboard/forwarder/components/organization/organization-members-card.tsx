"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, CircleAlert } from "lucide-react";

export interface OrganizationMemberItem {
  id: string;
  role: string;
  userId: string;
  name: string;
  email: string;
}

interface OrganizationMembersCardProps {
  selectedOrgId: string;
  selectedOrgIsOwner: boolean;
  inviteEmail: string;
  inviteRole: "admin" | "member";
  onInviteEmailChange: (value: string) => void;
  onInviteRoleChange: (value: "admin" | "member") => void;
  onInvite: () => void;
  invitePending: boolean;
  members: OrganizationMemberItem[] | undefined;
  membersLoading: boolean;
  membersError?: string | null;
  onUpdateRole: (memberId: string, role: "admin" | "member") => void;
  onRemoveMember: (memberId: string) => void;
  updateRolePending: boolean;
  removePending: boolean;
  message: string | null;
  messageTone: "success" | "error";
}

export default function OrganizationMembersCard({
  selectedOrgId,
  selectedOrgIsOwner,
  inviteEmail,
  inviteRole,
  onInviteEmailChange,
  onInviteRoleChange,
  onInvite,
  invitePending,
  members,
  membersLoading,
  membersError,
  onUpdateRole,
  onRemoveMember,
  updateRolePending,
  removePending,
  message,
  messageTone,
}: OrganizationMembersCardProps) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Mitglieder</CardTitle>
        <CardDescription>Verwalten Sie die Mitglieder Ihrer Organisation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedOrgIsOwner ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_140px_auto]">
              <Input
                value={inviteEmail}
                onChange={(event) => onInviteEmailChange(event.target.value)}
                placeholder="E-Mail-Adresse"
                type="email"
              />
              <select
                value={inviteRole}
                onChange={(event) => onInviteRoleChange(event.target.value as "admin" | "member")}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="member">Mitglied</option>
                <option value="admin">Admin</option>
              </select>
              <Button onClick={onInvite} disabled={invitePending}>
                {invitePending ? "Hinzufügen..." : "Hinzufügen"}
              </Button>
            </div>
            {message && (
              <Alert variant={messageTone === "error" ? "destructive" : "default"}>
                {messageTone === "error" ? (
                  <CircleAlert className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <AlertTitle>
                  {messageTone === "error" ? "Aktion fehlgeschlagen" : "Aktion erfolgreich"}
                </AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nur der Besitzer kann Mitglieder verwalten.
          </p>
        )}

        {membersLoading ? (
          <div>Lade Mitglieder...</div>
        ) : membersError ? (
          <div className="text-red-600">Fehler: {membersError}</div>
        ) : members && members.length > 0 ? (
          <ul className="space-y-2">
            {members.map((member) => (
              <li key={member.id} className="border rounded-lg p-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{member.name || "Unbekannt"}</div>
                  <div className="text-xs text-muted-foreground">{member.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={member.role}
                    onChange={(event) => onUpdateRole(member.id, event.target.value as "admin" | "member")}
                    disabled={!selectedOrgIsOwner || member.role === "owner" || updateRolePending}
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="member">Mitglied</option>
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!selectedOrgIsOwner || member.role === "owner" || removePending}
                    onClick={() => onRemoveMember(member.id)}
                  >
                    Entfernen
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div>Keine Mitglieder gefunden.</div>
        )}
      </CardContent>
    </Card>
  );
}
