import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Clock } from "lucide-react";

const ShipperDashboardActivity = () => {
  const inquiries = [
    { id: "INQ-2024-102", route: "Berlin → Madrid", status: "ausstehend" },
    { id: "INQ-2024-101", route: "Hamburg → Paris", status: "angeboten" },
    { id: "INQ-2024-099", route: "Köln → Milano", status: "angenommen" },
    { id: "INQ-2024-098", route: "Düsseldorf → Oslo", status: "ausstehend" },
  ];

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Letzte Anfragen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="flex items-center justify-between p-3 rounded-lg border-b"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div>
                  <p className="font-medium text-sm">{inquiry.id}</p>
                  <p className="text-xs text-muted-foreground">{inquiry.route}</p>
                </div>
              </div>
              <Badge
                variant={
                  inquiry.status === "angenommen"
                    ? "default"
                    : inquiry.status === "angeboten"
                      ? "secondary"
                      : "outline"
                }
                className="text-xs"
              >
                {inquiry.status === "angenommen" && (
                  <CheckCircle className="w-3 h-3 mr-1" />
                )}
                {inquiry.status === "ausstehend" && (
                  <Clock className="w-3 h-3 mr-1" />
                )}
                {inquiry.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShipperDashboardActivity;
