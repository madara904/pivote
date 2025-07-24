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
    <CardContent className="p-0 w-full max-w-full overflow-x-auto">
      <div className="min-w-[320px] w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Typ</TableHead>
              <TableHead className="whitespace-nowrap">Route</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Fracht</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="hover:bg-muted/50">
              <TableCell className="whitespace-nowrap">
                <Badge variant="outline">Luftfracht</Badge>
              </TableCell>
              <TableCell className="font-medium whitespace-nowrap">LA → NYC</TableCell>
              <TableCell className="whitespace-nowrap">
                <Badge variant="secondary">Neu</Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <div className="text-sm">
                  <div>Elektronik</div>
                  <div className="text-muted-foreground">
                    12 Stk • 450 kg
                  </div>
                </div>
              </TableCell>
            </TableRow>
            <TableRow className="hover:bg-muted/50">
              <TableCell className="whitespace-nowrap">
                <Badge variant="outline">Seefracht</Badge>
              </TableCell>
              <TableCell className="font-medium whitespace-nowrap">CHI → MIA</TableCell>
              <TableCell className="whitespace-nowrap">
                <Badge>Angeboten</Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <div className="text-sm">
                  <div>Maschinen</div>
                  <div className="text-muted-foreground">3 Stk • 2.5 t</div>
                </div>
              </TableCell>
            </TableRow>
            <TableRow className="hover:bg-muted/50">
              <TableCell className="whitespace-nowrap">
                <Badge variant="outline">Luftfracht</Badge>
              </TableCell>
              <TableCell className="font-medium whitespace-nowrap">SEA → DEN</TableCell>
              <TableCell className="whitespace-nowrap">
                <Badge variant="secondary">Neu</Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap">
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
      </div>
    </CardContent>
  </Card>
  )
}

export default DashboardBottom