"use client"

import { trpc } from "@/trpc/client"
import { columns } from "./data-table/columns"
import { DataTable } from "./data-table/data-table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { processInquiryData } from "./data-utils"
import { useMemo } from "react"

const InquiryView = () => {
  const [rawData, { error }] = trpc.inquiry.forwarder.getMyInquiries.useSuspenseQuery()

  // Process data on client side for better performance
  const data = useMemo(() => {
    if (!rawData) return []
    return rawData.map(processInquiryData).filter(Boolean)
  }, [rawData])

  if (error) {
    return (
      <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Fehler beim Laden der Frachtanfragen: {error.message}
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
      <DataTable data={data} columns={columns}/>
    </div>
  )
}

export default InquiryView