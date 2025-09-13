"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  DollarSign,
  TrendingUp,
  Plus,
  BarChart3,
  Eye,
  Building2,
  FileSpreadsheet,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const DashboardAsymmetricalGrid = () => {
  // Mock data - replace with actual data from your API
  const metrics = {
    newInquiries: 12,
    totalInquiries: 156,
    monthlyRevenue: 28450, // in cents
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
      {/* Large Inquiry Card */}
      <Card className="lg:col-span-5">
        <CardHeader className="pb-3 border-b">
          <div className="flex justify-between">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Package className="w-5 h-5" />
            Neue Anfragen
          </CardTitle>
          <Button size="sm" className="gap-2" variant={"ghost"}>
                <Eye className="w-4 h-4" />
                <span className="text-xs">Alle anzeigen</span>
              </Button>
          </div>{" "}
          <CardDescription>
            {" "}
            <p className="text-xs text-muted-foreground font-medium">
              In den letzten 24 Stunden erhalten
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-primary">
                {metrics.newInquiries}
              </span>
              <Badge className="bg-primary text-primary-foreground">
                +
                {Math.round(
                  (metrics.newInquiries / metrics.totalInquiries) * 100
                )}
                %
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Card */}
      <Card className="lg:col-span-4">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="flex items-center gap-2 text-primary">
            <DollarSign className="w-5 h-5" />
            Monatlicher Umsatz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-2xl font-bold text-primary">
                €{(metrics.monthlyRevenue / 1000).toFixed(0)}K
              </span>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-primary">+12,5% vs. letzten Monat</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="lg:col-span-3">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="flex items-center gap-2 text-primary">
            Schnellaktionen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button className="w-full justify-start gap-2" size="sm">
            <Plus className="w-4 h-4" />
            <Separator orientation="vertical"/>
            Angebot erstellen
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 bg-transparent"
            size="sm"
          >
            <Building2 className="w-4 h-4" />
            <Separator orientation="vertical" />
            Organisation verwalten
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 bg-transparent"
            size="sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <Separator orientation="vertical" />
            Abrechnung
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardAsymmetricalGrid;
