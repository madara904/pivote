"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function ChangePasswordCard() {
  const { isPending } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasTouched, setHasTouched] = useState(false);

  const isReadyToSubmit =
    hasTouched && currentPassword.trim() !== "" && newPassword.trim() !== "" && confirmPassword.trim() !== "";

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Bitte füllen Sie alle Felder aus.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwörter stimmen nicht überein.");
      return;
    }

    setIsSaving(true);
    const result = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions,
    });

    if (result.error) {
      toast.error(result.error.message || "Passwort konnte nicht geändert werden.");
    } else {
      toast.success("Passwort aktualisiert.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }

    setIsSaving(false);
  };

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Passwort ändern</CardTitle>
        <CardDescription>Aktualisieren Sie Ihr Passwort für mehr Sicherheit.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          value={currentPassword}
          onChange={(event) => {
            if (!hasTouched) setHasTouched(true);
            setCurrentPassword(event.target.value);
          }}
          placeholder="Aktuelles Passwort"
          type="password"
          disabled={isPending}
        />
        <Input
          value={newPassword}
          onChange={(event) => {
            if (!hasTouched) setHasTouched(true);
            setNewPassword(event.target.value);
          }}
          placeholder="Neues Passwort"
          type="password"
          disabled={isPending}
        />
        <Input
          value={confirmPassword}
          onChange={(event) => {
            if (!hasTouched) setHasTouched(true);
            setConfirmPassword(event.target.value);
          }}
          placeholder="Neues Passwort bestätigen"
          type="password"
          disabled={isPending}
        />
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox
            checked={revokeOtherSessions}
            onCheckedChange={(value) => setRevokeOtherSessions(Boolean(value))}
            disabled={isPending}
          />
          Andere Sitzungen abmelden
        </label>
      </CardContent>
      <CardFooter>
        <Button onClick={handleChangePassword} disabled={isSaving || isPending || !isReadyToSubmit}>
          {isSaving ? "Speichern..." : "Passwort ändern"}
        </Button>
      </CardFooter>
    </Card>
  );
}
