"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, Icon, Zap } from "lucide-react";
import Link from "next/link";

export const TIER_FEATURES = {
  basic: { label: "Basic", inquiries: "5", connections: "1", users: "1" },
  medium: { label: "Premium", inquiries: "20", connections: "5", users: "1" },
  advanced: { label: "Advanced", inquiries: "∞", connections: "∞", users: "5" },
} as const;

export function TierFeaturesHoverContent({ tier }: { tier: keyof typeof TIER_FEATURES }) {
  const data = TIER_FEATURES[tier];

  return (
    <div className="w-[240px] bg-background border border-border shadow-xl">
        {/* SEKTION 1: Die harten Fakten (2x2 Grid für bessere Lesbarkeit) */}
      <div className="p-4 bg-slate-50/50 border-b border-border">
        <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Plan</span>
            <Badge variant="secondary">{data.label}</Badge>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Anfragen</span>
            <span className="text-2xl font-black text-slate-900 leading-none">{data.inquiries}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Partner</span>
            <span className="text-2xl font-black text-slate-900 leading-none">{data.connections}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">User</span>
            <span className="text-2xl font-black text-slate-900 leading-none">{data.users}</span>
          </div>
        </div>
      </div>

      
      <div className="p-3 space-y-3">
        <Link
          href="/dashboard/forwarder/einstellungen/abrechnung"
          className="group flex items-center justify-between"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Plan Details</span>
          <ChevronRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
        </Link>

        {tier !== "advanced" && (
          <Button variant="default" size="sm" className="w-full">
            Jetzt upgraden!
          </Button>
        )}
      </div>
    </div>
  );
}