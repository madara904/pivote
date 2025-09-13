import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Lock } from "lucide-react"

const DashboardPerformance = () => {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="space-y-3 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Annahmerate</span>
              <span className="font-medium text-primary">68%</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground">Kundenbewertung</span>
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-muted-foreground" />
                <span className="font-medium text-muted-foreground">Premium</span>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Aktive Verträge</span>
              <span className="font-medium text-primary">23</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default DashboardPerformance