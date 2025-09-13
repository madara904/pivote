import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, UserPlus, Star, Zap, ArrowRight } from "lucide-react";

const DashboardGrowBusiness = () => {
  const businessTips = [
    {
      icon: UserPlus,
      title: "Netzwerk erweitern",
      description: "Verbinden Sie sich mit mehr Versendern in Ihrer Region",
    },
    {
      icon: Star,
      title: "Bewertung verbessern", 
      description: "Servicequalität und Kundenzufriedenheit steigern",
    },
    {
      icon: Zap,
      title: "Schnellere Angebote",
      description: "Antwortzeiten mit automatisierten Vorlagen reduzieren",
    },
  ];

  return (
    <Card className="mt-8 border-none">
      <CardHeader className="">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Target className="w-5 h-5" />
          Grow your Business
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {businessTips.map((tip) => (
            <div 
              key={tip.title}
              className="group cursor-pointer rounded-lg border border-dashed border-primary/30 hover:bg-primary/5 transition-all duration-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 group-hover rounded-lg flex items-center justify-center transition-colors duration-200">
                    <tip.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors duration-200">{tip.title}</h3>
                    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">{tip.description}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 ml-4" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardGrowBusiness;
