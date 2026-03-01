"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UserMinus, Users, UserPlus } from "lucide-react";
import { SettingsCard } from "../../components/settings-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const inviteRowHeight = "h-10";
const selectTriggerClass =
  "min-w-[120px] border-border bg-muted/40 shadow-xs rounded-md px-3 text-[13px] focus-visible:ring-primary/20 focus-visible:ring-[3px]";

type Member = {
  id: string;
  name?: string | null;
  email: string;
  role: "owner" | "admin" | "member";
};

interface OrganizationMembersCardProps {
  selectedOrgIsOwner: boolean;
  inviteEmail: string;
  inviteRole: "admin" | "member";
  onInviteEmailChange: (value: string) => void;
  onInviteRoleChange: (value: "admin" | "member") => void;
  onInvite: () => void;
  invitePending: boolean;
  members?: Member[];
  membersLoading?: boolean;
  membersError?: string;
  onUpdateRole: (memberId: string, role: "admin" | "member") => void;
  onRemoveMember: (memberId: string) => void;
  removePending?: boolean;
}

function getInitials(name?: string | null, email?: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0]?.toUpperCase() ?? "";
  }
  if (email) return email[0]?.toUpperCase() ?? "?";
  return "?";
}

function roleLabel(role: string) {
  switch (role) {
    case "owner": return "Owner";
    case "admin": return "Admin";
    default: return "Mitglied";
  }
}

export default function OrganizationMembersCard({
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
  removePending = false,
}: OrganizationMembersCardProps) {
  return (
    <SettingsCard
      title="Teammitglieder"
      description="Verwalten Sie den Zugriff und die Rollen Ihrer Mitarbeiter."
      icon={Users}
    >
      <div className="space-y-6">
        {selectedOrgIsOwner && (
          <div className="space-y-3">
            <div className={cn("flex flex-col sm:flex-row gap-2 items-stretch sm:items-center")}>
              <Input
                type="email"
                placeholder="E-Mail-Adresse des Nutzers"
                value={inviteEmail}
                onChange={(e) => onInviteEmailChange(e.target.value)}
                className={cn("sm:max-w-xs text-[13px]", inviteRowHeight)}
              />
              <Select
                value={inviteRole}
                onValueChange={(v) => onInviteRoleChange(v as "admin" | "member")}
                disabled={invitePending}
              >
                <SelectTrigger className={cn(selectTriggerClass, "w-full sm:w-auto flex-1 sm:flex-initial", inviteRowHeight, "min-h-10")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Mitglied</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={onInvite}
                disabled={invitePending || !inviteEmail.trim()}
                className={cn("font-bold text-[11px] shrink-0", inviteRowHeight)}
              >
                {invitePending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4 mr-1.5" />}
                Einladen
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Nur Nutzer mit bestehendem Konto können eingeladen werden.
            </p>
          </div>
        )}
        {!selectedOrgIsOwner && (
          <p className="text-[11px] text-muted-foreground">
            Nur der Owner kann Mitglieder einladen und Rollen ändern.
          </p>
        )}
        {membersLoading ? (
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground py-6">
            <Loader2 className="size-4 animate-spin" />
            Lade Teammitglieder...
          </div>
        ) : membersError ? (
          <p className="text-[12px] text-destructive">{membersError}</p>
        ) : !members?.length ? (
          <div className="py-8 border border-dashed border-border/80 bg-muted/20 rounded-md text-center">
            <p className="text-[12px] text-muted-foreground">
              Noch keine Teammitglieder. Lade dein erstes Mitglied ein.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between gap-4 p-3 rounded-md border border-border bg-muted/20 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage src={undefined} alt={member.name ?? member.email} />
                    <AvatarFallback className="text-[11px] font-bold bg-muted">
                      {getInitials(member.name, member.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold truncate">{member.name || "Unbekannt"}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={member.role === "owner" ? "default" : "secondary"}
                    className={cn(
                      "text-[10px] font-bold",
                      member.role === "owner" && "bg-primary/20 text-primary"
                    )}
                  >
                    {roleLabel(member.role)}
                  </Badge>
                  {member.role !== "owner" && (
                    <>
                      <Select
                        value={member.role}
                        onValueChange={(v) => onUpdateRole(member.id, v as "admin" | "member")}
                        disabled={!selectedOrgIsOwner}
                      >
                        <SelectTrigger className={cn(selectTriggerClass, "h-8 min-w-[100px] text-[11px] px-2")}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Mitglied</SelectItem>
                        </SelectContent>
                      </Select>
                      <ConfirmationDialog
                        title="Mitglied entfernen"
                        description={`Möchten Sie ${member.name || member.email} wirklich aus der Organisation entfernen?`}
                        confirmText="Entfernen"
                        cancelText="Abbrechen"
                        variant="destructive"
                        onConfirm={() => onRemoveMember(member.id)}
                        loading={removePending}
                        loadingText="Wird entfernt..."
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-8"
                          disabled={removePending}
                          title="Mitglied entfernen"
                        >
                          <UserMinus className="size-4" />
                        </Button>
                      </ConfirmationDialog>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SettingsCard>
  );
}
