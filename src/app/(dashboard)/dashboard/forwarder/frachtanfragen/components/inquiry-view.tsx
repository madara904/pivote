"use client"

import { trpc } from "@/trpc/client"
import { createColumns } from "./data-table/columns"
import { DataTable } from "./data-table/data-table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import InquiryHeader from "./inquiry-header"
import { useRouter } from "next/navigation"

// Type for inquiry data - matches the actual return type from the API
type InquiryData = {
  id: string;
  inquiryId: string;
  forwarderOrganizationId: string;
  sentAt: Date;
  viewedAt: Date | null;
  createdAt: Date;
  inquiry: {
    id: string;
    referenceNumber: string;
    title: string;
    serviceType: string;
    originCity: string;
    originCountry: string;
    destinationCity: string;
    destinationCountry: string;
    cargoType: string;
    cargoDescription: string | null;
    status: string;
    validityDate: Date | null;
    totalPieces: number;
    totalGrossWeight: string;
    totalChargeableWeight: string;
    totalVolume: string;
    shipperOrganization: {
      name: string;
      email: string;
    };
    createdBy: {
      name: string;
    };
  };
  packageSummary: {
    count: number;
    hasDangerousGoods: boolean;
    temperatureControlled: boolean;
    specialHandling: boolean;
  };
  statusDateInfo: {
    formattedSentDate: string;
    formattedViewedDate: string | null;
    statusDetail: string;
  };
  quotationStatus?: string | null;
};

const InquiryView = () => {
  const router = useRouter();

  // Use the prefetched data - this will be immediately available
  const { data, isError, error } = trpc.inquiry.forwarder.getMyInquiriesFast.useQuery()

  // Handle row click navigation
  const handleRowClick = (row: InquiryData) => {
    router.push(`/dashboard/forwarder/frachtanfragen/${row.inquiryId}`);
  };

  // Handle view detail action
  const handleViewDetail = (inquiryId: string) => {
    router.push(`/dashboard/forwarder/frachtanfragen/${inquiryId}`);
  };

  // Create columns with the view detail handler
  const columns = createColumns(handleViewDetail);

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
      <DataTable data={data} columns={columns} onRowClick={handleRowClick}/>
    </div>
  )
}

export default InquiryView