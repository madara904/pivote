"use client"

import { trpc } from "@/trpc/client"
import { columns } from "./data-table/columns"
import { DataTable } from "./data-table/data-table"

const InquiryView = () => {
  const [data] = trpc.inquiry.forwarder.getMyInquiries.useSuspenseQuery()

  return (
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
      <DataTable data={data} columns={columns}/>
    </div>
  )
}

export default InquiryView