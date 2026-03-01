"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Shield, ShieldCheck, ShieldOff } from "lucide-react";
import { SettingsCard } from "../settings-card";

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
    <SettingsCard
      title="Multi-Faktor-Authentifizierung"
      description="Schützen Sie Ihr Konto mit einem zusätzlichen Sicherheitsfaktor."
      icon={Shield}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {twoFactorEnabled ? (
            <>
              <ShieldCheck className="size-4 text-emerald-600" />
              <span className="text-[12px] font-medium text-foreground">Aktiv</span>
            </>
          ) : (
            <>
              <ShieldOff className="size-4 text-muted-foreground" />
              <span className="text-[12px] text-muted-foreground">Inaktiv</span>
            </>
          )}
        </div>

        {!twoFactorEnabled && (
          <>
            <p className="text-[12px] text-muted-foreground">
              Bei jeder Anmeldung senden wir einen Einmal-Code an Ihre E-Mail-Adresse.
            </p>
            <Input
              className="text-[13px] h-10"
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
              className="font-bold text-[11px]"
            >
              {isEnabling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              2FA aktivieren
            </Button>
          </>
        )}

        {twoFactorEnabled && (
          <>
            <p className="text-[12px] text-muted-foreground">
              2FA ist aktiv. Einmal-Codes werden an Ihre E-Mail-Adresse gesendet.
            </p>
            <Input
              className="text-[13px] h-10"
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
              className="font-bold text-[11px]"
            >
              {isDisabling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              2FA deaktivieren
            </Button>
          </>
        )}
      </div>
    </SettingsCard>
  );
}
