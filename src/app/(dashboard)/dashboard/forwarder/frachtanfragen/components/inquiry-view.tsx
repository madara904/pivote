"use client"

import { trpc } from "@/trpc/client"
import { columns } from "./data-table/columns"
import { DataTable } from "./data-table/data-table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import InquiryHeader from "./inquiry-header"

const InquiryView = () => {

  // Use the prefetched data - this will be immediately available
  const { data, isError, error } = trpc.inquiry.forwarder.getMyInquiriesFast.useQuery()

  // state für Filter, Sortierung, Suche

  if (isError) {
    return (
      <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Fehler beim Laden der Frachtanfragen: {error?.message || 'Unbekannter Fehler'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
        <div className="text-center py-8 text-muted-foreground">
          Keine Frachtanfragen gefunden.
        </div>
      </div>
    )
  }


  return (
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
      <InquiryHeader />
      <DataTable data={data} columns={columns}/>
    </div>
  )
}

export default InquiryView