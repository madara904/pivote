import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle, XCircle } from "lucide-react"

const DashboardBottom = () => {
  const quotations = [
    {
      id: "QT-2024-001",
      shipper: "TechCorp Ltd",
      service: "Express-Lieferung",
      amount: "€12,450",
      status: "ausstehend",
    },
    {
      id: "QT-2024-002",
      shipper: "AutoParts Inc",
      service: "Standard-Versand",
      amount: "€8,900",
      status: "angenommen",
    },
    {
      id: "QT-2024-003",
      shipper: "Fashion Hub",
      service: "Prioritätsfracht",
      amount: "€3,200",
      status: "eingereicht",
    },
    {
      id: "QT-2024-004",
      shipper: "Electronics Co",
      service: "Express-Lieferung",
      amount: "€15,600",
      status: "abgelehnt",
    },
  ];

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Letzte Angebote
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {quotations.map((quotation) => (
            <div key={quotation.id} className="flex items-center justify-between p-3 rounded-lg border-b">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div>
                  <p className="font-medium text-sm">{quotation.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {quotation.shipper} • {quotation.service}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium text-sm">{quotation.amount}</span>
                <Badge
                  variant={
                    quotation.status === "angenommen"
                      ? "default"
                      : quotation.status === "abgelehnt"
                        ? "destructive"
                        : "secondary"
                  }
                  className="text-xs"
                >
                  {quotation.status === "angenommen" && <CheckCircle className="w-3 h-3 mr-1" />}
                  {quotation.status === "abgelehnt" && <XCircle className="w-3 h-3 mr-1" />}
                  {quotation.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default DashboardBottom