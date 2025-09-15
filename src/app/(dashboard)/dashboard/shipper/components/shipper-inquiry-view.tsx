"use client"

import { trpc } from "@/trpc/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Plus, Package, Truck } from "lucide-react"
import InquiryList from "./inquiry-list"
import InquiryForm from "./inquiry-form"

const ShipperInquiryView = () => {

  // Get forwarders and inquiries
  const { data: forwardersData, isError: forwardersError, isLoading: forwardersLoading } = trpc.inquiry.shipper.getAllForwarders.useQuery();
  const { data: inquiriesData, isError: inquiriesError, isLoading: inquiriesLoading } = trpc.inquiry.shipper.getMyInquiries.useQuery();

  if (forwardersError || inquiriesError) {
    return (
      <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Fehler beim Laden der Daten: {forwardersError || inquiriesError}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (forwardersLoading || inquiriesLoading) {
    return (
      <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  // Transform forwarders data to match expected type
  const forwarders = (forwardersData || []).map(forwarder => ({
    ...forwarder,
    city: forwarder.city || '',
    country: forwarder.country || '',
    isActive: forwarder.isActive ?? true
  }))

  // Transform inquiries data to match expected type
  const inquiries = (inquiriesData || []).map(inquiry => ({
    ...inquiry,
    sentToForwarders: inquiry.sentToForwarders.map(forwarder => ({
      ...forwarder,
      viewedAt: forwarder.viewedAt ?? null
    }))
  }))

  return (
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
      <Tabs defaultValue="inquiries" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inquiries" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Meine Anfragen ({inquiries.length})
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Neue Anfrage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inquiries" className="space-y-4">
          <InquiryList inquiries={inquiries} />
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Neue Frachtanfrage erstellen
              </CardTitle>
              <CardDescription>
                Wählen Sie Spediteure aus und erstellen Sie eine neue Frachtanfrage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InquiryForm forwarders={forwarders} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ShipperInquiryView
