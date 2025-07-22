import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table ,TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Eye } from "lucide-react"


const DashboardBottom = () => {
  return (
    <Card className="lg:col-span-2 border shadow-none">
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>Letzte Anfragen</CardTitle>
      </div>
      <Button variant="ghost" size="sm">
        <Eye className="h-4 w-4 mr-2" />
        Alle anzeigen
      </Button>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Typ</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Fracht</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="hover:bg-muted/50">
            <TableCell>
              <Badge variant="outline">Luftfracht</Badge>
            </TableCell>
            <TableCell className="font-medium">LA → NYC</TableCell>
            <TableCell>
              <Badge variant="secondary">Neu</Badge>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <div>Elektronik</div>
                <div className="text-muted-foreground">
                  12 Stk • 450 kg
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-muted/50">
            <TableCell>
              <Badge variant="outline">Seefracht</Badge>
            </TableCell>
            <TableCell className="font-medium">CHI → MIA</TableCell>
            <TableCell>
              <Badge>Angeboten</Badge>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <div>Maschinen</div>
                <div className="text-muted-foreground">3 Stk • 2.5 t</div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow className="hover:bg-muted/50">
            <TableCell>
              <Badge variant="outline">Luftfracht</Badge>
            </TableCell>
            <TableCell className="font-medium">SEA → DEN</TableCell>
            <TableCell>
              <Badge variant="secondary">Neu</Badge>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <div>Textilien</div>
                <div className="text-muted-foreground">
                  8 Stk • 180 kg
                </div>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
  )
}

export default DashboardBottom