"use client";

import { type ActivityFeedItem, buildActivityEntry } from "./activity-formatters";
import { Zap, ArrowRight, UserPlus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type ActivityAndQuickActionsProps = {
  activityItems: ActivityFeedItem[];
  generatedAt: string | Date;
};

export function ActivityAndQuickActions({ activityItems, generatedAt }: ActivityAndQuickActionsProps) {
  const referenceNowMs = new Date(generatedAt).getTime();
  const entries = activityItems.map((item) => buildActivityEntry(item, referenceNowMs));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12 pb-20">
      
      {/* ACTIVITIES LOG */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Ereignis-Protokoll</h3>
          <Clock size={12} className="text-muted-foreground/40" />
        </div>
        
        <div className="divide-y divide-border/40">
          {entries.length === 0 ? (
            <div className="py-8 border border-dashed border-border/60 text-[10px] uppercase tracking-widest text-muted-foreground text-center">
              Keine aktuellen Ereignisse.
            </div>
          ) : (
            entries.map((item) => (
              <div key={item.id} className="group flex items-center justify-between py-5 hover:bg-muted/30 transition-all cursor-pointer px-3 -mx-3 border-l-2 border-transparent hover:border-primary">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">{item.time}</span>
                  <span className="text-[13px] font-bold uppercase tracking-tight text-foreground">{item.message}</span>
                </div>
                <div className="text-right flex flex-col items-end">
                  {item.detailPrimary && (
                    <div className="text-[10px] font-bold text-primary uppercase tracking-[0.1em]">{item.detailPrimary}</div>
                  )}
                  {item.detailSecondary && (
                    <div className="text-[9px] font-medium text-muted-foreground/40 uppercase tracking-widest">{item.detailSecondary}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
