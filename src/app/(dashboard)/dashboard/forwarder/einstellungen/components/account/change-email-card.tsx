"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail } from "lucide-react";

export default function ChangeEmailCard() {
  const { data, isPending } = useSession();
  const [newEmail, setNewEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const hasLoaded = useRef(false);
  const initialEmail = useRef("");
  const [hasTouched, setHasTouched] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);

  const pathname = usePathname();
  const callbackURL = useMemo(() => {
    if (typeof window === "undefined") return undefined;

    return `${window.location.origin}${pathname}`;
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded.current && data?.user?.email) {
      setNewEmail(data.user.email);
      initialEmail.current = data.user.email;
      setCurrentEmail(data.user.email);
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
      toast.success("Bestätigungs-E-Mail wurde gesendet. Bitte prüfen Sie Ihr Postfach.");
      setNewEmail("");
      setHasTouched(false);
    }

    setIsSaving(false);
  };

  if (!mounted) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 border-b border-border/50">
      <div>
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          E-Mail-Adresse
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Ihre aktuelle Adresse: <span className="font-medium text-foreground">{currentEmail || data?.user?.email || "—"}</span>
        </p>
      </div>
      
      <div className="md:col-span-2 max-w-md space-y-4">
        <div className="space-y-2">
          <Input
            value={newEmail}
            onChange={(event) => {
              if (!hasTouched) setHasTouched(true);
              setNewEmail(event.target.value);
            }}
            placeholder="neue-email@beispiel.de"
            type="email"
            disabled={isPending || isSaving}
          />
          <p className="text-[12px] text-muted-foreground italic">
            Nach der Änderung müssen Sie die neue E-Mail-Adresse bestätigen, bevor sie aktiv wird.
          </p>
        </div>

        <Button 
          onClick={handleChangeEmail} 
          disabled={isSaving || isPending || !hasTouched || !isDirty}
          size="sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird gesendet...
            </>
          ) : (
            "E-Mail ändern"
          )}
        </Button>
      </div>
    </div>
  );
}