"use client";

import React, { useState, useTransition } from "react";
import { Zap, TrendingUp, ArrowRight, Plus } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TierFeatures } from "@/app/(dashboard)/dashboard/forwarder/components/tier-features";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function DashboardOverviewNew() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [isPending, startTransition] = useTransition();

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.dashboard.forwarder.getHomeData.queryOptions({
      period,
      activityLimit: 3,
    }),
  );

  const { overview, activity } = data;

  const chartData = [
    {
      name: "AIR",
      total: overview.transportAnalysis.air_freight.count,
      color: "var(--primary)",
    },
    {
      name: "SEA",
      total: overview.transportAnalysis.sea_freight.count,
      color: "var(--chart-2)",
    },
    {
      name: "ROAD",
      total: overview.transportAnalysis.road_freight.count,
      color: "var(--chart-3)",
    },
    {
      name: "RAIL",
      total: overview.transportAnalysis.rail_freight.count,
      color: "var(--chart-4)",
    },
  ];

  const usageItems = [
    {
      label: "Angebote diesen Monat",
      used: overview.usage.offersThisMonth,
      limit: overview.limits.offersPerMonth,
    },
    {
      label: "Shipper-Verbindungen",
      used: overview.usage.activeConnections,
      limit: overview.limits.connections,
    },
  ];

  const handlePeriodChange = (v: "7d" | "30d" | "90d") => {
    startTransition(() => {
      setPeriod(v);
    });
  };

  return (
    <div
      className={`w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 transition-opacity duration-300 ${isPending ? "opacity-50" : "opacity-100"}`}
    >
      <div className="flex flex-col space-y-8">
        <div className="flex flex-row gap-4 sm:flex-row sm:justify-between sm:items-end">
          <div className="flex flex-row gap-4 items-center mb-4">
            <h1 className="text-3xl tracking-tight font-extralight text-muted-foreground">
              /
            </h1>
            <TierFeatures
              orgName={overview.organization.name}
              orgLogo={overview.organization.logo}
              tier={overview.tier}
              usage={usageItems}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 border border-border divide-y md:divide-y-0 md:divide-x divide-border bg-card shadow-sm">
          <StatusField label="Umsatz" value={overview.stats.revenue} />
          <StatusField
            label="Anfragen"
            value={overview.stats.activeInquiries}
          />
          <StatusField
            label="Aktive Verbindungen"
            value={overview.usage.activeConnections}
          />
          <StatusField label="Zeitraum" value={period.toUpperCase()} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 rounded-none border-border bg-card shadow-none">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-6 mb-6">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Transport-Volumen
            </CardTitle>
            <Select value={period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[110px] h-8 text-[9px] font-bold uppercase tracking-widest border-border rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="7d">7 TAGE</SelectItem>
                <SelectItem value="30d">30 TAGE</SelectItem>
                <SelectItem value="90d">90 TAGE</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  fontSize={9}
                  tick={{ fill: "var(--muted-foreground)", fontWeight: 600 }}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  contentStyle={{
                    borderRadius: "0px",
                    border: "1px solid var(--border)",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="total" barSize={32}>
                  <LabelList
                    dataKey="total"
                    position="top"
                    fill="var(--foreground)"
                    fontSize={10}
                    fontWeight={700}
                  />
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={entry.color}
                      fillOpacity={1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="col-span-2 md:col-span-1 bg-primary p-6 flex flex-col justify-between">
            <Zap className="h-5 w-5 text-lime-200 fill-current" />
            <div className="mt-8">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white mb-1">
                Quote
              </p>
              <h3 className="text-3xl font-bold tracking-tighter text-lime-200">
                {overview.stats.conversionRate}
              </h3>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 bg-card p-6 border border-border flex flex-col justify-between group cursor-pointer hover:bg-muted transition-colors">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <div className="mt-8">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">
                Tendenz
              </p>
              <h3 className="text-3xl font-bold tracking-tighter">+8.2%</h3>
            </div>
          </div>

          <div className="col-span-2 bg-card border border-border p-6 flex items-center justify-between group cursor-pointer hover:border-primary transition-all">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Netzwerk
              </p>
              <h3 className="text-xl font-bold tracking-tight uppercase">
                12 Aktive Partner
              </h3>
            </div>
            <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusField({ label, value, statusColor, trend }: any) {
  return (
    <div className="p-6 flex flex-col gap-1">
      <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </p>
      <div className="flex items-center gap-2">
        {statusColor && (
          <span className={`h-1.5 w-1.5 rounded-full ${statusColor}`} />
        )}
        <span
          className={`text-sm font-bold uppercase tracking-tight ${trend === "up" ? "text-emerald-600" : ""}`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
