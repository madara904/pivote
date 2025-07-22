import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Users } from "lucide-react"


const DashboardPerformance = () => {
  return (
    <Card className="border shadow-none">
    <CardHeader>
      <CardTitle>Leistungsübersicht</CardTitle>
      <CardDescription>
        Ihre wichtigsten Kennzahlen diesen Monat
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Angebotsgewinnrate</span>
          <span className="font-medium">73%</span>
        </div>
        <Progress value={73} className="h-2" />
        <p className="text-xs text-muted-foreground">
          +5% vom letzten Monat
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Antwortzeit</span>
          <span className="font-medium">2.3h Ø</span>
        </div>
        <Progress value={85} className="h-2" />
        <p className="text-xs text-muted-foreground">Ziel: &lt;2h</p>
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Aktive Kunden
          </span>
          <span className="font-medium">47</span>
        </div>
      </div>
    </CardContent>
  </Card>
  )
}

export default DashboardPerformance