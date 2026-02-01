"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ChangeEmailCard() {
  const { data, isPending } = useSession();
  const [newEmail, setNewEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const hasLoaded = useRef(false);
  const initialEmail = useRef("");
  const [hasTouched, setHasTouched] = useState(false);

  const callbackURL = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return `${window.location.origin}/dashboard/forwarder/einstellungen/account`;
  }, []);

  useEffect(() => {
    if (!hasLoaded.current && data?.user?.email) {
      setNewEmail(data.user.email);
      initialEmail.current = data.user.email;
      hasLoaded.current = true;
    }
  }, [data?.user?.email]);

  const isDirty = newEmail.trim() !== initialEmail.current.trim();

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) {
      toast.error("Bitte geben Sie eine neue E-Mail-Adresse ein.");
      return;
    }
    if (newEmail.trim() === data?.user?.email) {
      toast.error("Die neue E-Mail-Adresse ist identisch zur aktuellen.");
      return;
    }

    setIsSaving(true);
    const result = await authClient.changeEmail({
      newEmail: newEmail.trim(),
      callbackURL,
    });

    if (result.error) {
      toast.error(result.error.message || "E-Mail konnte nicht aktualisiert werden.");
    } else {
      toast.success("E-Mail-Änderung gestartet.");
      setNewEmail("");
    }

    setIsSaving(false);
  };

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>E-Mail-Adresse</CardTitle>
        <CardDescription>Aktuelle E-Mail: {data?.user?.email || "—"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Input
          value={newEmail}
          onChange={(event) => {
            if (!hasTouched) setHasTouched(true);
            setNewEmail(event.target.value);
          }}
          placeholder="neue-email@beispiel.de"
          type="email"
          disabled={isPending}
        />
      </CardContent>
      <CardFooter>
        <Button onClick={handleChangeEmail} disabled={isSaving || isPending || !hasTouched || !isDirty}>
          {isSaving ? "Senden..." : "E-Mail ändern"}
        </Button>
      </CardFooter>
    </Card>
  );
}
