"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UserMinus } from "lucide-react";

export default function OrganizationMembersCard({
  selectedOrgIsOwner,
  inviteEmail,
  onInviteEmailChange,
  onInvite,
  invitePending,
  members,
  onUpdateRole,
  onRemoveMember,
}: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
      <div>
        <h3 className="text-sm font-semibold">Teammitglieder</h3>
        <p className="text-sm text-muted-foreground mt-1">Verwalten Sie den Zugriff und die Rollen Ihrer Mitarbeiter.</p>
      </div>
      <div className="md:col-span-2 space-y-6">
        {selectedOrgIsOwner && (
          <div className="flex gap-2">
            <Input 
              placeholder="E-Mail-Adresse" 
              value={inviteEmail} 
              onChange={(e) => onInviteEmailChange(e.target.value)} 
              className="max-w-xs"
            />
            <Button onClick={onInvite} disabled={invitePending}>
              {invitePending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Einladen"}
            </Button>
          </div>
        )}
        <ul className="divide-y border rounded-lg bg-background">
          {members?.map((member: any) => (
            <li key={member.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{member.name || "Unbekannt"}</p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={member.role}
                  onChange={(e) => onUpdateRole(member.id, e.target.value)}
                  disabled={!selectedOrgIsOwner || member.role === "owner"}
                  className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="member">Mitglied</option>
                </select>
                {selectedOrgIsOwner && member.role !== "owner" && (
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => onRemoveMember(member.id)}>
                    <UserMinus className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}