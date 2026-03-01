"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, KeyRound } from "lucide-react";
import { SettingsCard } from "../settings-card";

export default function ChangePasswordCard() {
  const { isPending } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Die neuen Passwörter stimmen nicht überein.");
      return;
    }

    setIsSaving(true);
    const result = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions,
    });

    if (result.error) {
      toast.error(result.error.message || "Fehler beim Ändern des Passworts.");
    } else {
      toast.success("Passwort erfolgreich geändert.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setIsSaving(false);
  };

  if (!mounted) return null;

  return (
    <SettingsCard
      title="Passwort ändern"
      description="Sorgen Sie für die Sicherheit Ihres Kontos durch ein starkes Passwort."
      icon={KeyRound}
    >
      <div className="space-y-4">
        <Input
          className="text-[13px] h-10"
          placeholder="Aktuelles Passwort"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          disabled={isSaving || isPending}
        />
        <Input
          className="text-[13px] h-10"
          placeholder="Neues Passwort"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={isSaving || isPending}
        />
        <Input
          className="text-[13px] h-10"
          placeholder="Neues Passwort bestätigen"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isSaving || isPending}
        />

        <div className="flex items-center gap-2 py-2">
          <Checkbox
            id="revoke"
            checked={revokeOtherSessions}
            onCheckedChange={(val) => setRevokeOtherSessions(!!val)}
          />
          <label htmlFor="revoke" className="text-[12px] text-muted-foreground cursor-pointer">
            Von allen anderen Geräten abmelden
          </label>
        </div>

        <Button
          onClick={handleChangePassword}
          disabled={isSaving || isPending || !currentPassword || !newPassword}
          size="sm"
          className="font-bold text-[11px]"
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Passwort aktualisieren
        </Button>
      </div>
    </SettingsCard>
  );
}
