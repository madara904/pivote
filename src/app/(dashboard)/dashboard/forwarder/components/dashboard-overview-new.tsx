"use client";

import { 
  Building2, 
  Activity, 
  Box, 
  Zap, 
  Users,
  CalendarDays,
  LogsIcon,
  DollarSign,
  Plane,
  Ship,
  Train,
  Truck,
  NotepadText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import React from "react";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { Separator } from "@/components/ui/separator";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

const tierLabels: Record<string, string> = {
  basic: "Basic",
  medium: "Medium",
  advanced: "Advanced",
};

export default function DashboardOverviewNew() {
  const trpcOptions = useTRPC();
  const { data } = useSuspenseQuery(trpcOptions.dashboard.forwarder.getOverview.queryOptions());

  const orgName = data.organization.name;
  const orgLogo = data.organization.logo;
  const tier = data.tier;
  const transportAnalysis = data.transportAnalysis;

  // Find the top 2 service types for active highlighting
  const sortedTypes = Object.entries(transportAnalysis)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 2)
    .map(([type]) => type);

  return (
    <div className="w-full p-10 space-y-12 sm:space-y-4 overflow-x-hidden">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {orgLogo ? (
            <div className="h-9 w-9 rounded-lg overflow-hidden border border-border/60 flex items-center justify-center shadow-lg">
              <img src={orgLogo} alt={orgName} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
          <div>
            <h1 className="text-lg sm:text-lg md:text-xl font-bold flex items-center gap-2">
              {orgName}
              <Badge variant="outline" className="text-[9px] sm:text-[9px] md:text-[11px] tracking-widest uppercase font-bold p-1.5 sm:p-1.5 md:p-2 rounded-none">
                {tierLabels[tier] || tier}
              </Badge>
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-12 items-center overflow-x-hidden">
        <div className="flex-1 space-y-5 sm:space-y-15 w-full flex flex-col">
            <div>
            <Select defaultValue="30d">
          <SelectTrigger className="w-[140px] sm:w-[140px] md:w-[160px] h-7 sm:h-7 md:h-8 text-[9px] sm:text-[9px] md:text-[11px] font-medium shadow-none m-0">
            <CalendarDays className="h-3 w-3 sm:h-3 sm:w-3 md:h-4 md:w-4"/>
            <SelectValue placeholder="Zeitraum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d" className="text-[9px] sm:text-[9px] md:text-[10px]">Letzte 7 Tage</SelectItem>
            <SelectItem value="30d" className="text-[9px] sm:text-[9px] md:text-[10px]">Letzte 30 Tage</SelectItem>
            <SelectItem value="90d" className="text-[9px] sm:text-[9px] md:text-[10px]">Letztes 90 Tage</SelectItem>
          </SelectContent>
        </Select>
            </div>
          <div className="grid grid-cols-2 gap-x-6 sm:gap-x-6 md:gap-x-12 gap-y-6 sm:gap-y-6 md:gap-y-10">
            <MetricBlock icon={<Activity className="text-emerald-500 h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5" />} label="Systemstatus" value="Online" />
            <MetricBlock icon={<NotepadText className="text-slate-600 h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5" />} label="Anfragen" value="12" sub="aktiv" />
            <MetricBlock icon={<DollarSign className="text-primary h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5" />} label="Umsatz" value="42.850 €" />
            <MetricBlock icon={<Zap className="text-orange-400 h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5" />} label="Erfolgsquote" value="64.2%" />
          </div>

          <div className="pt-6 border-t border-border flex gap-6 sm:gap-6 md:gap-8 text-[8px] sm:text-[8px] md:text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
             <a href="#" className="hover:text-primary transition-colors flex items-center gap-1.5 sm:gap-1.5 md:gap-2">
               <LogsIcon className="h-2.5 w-2.5 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3" /> Logs & Ereignisse
             </a>
             <a href="#" className="hover:text-primary transition-colors flex items-center gap-1.5 sm:gap-1.5 md:gap-2">
               <Users className="h-2.5 w-2.5 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3" /> Partnerverwaltung
             </a>
          </div>
        </div>
        
        <Separator orientation="vertical" className="h-full hidden lg:block opacity-80"/>
        
        <div className="relative flex flex-col overflow-hidden">
        <DottedGlowBackground
        className="pointer-events-none mask-radial-to-60% mask-radial-at-center"
        opacity={0.15}
        gap={12}
        radius={1.6}
        colorLightVar="--color-neutral-500"
        glowColorLightVar="--color-neutral-600"
        colorDarkVar="--color-neutral-500"
        glowColorDarkVar="--color-sky-800"
        backgroundOpacity={0}
        speedMin={0.3}
        speedMax={1.6}
        speedScale={1}
      />
      <div 
        className="absolute inset-0 opacity-[0.25] pointer-events-none" 
      />

      {/* 2. Header: Inquiry Stats */}
      <div className="relative z-10 flex justify-between mb-6 sm:mb-6 md:mb-8 p-4 sm:p-4 md:p-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[8px] sm:text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Analyse</span>
          </div>
          <h3 className="text-lg sm:text-lg md:text-xl font-bold tracking-tight text-slate-900">Transporte</h3>
        </div>
      </div>

      {/* 3. Zentrales Element: Der Service-Radar */}
      <div className="relative flex items-center justify-center min-h-[400px] md:min-h-[400px] sm:min-h-[300px] overflow-hidden w-full max-w-full">
        {/* Radar-Ringe */}
        <div className="absolute h-56 w-56 sm:h-56 sm:w-56 md:h-72 md:w-72 border border-slate-200/60 rounded-full" />
        <div className="absolute h-36 w-36 sm:h-36 sm:w-36 md:h-48 md:w-48 border border-slate-200/60 rounded-full border-dashed" />
        <div className="absolute h-16 w-16 sm:h-16 sm:w-16 md:h-24 md:w-24 border border-slate-200/60 rounded-full" />
        
        {/* Die 4 Service-Typen aus deinem Schema (serviceTypeEnum) */}
        <div className="absolute h-56 w-56 sm:h-56 sm:w-56 md:h-72 md:w-72 animate-spin-slow">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="animate-spin-reverse">
              <InquiryNode 
                icon={<Plane />} 
                label="Luftfracht" 
                count={transportAnalysis.air_freight.count.toString()} 
                percentage={`${transportAnalysis.air_freight.percentage}%`}
                active={sortedTypes.includes("air_freight")}
              />
            </div>
          </div>
          
          <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2">
            <div className="animate-spin-reverse">
              <InquiryNode 
                icon={<Ship />} 
                label="Seefracht" 
                count={transportAnalysis.sea_freight.count.toString()} 
                percentage={`${transportAnalysis.sea_freight.percentage}%`}
                active={sortedTypes.includes("sea_freight")}
              />
            </div>
          </div>
          
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
            <div className="animate-spin-reverse">
              <InquiryNode 
                icon={<Truck />} 
                label="Straßenfracht" 
                count={transportAnalysis.road_freight.count.toString()} 
                percentage={`${transportAnalysis.road_freight.percentage}%`}
                active={sortedTypes.includes("road_freight")}
              />
            </div>
          </div>
          
          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="animate-spin-reverse">
              <InquiryNode 
                icon={<Train />} 
                label="Bahnfracht" 
                count={transportAnalysis.rail_freight.count.toString()} 
                percentage={`${transportAnalysis.rail_freight.percentage}%`}
                active={sortedTypes.includes("rail_freight")}
              />
            </div>
          </div>
        </div>


        <div className="absolute h-12 w-12 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-white rounded-2xl border-slate-100 flex items-center justify-center">
          <Box className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 40s linear infinite;
        }
        
        .animate-spin-reverse {
          animation: spin-reverse 40s linear infinite;
        }
      `}</style>

    </div>

      </div>
    </div>
  );
}


function MetricBlock({ icon, label, value, sub }: any) {
  return (
    <div className="space-y-1 sm:space-y-1 md:space-y-1.5">
      <div className="flex items-center gap-1.5 sm:gap-1.5 md:gap-2">
        <div className="p-3 sm:p-3 md:p-5 rounded border">{icon}</div>
        <span className="text-[9px] sm:text-[9px] md:text-[11px] uppercase font-bold tracking-[0.15em]">{label}</span>
      </div>
      <p className="text-xl sm:text-xl md:text-2xl font-bold tracking-tighter">
        {value} {sub && <span className="text-[10px] sm:text-[10px] md:text-xs font-normal ml-1">{sub}</span>}
      </p>
    </div>
  );
}

function InquiryNode({ icon, label, count, percentage, active }: any) {
    return (
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className={`flex flex-col items-center gap-2 sm:gap-2 md:gap-3 transition-all duration-500 ${active ? 'opacity-100' : 'opacity-30'}`}
      >
        <div className={`
          h-12 w-12 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-[1.25rem] flex flex-col items-center justify-center transition-all shadow-sm border
          ${active 
            ? 'bg-white border-primary/20 text-primary shadow-primary/5' 
            : 'bg-slate-50 border-slate-200 text-slate-400'}
        `}>
          {React.cloneElement(icon, { size: 18, className: "sm:w-[18px] sm:h-[18px] md:w-5 md:h-5" })}
        </div>
        <div className="text-center space-y-0.5">
          <p className="text-[9px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-900">{label}</p>
          <div className="flex items-center justify-center gap-1.5 sm:gap-1.5 md:gap-2">
             <span className="text-[10px] sm:text-[10px] md:text-[11px] font-medium text-slate-500">{count} Anfr.</span>
             <span className="text-[9px] sm:text-[9px] md:text-[10px] px-1 sm:px-1 md:px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-600">{percentage}</span>
          </div>
        </div>
      </motion.div>
    );
  }