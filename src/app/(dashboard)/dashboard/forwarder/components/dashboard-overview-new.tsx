"use client";

import { Activity, Zap, Users, CalendarDays, LogInIcon as LogsIcon, DollarSign, Plane, Ship, Train, Truck, NotepadText, ChevronRight, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import React, { useEffect, useState } from "react";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { TierFeaturesHoverContent } from "./tier-features";
import { buildActivityEntry } from "./activity/activity-formatters";

const tierLabels = {
  basic: "Basic",
  medium: "Premium",
  advanced: "Advanced",
};

export default function DashboardOverviewNew() {

  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  const trpcOptions = useTRPC();
  const { data } = useSuspenseQuery(trpcOptions.dashboard.forwarder.getOverview.queryOptions({ period }));

  const { organization, tier, transportAnalysis } = data;

  const orbitRotation = useMotionValue(0);
  useEffect(() => {
    const controls = animate(orbitRotation, 360, {
      duration: 80,
      repeat: Infinity,
      ease: "linear",
    });
    return () => controls.stop();
  }, [orbitRotation]);

  const [orbitRadius, setOrbitRadius] = useState(150);
  useEffect(() => {
    const update = () => setOrbitRadius(window.innerWidth >= 768 ? 190 : 150);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  

  return (
    <div className="flex flex-col mt-5">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8 lg:gap-16 lg:mx-auto lg:w-[90%]">
      
        <div className="flex flex-col min-h-0 lg:min-h-[460px] py-4">
           <div className="flex flex-col w-full space-y-6 lg:space-y-15 lg:flex-1 lg:justify-center">
              <div className="space-y-2 shrink-0">
                <Select defaultValue="30d" value={period} onValueChange={(value) => setPeriod(value as "7d" | "30d" | "90d")} >
                  <SelectTrigger className="w-[160px] h-8 text-[11px] font-bold bg-background border-border/60">
                    <CalendarDays className="h-3.5 w-3.5 mr-2 text-muted-foreground"/>
                    <SelectValue placeholder="Zeitraum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Letzte 7 Tage</SelectItem>
                    <SelectItem value="30d">Letzte 30 Tage</SelectItem>
                    <SelectItem value="90d">Letzte 90 Tage</SelectItem>
                  </SelectContent>
                </Select>
               </div>
              
               <div className="grid grid-row md:grid-cols-2 gap-x-[3rem] gap-y-[2.5rem]">
  <MetricBlock 
    icon={<Activity className="text-emerald-500" strokeWidth={1.5} />} 
    label="Status" 
    value={data.stats.status} 
  />
  <MetricBlock 
    icon={<NotepadText className="text-slate-400" strokeWidth={1.5} />} 
    label="Anfragen" 
    value={data.stats.activeInquiries} 
    sub="aktiv" 
  />
  <MetricBlock 
    icon={<DollarSign className="text-primary" strokeWidth={1.5} />} 
    label="Umsatz" 
    value={data.stats.revenue} 
  />
  <MetricBlock 
    icon={<Zap className="text-orange-400" strokeWidth={1.5} />} 
    label="Quote" 
    value={data.stats.conversionRate} 
  />
</div>

              <div className="flex flex-row gap-6 shrink-0 pt-6">
                <Link href="/dashboard/forwarder/logs" className="group text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all flex items-start">
                  <span className="flex items-center gap-2"><LogsIcon className="h-3.5 w-3.5" /> Ereignis-Logs</span>
                  <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </Link>
                <Link href="/dashboard/forwarder/verbindungen" className="group text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all flex items-start">
                  <span className="flex items-center gap-2"><Users className="h-3.5 w-3.5" /> Partner</span>
                  <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </Link>
              </div>
           </div>
        </div>
      
        <div className="relative w-full border bg-slate-50/20 overflow-hidden flex flex-col min-h-[500px] md:min-h-[600px]">
        <DottedGlowBackground         
        opacity={0.2}
        gap={12}
        radius={1.2}
        colorLightVar="--color-neutral-500"
        glowColorLightVar="--color-neutral-600"
        colorDarkVar="--color-neutral-500"
        glowColorDarkVar="--color-neutral-600"
        backgroundOpacity={0}
        speedMin={0.3}
        speedMax={1.6}
        speedScale={2}/>
            <div className="relative z-10 p-5 mb-20 md:mb-16">
               <span className="text-[10px] md:text-md font-black uppercase tracking-widest text-secondary-foreground">Breakdown der Transportarten</span>
            </div>
            <div className="flex-1 relative flex items-center justify-center">
               <div className="relative -translate-y-12 md:-translate-y-20 flex items-center justify-center">
               <div className="absolute border-2 border-border/40 rounded-full w-[300px] h-[300px] md:w-[380px] md:h-[380px]" />

<OrbitNode 
  startAngle={-90} 
  icon={<Plane />} 
  label="Air" 
  orbitRotation={orbitRotation} 
  radius={orbitRadius} 
  count={transportAnalysis.air_freight.count} 
  percentage={transportAnalysis.air_freight.percentage} 
  active={transportAnalysis.air_freight.count > 0} 
/>

<OrbitNode 
  startAngle={0} 
  icon={<Ship />} 
  label="Ocean" 
  orbitRotation={orbitRotation} 
  radius={orbitRadius} 
  count={transportAnalysis.sea_freight.count} 
  percentage={transportAnalysis.sea_freight.percentage} 
  active={transportAnalysis.sea_freight.count > 0} 
/>

<OrbitNode 
  startAngle={90} 
  icon={<Truck />} 
  label="Road" 
  orbitRotation={orbitRotation} 
  radius={orbitRadius} 
  count={transportAnalysis.road_freight.count} 
  percentage={transportAnalysis.road_freight.percentage} 
  active={transportAnalysis.road_freight.count > 0} 
/>

<OrbitNode 
  startAngle={180} 
  icon={<Train />} 
  label="Rail" 
  orbitRotation={orbitRotation} 
  radius={orbitRadius} 
  count={transportAnalysis.rail_freight.count} 
  percentage={transportAnalysis.rail_freight.percentage} 
  active={transportAnalysis.rail_freight.count > 0} 
/>
                  <div className="relative z-20">
                     <HoverCard openDelay={200} closeDelay={100}>
                       <HoverCardTrigger asChild>
                         <div className="w-[200px] sm:w-[240px] bg-background border overflow-hidden cursor-pointer hover:border-primary/40 transition-colors shadow-xl">
                           <div className="p-3 flex items-center gap-3 bg-muted/10">
                             <div className="h-8 w-8 rounded-lg bg-background border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                               {organization.logo ? <img src={organization.logo || "/placeholder.svg"} className="h-full w-full object-cover" alt="" /> : <Building2 className="h-4 w-4 text-primary" />}
                             </div>
                             <div className="flex-1 overflow-hidden min-w-0">
                               <h4 className="text-[11px] sm:text-[12px] font-black truncate text-slate-900">{organization.name}</h4>
                             </div>
                             <Badge variant="outline" className="text-xs tracking-tight px-1.5 py-0">{tierLabels[tier as keyof typeof tierLabels]}</Badge>
                           </div>
                         </div>
                       </HoverCardTrigger>
                       <HoverCardContent side="top" align="center" className="w-auto p-0 border-border bg-background shadow-lg">
                         <TierFeaturesHoverContent tier={tier} />
                       </HoverCardContent>
                     </HoverCard>
                  </div>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function OrbitNode({ startAngle, icon, label, count, percentage, active, orbitRotation, radius }: any) {
  const x = useTransform(orbitRotation, (v: number) => {
    const angle = ((v + startAngle) * Math.PI) / 180;
    return Math.cos(angle) * radius;
  });
  const y = useTransform(orbitRotation, (v: number) => {
    const angle = ((v + startAngle) * Math.PI) / 180;
    return Math.sin(angle) * radius;
  });

  return (
    <motion.div style={{ x, y }} className="absolute top-1/2 left-1/2 z-10">
      <div className={cn("flex flex-col items-center gap-2 transition-all duration-700 -translate-x-1/2 -translate-y-1/2", active ? "opacity-100 scale-100" : "opacity-30 grayscale")}>
        <div className={cn("h-10 w-10 rounded-lg bg-primary border-2 flex items-center justify-center text-primary-foreground shadow-lg", active ? "border-primary/40 shadow-primary/20" : "border-primary/20")}>
          {React.cloneElement(icon, { size: 18, strokeWidth: 1.5, className: "text-primary-foreground" })}
        </div>
        <div className="bg-background border-2 border-border px-3 py-1.5 rounded-md shadow-sm text-center min-w-[72px]">
          <p className="text-[10px] font-black uppercase tracking-tighter leading-none mb-1 text-slate-900">{label}</p>
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-xs font-mono font-bold text-primary">{count}</span>
            <span className="w-px h-2.5 bg-border shrink-0 self-stretch" />
            <span className="text-xs font-bold text-muted-foreground">{percentage}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MetricBlock({ icon, label, value, sub }: any) {
  const displayValue = value ?? 0;
  return (
    <div className="flex items-center gap-x-4">

      <div className="flex items-center justify-center p-5 rounded-lg bg-background border border-border min-w-[64px] min-h-[64px] shrink-0">
        {React.cloneElement(icon, { size: 24 })}
      </div>
      
      <div className="flex flex-col justify-center">
        <span className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/80 leading-none mb-1">
          {label}
        </span>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-black tracking-tighter text-slate-900 leading-none">
            {displayValue}
          </p>
          {sub && (
            <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
              {sub}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function ActivityAndQuickActions() {
  const trpcOptions = useTRPC();
  const { data: activityItems } = useSuspenseQuery(
    trpcOptions.dashboard.forwarder.getActivityFeed.queryOptions({ limit: 3 })
  );

  const entries = activityItems.map((item) => buildActivityEntry(item));

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