"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { SettingsCard } from "../settings-card";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";


export default function BillingCard() {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(trpc.dashboard.forwarder.getSubscription.queryOptions());

  const handleChangePlan = () => {
    // TODO: Polar-Integration
  };

  if (isLoading) {
    return (
      <SettingsCard
        title="Abrechnung"
        description="Ihr aktuelles Abonnement und Nutzungslimits."
        icon={CreditCard}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-[12px]">Laden…</span>
        </div>
      </SettingsCard>
    );
  }

  const tier = data?.tier ?? "basic";
  const hasLimits = tier === "basic";
  const maxOffers = data?.maxQuotationsPerMonth ?? 5;
  const quotationsThisMonth = data?.quotationsThisMonth ?? 0;

  return (
    <SettingsCard
      title="Abrechnung"
      description="Ihr aktuelles Abonnement und Nutzungslimits."
      icon={CreditCard}
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-muted/50 border border-border/60 px-4 py-3 text-[13px]">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <Badge variant="secondary" className="text-xl font-bold">{tier.charAt(0).toUpperCase() + tier.slice(1)}</Badge>
          </div>
          <ul className="mt-2 space-y-0.5 text-[12px] text-muted-foreground">
            <li>
              {hasLimits
                ? `Angebote: ${quotationsThisMonth} von ${maxOffers} diesen Monat genutzt`
                : "Angebote: Unbegrenzt"}
            </li>
            <li>
              {hasLimits ? "Verbindungen: 1" : "Verbindungen: Unbegrenzt"}
            </li>
          </ul>
          {data?.currentPeriodStart && data?.currentPeriodEnd && (
            <p className="text-[13px] text-muted-foreground mt-1.5">
              {format(new Date(data.currentPeriodStart), "d. MMM yyyy", { locale: de })} –{" "}
              {format(new Date(data.currentPeriodEnd), "d. MMM yyyy", { locale: de })}
            </p>
          )}
        </div>
        <p className="text-[12px] text-muted-foreground">
          Sie können Ihren Plan jederzeit anpassen. Bei einem Upgrade werden die neuen Limits sofort freigeschaltet.
        </p>
        <Button
          size="sm"
          variant="outline"
          className="font-bold text-[11px]"
          onClick={handleChangePlan}
          disabled
        >
          Plan wechseln
        </Button>
      </div>
    </SettingsCard>
  );
}
