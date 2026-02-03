"use client"

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
      serviceDirection: inquiry.serviceDirection,
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

  return (
    <ShipperInquiryTable
      inquiries={transformedInquiries}
    />
  )
}

export default InquiryList
