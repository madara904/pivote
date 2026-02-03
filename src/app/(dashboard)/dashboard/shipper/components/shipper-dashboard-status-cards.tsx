import { Card, CardContent } from "@/components/ui/card";
import { BadgeCheck, Clock, Send } from "lucide-react";

const ShipperDashboardStatusCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Send className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Heute versendet</p>
              <p className="text-xl font-bold text-primary">3 Anfragen</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Offene Antworten</p>
              <p className="text-xl font-bold text-primary">5 Spediteure</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <BadgeCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Angebote erhalten</p>
              <p className="text-xl font-bold text-primary">12 diese Woche</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShipperDashboardStatusCards;
