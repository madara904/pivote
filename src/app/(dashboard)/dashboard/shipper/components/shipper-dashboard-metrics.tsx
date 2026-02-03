import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MessageSquare, Users } from "lucide-react";

const ShipperDashboardMetrics = () => {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Kennzahlen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 mt-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Antwortquote</span>
            <span className="font-medium text-primary">82%</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-muted-foreground">Ø Angebotszeit</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">1,8 Tage</span>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Angebote pro Anfrage</span>
            <span className="font-medium text-primary">3,4</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-muted-foreground">Offene Rückfragen</span>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">2</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShipperDashboardMetrics;
