"use client"

import { useState } from "react"
import QuotationView from "./quotation-view"
import { ShipperInquiryTable } from "./shipper-inquiry-table"
import { 
  FixedShipperInquiry, 
  ShipperPackage
} from "@/types/trpc-inferred"
import { 
  getShipperDisplayStatus,
  ShipperStatusContext,
  ShipperInquiryStatus 
} from "@/lib/shipper-status-utils"

interface InquiryListProps {
  inquiries: FixedShipperInquiry[]
}

const InquiryList = ({ inquiries }: InquiryListProps) => {
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null)
  const [showQuotations, setShowQuotations] = useState(false)

  const handleViewQuote = (inquiryId: string) => {
    setSelectedInquiryId(inquiryId)
    setShowQuotations(true)
  }

  const calculateTotalWeight = (packages: ShipperPackage[]) => {
    return packages.reduce((total, pkg) => total + parseFloat(pkg.grossWeight), 0).toFixed(2)
  }

  const calculateTotalPieces = (packages: ShipperPackage[]) => {
    return packages.reduce((total, pkg) => total + pkg.pieces, 0)
  }

  // Transform inquiries data to match the new component interface
  const transformedInquiries = inquiries.map((inquiry) => {
    // Create shipper status context with proper type casting
    const statusContext: ShipperStatusContext = {
      inquiryStatus: inquiry.status as ShipperInquiryStatus,
      quotationCount: inquiry.quotations.length,
      hasAcceptedQuotation: inquiry.quotations.some(q => q.status === "accepted"),
      hasRejectedQuotations: inquiry.quotations.some(q => q.status === "rejected"),
      forwarderResponseSummary: inquiry.forwarderResponseSummary
    };
    
    // Get proper shipper display status
    const displayStatus = getShipperDisplayStatus(statusContext);
    
    return {
      id: inquiry.id,
      referenceNumber: inquiry.referenceNumber,
      status: displayStatus,
      sentAt: inquiry.sentToForwarders[0]?.sentAt || inquiry.createdAt,
      responseDate: inquiry.sentToForwarders.find(f => f.viewedAt)?.viewedAt ?? undefined,
      quotedPrice: inquiry.quotations.length > 0 ? Number(inquiry.quotations[0].totalPrice) : undefined,
      currency: inquiry.quotations.length > 0 ? inquiry.quotations[0].currency : "EUR",
      serviceType: inquiry.serviceType,
      serviceDetails: undefined,
      cargoType: inquiry.cargoType,
      cargoDescription: inquiry.cargoDescription,
      weight: calculateTotalWeight(inquiry.packages),
      unit: "kg",
      pieces: calculateTotalPieces(inquiry.packages),
      shipperName: inquiry.createdBy.name,
      // Use the response summary calculated in the backend
      forwarderResponseSummary: inquiry.forwarderResponseSummary,
      // Pass actual quotation data for proper cancellation logic
      quotations: inquiry.quotations,
      quotationCount: inquiry.quotations.length,
      hasAcceptedQuotation: inquiry.quotations.some(q => q.status === "accepted"),
      hasRejectedQuotations: inquiry.quotations.some(q => q.status === "rejected"),
      origin: {
        code: inquiry.originAirport,
        city: inquiry.originCity,
        country: inquiry.originCountry
      },
      destination: {
        code: inquiry.destinationAirport,
        city: inquiry.destinationCity,
        country: inquiry.destinationCountry
      }
    };
  })

  if (showQuotations && selectedInquiryId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button 
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => setShowQuotations(false)}
          >
            ← Zurück zur Übersicht
          </button>
          <h2 className="text-xl font-semibold">Angebote für Anfrage {inquiries.find(i => i.id === selectedInquiryId)?.referenceNumber}</h2>
        </div>
        <QuotationView inquiryId={selectedInquiryId} />
      </div>
    )
  }

  return (
    <ShipperInquiryTable
      inquiries={transformedInquiries}
      onViewInquiry={handleViewQuote}
      onViewQuotations={handleViewQuote}
    />
  )
}

export default InquiryList
