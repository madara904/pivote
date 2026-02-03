import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, Target, UserPlus, Zap } from "lucide-react";

export interface StatusCardItem {
  icon: LucideIcon;
  label: string;
  value: string;
}

interface DashboardStatusCardsProps {
  cards?: StatusCardItem[];
}

const DashboardStatusCards = ({ cards }: DashboardStatusCardsProps) => {
  // Fallback to default cards if none provided
  const defaultCards: StatusCardItem[] = [
    {
      icon: Target,
      label: "Lead-Generierung",
      value: "Aktiv",
    },
    {
      icon: UserPlus,
      label: "Neue Kunden",
      value: "+8 Diesen Monat",
    },
    {
      icon: Zap,
      label: "Antwortrate",
      value: "94%",
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {displayCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-xl font-bold text-primary">{card.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStatusCards;
