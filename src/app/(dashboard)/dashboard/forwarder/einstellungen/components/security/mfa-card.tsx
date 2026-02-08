"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";

export default function MfaCard() {
  const { data, refetch, isPending } = useSession();
  const [password, setPassword] = useState("");
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const twoFactorEnabled = useMemo(() => {
    const user = data?.user;
    if (!user) return false;
    if ("twoFactorEnabled" in user) {
      return Boolean((user as { twoFactorEnabled?: boolean }).twoFactorEnabled);
    }
    return false;
  }, [data?.user]);

  const handleEnable = async () => {
    if (!password.trim()) {
      toast.error("Bitte geben Sie Ihr Passwort ein.");
      return;
    }

    setIsEnabling(true);
    const result = await authClient.twoFactor.enable({ password: password.trim() });
    if (result.error) {
      toast.error(result.error.message || "2FA konnte nicht aktiviert werden.");
      setIsEnabling(false);
      return;
    }
    toast.success("2FA aktiviert. Codes werden per E-Mail zugestellt.");
    setPassword("");
    await refetch();
    setIsEnabling(false);
  };

  const handleDisable = async () => {
    if (!password.trim()) {
      toast.error("Bitte geben Sie Ihr Passwort ein.");
      return;
    }

    setIsDisabling(true);
    const result = await authClient.twoFactor.disable({ password: password.trim() });
    if (result.error) {
      toast.error(result.error.message || "2FA konnte nicht deaktiviert werden.");
      setIsDisabling(false);
      return;
    }

    toast.success("2FA wurde deaktiviert.");
    setPassword("");
    await refetch();
    setIsDisabling(false);
  };

  if (!mounted) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Multi-Faktor-Authentifizierung</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Schützen Sie Ihr Konto mit einem zusätzlichen Sicherheitsfaktor.
        </p>
      </div>
      <div className="md:col-span-2 max-w-md space-y-4">
        <div className="flex items-center gap-2 text-sm">
          {twoFactorEnabled ? (
            <>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="text-foreground font-medium">Aktiv</span>
            </>
          ) : (
            <>
              <ShieldOff className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Inaktiv</span>
            </>
          )}
        </div>

        {!twoFactorEnabled && (
          <>
            <p className="text-sm text-muted-foreground">
              Bei jeder Anmeldung senden wir einen Einmal-Code an Ihre E-Mail-Adresse.
            </p>
            <Input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending || isEnabling}
            />
            <Button
              onClick={handleEnable}
              disabled={isPending || isEnabling || !password.trim()}
              size="sm"
            >
              {isEnabling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              2FA aktivieren
            </Button>
          </>
        )}

        {twoFactorEnabled && (
          <>
            <p className="text-sm text-muted-foreground">
              2FA ist aktiv. Einmal-Codes werden an Ihre E-Mail-Adresse gesendet.
            </p>
            <Input
              type="password"
              placeholder="Passwort zur Deaktivierung"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending || isDisabling}
            />
            <Button
              onClick={handleDisable}
              disabled={isPending || isDisabling || !password.trim()}
              variant="outline"
              size="sm"
            >
              {isDisabling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              2FA deaktivieren
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
