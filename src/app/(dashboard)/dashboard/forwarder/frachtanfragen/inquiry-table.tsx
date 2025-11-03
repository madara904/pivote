"use client"

import { useMemo } from "react"
import { createColumnHelper } from "@tanstack/react-table"
import { InquiryDataTable, type FreightInquiry } from "@/app/(dashboard)/dashboard/forwarder/frachtanfragen/components/inquiry-data-table"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { ServiceIcon } from "@/components/ui/service-icon"
import { Package } from "lucide-react"

interface InquiryTableProps {
  data: FreightInquiry[]
  className?: string
}

const columnHelper = createColumnHelper<FreightInquiry>()

export default function InquiryTable({ data, className }: InquiryTableProps) {
  const columns = useMemo(() => [
    columnHelper.accessor("referenceNumber", {
      header: () => <span className="text-xs font-semibold uppercase text-muted-foreground">Referenz</span>,
      cell: info => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{info.getValue()}</span>
          <span className="text-xs text-muted-foreground">{info.row.original.shipperName}</span>
        </div>
      )
    }),
    columnHelper.display({
      id: "service",
      header: () => <span className="text-xs font-semibold uppercase text-muted-foreground">Service</span>,
      cell: info => (
        <div className="flex items-center gap-2">
          <ServiceIcon serviceType={info.row.original.serviceType} />
          <div className="text-sm">
            <div className="font-medium">
              {info.row.original.serviceType === "air_freight" ? "Luftfracht" : info.row.original.serviceType === "sea_freight" ? "Seefracht" : info.row.original.serviceType}
            </div>
            <div className="text-xs text-muted-foreground">{info.row.original.serviceDirection === "import" ? "Import" : "Export"}</div>
          </div>
        </div>
      )
    }),
    columnHelper.display({
      id: "route",
      header: () => <span className="text-xs font-semibold uppercase text-muted-foreground">Route</span>,
      cell: info => (
        <div className="text-sm">
          <div className="font-medium">{info.row.original.origin.code} → {info.row.original.destination.code}</div>
          <div className="text-xs text-muted-foreground">{info.row.original.origin.country} → {info.row.original.destination.country}</div>
        </div>
      )
    }),
  ], [])

  if (data.length === 0) {
    return (
      <div className={className}>
        <Empty className="border border-dashed rounded-lg py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Package className="h-12 w-12 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>Keine Frachtanfragen gefunden</EmptyTitle>
            <EmptyDescription>
              Es wurden keine Frachtanfragen gefunden, die den Suchkriterien entsprechen.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <InquiryDataTable 
      data={data} 
      columns={columns} 
      className={className}
    />
  )
}


