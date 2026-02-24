"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import Link from "next/link";

export type UsageItem = {
  label: string;
  used: number;
  limit: number | null;
};

type TierFeaturesProps = {
  orgName: string;
  orgLogo?: string | null;
  tier?: "basic" | "medium" | "advanced";
  usage: UsageItem[];
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "OR";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

const tierMeta = {
  basic: { label: "Basic" },
  medium: { label: "Medium" },
  advanced: { label: "Advanced" },
} as const;

export function TierFeatures({ orgName, orgLogo, tier = "basic", usage }: TierFeaturesProps) {
  const currentTier = tierMeta[tier];

  return (
    <HoverCard openDelay={120} closeDelay={150}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className="mt-2 inline-flex items-center gap-2 bg-card px-2.5 py-1.5 text-xl font-semibold uppercase tracking-[0.2em] transition-colors hover:text-muted-foreground"
        >
          <Avatar className="size-9 border border-border/80">
            <AvatarImage src={orgLogo ?? undefined} alt={orgName} />
            <AvatarFallback className="bg-muted text-[9px] font-bold text-foreground">
              {getInitials(orgName)}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[210px] truncate">{orgName}</span>
        </button>
      </HoverCardTrigger>

      <HoverCardContent
        align="start"
        sideOffset={8}
        className="w-[300px] rounded-none border-border p-0 shadow-xl"
      >
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Plan & Limits</p>
            <span className="shrink-0 border border-border bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">
              {currentTier.label}
            </span>
          </div>
        </div>

        <div className="space-y-3 px-4 py-3.5">
          {usage.map((item) => {
            const ratio = item.limit === null || item.limit <= 0 ? 0 : Math.min(item.used / item.limit, 1);
            const limitValue = item.limit ?? 0;
            const isLimited = limitValue > 0;
            const isLimitReached = isLimited && item.used >= limitValue;

            return (
              <div key={item.label}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{item.label}</span>
                  <span className={`text-sm font-semibold tracking-tight ${isLimitReached ? "text-destructive" : "text-foreground"}`}>
                    {item.used}/{item.limit ?? "∞"}
                  </span>
                </div>
                {isLimited ? (
                  <div className="h-1.5 w-full bg-muted/80">
                    <div
                      className={`h-full transition-all ${isLimitReached ? "bg-destructive" : "bg-primary"}`}
                      style={{ width: `${ratio * 100}%` }}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="border-t border-border px-4 py-3">
          <Link
            href="/dashboard/forwarder/einstellungen/abrechnung"
            className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary transition-opacity hover:opacity-80"
          >
            Plan verwalten
          </Link>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}