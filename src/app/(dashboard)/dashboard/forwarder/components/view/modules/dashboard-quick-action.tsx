import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, HelpCircle } from "lucide-react";
import Link from "next/link";

const DashboardQuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Schnellaktionen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/forwarder/frachtanfragen" className="block">
            <div className="group cursor-pointer rounded-lg border p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Angebot erstellen</h3>
                  <p className="text-sm text-muted-foreground">
                    Auf Anfragen antworten
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <div className="group cursor-pointer rounded-lg border p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Sendung verfolgen</h3>
                <p className="text-sm text-muted-foreground">
                  Fortschritt überwachen
                </p>
              </div>
            </div>
          </div>

          <div className="group cursor-pointer rounded-lg border p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Support erhalten</h3>
                <p className="text-sm text-muted-foreground">
                  Hilfe kontaktieren
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardQuickActions;
