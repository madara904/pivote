"use client";

import { type ActivityFeedItem, buildActivityEntry } from "./activity-formatters";
import { Zap } from "lucide-react";

type ActivityAndQuickActionsProps = {
  activityItems: ActivityFeedItem[];
  generatedAt: string | Date;
};

export function ActivityAndQuickActions({ activityItems, generatedAt }: ActivityAndQuickActionsProps) {
    const referenceNowMs = new Date(generatedAt).getTime();
    const entries = activityItems.map((item) => buildActivityEntry(item, referenceNowMs));
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 lg:mx-auto lg:w-full mt-12 pb-20">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Aktivitäten</h3>
          </div>
          <div className="space-y-4">
            {entries.length === 0 ? (
              <div className="p-6 border border-dashed rounded-xl text-sm text-muted-foreground">
                Noch keine Aktivitäten vorhanden.
              </div>
            ) : (
              entries.map((item) => (
                <div key={item.id} className="group flex items-center justify-between p-3 bg-slate-50/10 border border-transparent hover:border-border hover:bg-background transition-all cursor-pointer">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-muted-foreground/40 uppercase">{item.time}</span>
                    <span className="text-sm font-bold text-slate-900 tracking-tight">{item.message}</span>
                  </div>
                  <div className="text-right">
                    {item.detailPrimary && (
                      <div className="text-xs font-black text-primary">{item.detailPrimary}</div>
                    )}
                    {item.detailSecondary && (
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{item.detailSecondary}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="group relative overflow-hidden p-6 border bg-background hover:border-primary transition-colors cursor-pointer shadow-sm">
             <div className="relative z-10 flex flex-col h-full justify-between">
               <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Dringend</h4>
                  <p className="text-xl font-black tracking-tighter">3 Ablaufende Angebote</p>
               </div>
             </div>
             <Zap className="absolute -right-4 -bottom-4 h-24 w-24 text-slate-100 group-hover:text-orange-50 transition-colors" />
          </div>
          <div className="group relative overflow-hidden p-6 border bg-slate-900 text-white transition-colors cursor-pointer shadow-sm">
             <div className="relative z-10 flex flex-col h-full justify-between">
               <div className="h-2 w-2 rounded-full bg-primary" />
               <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/80 mb-1">Aktion erforderlich</h4>
                  <p className="text-xl font-black tracking-tighter">Neue Verbindungsanfrage</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    );
  }