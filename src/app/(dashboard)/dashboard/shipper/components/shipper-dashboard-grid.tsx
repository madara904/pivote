import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ClipboardList, Users, MessageSquare, Plus } from "lucide-react";
import Link from "next/link";

const ShipperDashboardGrid = () => {
  const metrics = {
    openInquiries: 8,
    totalInquiries: 128,
    activeConnections: 14,
    pendingResponses: 5,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
      <Card className="lg:col-span-5">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary">
              <ClipboardList className="w-5 h-5" />
              Offene Anfragen
            </CardTitle>
          <Button asChild size="sm" variant="ghost" className="gap-2">
              <Link href="/dashboard/shipper/frachtanfragen">
                <span className="text-xs">Alle anzeigen</span>
              </Link>
            </Button>
          </div>
          <CardDescription>
            <p className="text-xs text-muted-foreground font-medium">
              Laufende Anfragen mit offenen Angeboten
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-primary">
                {metrics.openInquiries}
              </span>
              <Badge className="bg-primary text-primary-foreground">
                {Math.round((metrics.openInquiries / metrics.totalInquiries) * 100)}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-4">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Users className="w-5 h-5" />
            Verbundene Spediteure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <span className="text-2xl font-bold text-primary">
              {metrics.activeConnections}
            </span>
            <p className="text-sm text-muted-foreground">
              Aktive Partner in Ihrem Netzwerk
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="flex items-center gap-2 text-primary">
            Schnellaktionen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild className="w-full justify-start gap-2" size="sm">
            <Link href="/dashboard/shipper/frachtanfragen/neu">
              <Plus className="w-4 h-4" />
              <Separator orientation="vertical" />
              Neue Anfrage
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start gap-2" size="sm">
            <Link href="/dashboard/shipper/verbindungen">
              <Users className="w-4 h-4" />
              <Separator orientation="vertical" />
              Verbindungen
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start gap-2" size="sm">
            <Link href="/dashboard/shipper/frachtanfragen">
              <MessageSquare className="w-4 h-4" />
              <Separator orientation="vertical" />
              Angebote prüfen
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShipperDashboardGrid;
