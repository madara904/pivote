"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import {
  FileText,
  DollarSign,
  Package,
  TrendingUp,
  Search,
  HelpCircle,
  Eye,
  Users,
  Plus,
} from "lucide-react";
import Link from "next/link";
import DashboardRating from "./dashboard-rating";

const DashboardÜbersicht = () => {

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-primary font-semibold text-lg">F</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">FreightCorp GmbH</h3>
              <p className="text-sm text-muted-foreground">
                Spedition & Logistik
              </p>
            </div>
          </div>
          <DashboardRating />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Letzte Aktualisierung:</span>
          <span className="font-medium">vor 5 Min</span>
        </div>
      </div>
      <Separator className="mt-8" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Neue Anfragen</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-foreground p-3.5 py-2 rounded-full inline-block bg-secondary">
              12
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktive Angebote
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-foreground p-3.5 py-2 rounded-full inline-block bg-secondary">
              8
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktive Aufträge
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-foreground p-3.5 py-2 rounded-full inline-block bg-secondary">
              23
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monatlicher Umsatz
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-foreground p-3.5 py-2 rounded-full inline-block bg-secondary">
              28.450 €
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schnellaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/dashboard/frachtanfragen" className="block">
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

      {/* Activity Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Inquiries */}
        <Card className="lg:col-span-2">
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

        {/* Performance Summary */}
        <Card>
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
      </div>
    </div>
  );
};

export default DashboardÜbersicht;
