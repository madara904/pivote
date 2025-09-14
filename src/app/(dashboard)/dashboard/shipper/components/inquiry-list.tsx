"use client"

import { FreightInquiryTable } from "@/app/(dashboard)/dashboard/forwarder/frachtanfragen/components/data-view/freight-inquiry-table"
import { Package } from "lucide-react"
import { useState } from "react"
import QuotationView from "./quotation-view"

interface Package {
  id: string
  packageNumber: string
  description: string | null
  pieces: number
  grossWeight: string
  chargeableWeight: string | null
  length: string | null
  width: string | null
  height: string | null
  temperature: string | null
  specialHandling: string | null
  isDangerous: boolean | null
  dangerousGoodsClass: string | null
  unNumber: string | null
}

interface Forwarder {
  id: string
  forwarderOrganization: {
    id: string
    name: string
    email: string
  }
  sentAt: Date
  viewedAt?: Date
}

interface Inquiry {
  id: string
  referenceNumber: string
  title: string
  description: string | null
  serviceType: string
  originAirport: string
  originCity: string
  originCountry: string
  destinationAirport: string
  destinationCity: string
  destinationCountry: string
  cargoType: string
  cargoDescription: string | null
  readyDate: Date
  deliveryDate: Date | null
  validityDate: Date | null
  status: string
  packages: Package[]
  sentToForwarders: Forwarder[]
  quotations: Quotation[]
  createdBy: {
    id: string
    name: string
    email: string
  }
  createdAt: Date
  updatedAt: Date
}

interface InquiryListProps {
  inquiries: Inquiry[]
}

interface Quotation {
  id: string
  totalPrice: string
  currency: string
  status: string
}

const InquiryList = ({ inquiries }: InquiryListProps) => {
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null)
  const [showQuotations, setShowQuotations] = useState(false)

  const handleViewQuote = (inquiryId: string) => {
    setSelectedInquiryId(inquiryId)
    setShowQuotations(true)
  }

  const calculateTotalWeight = (packages: Package[]) => {
    return packages.reduce((total, pkg) => total + parseFloat(pkg.grossWeight), 0).toFixed(2)
  }

  const calculateTotalPieces = (packages: Package[]) => {
    return packages.reduce((total, pkg) => total + pkg.pieces, 0)
  }

  // Transform inquiries data to match the new component interface
  const transformedInquiries = inquiries.map((inquiry) => ({
    id: inquiry.id,
    referenceNumber: inquiry.referenceNumber,
    status: inquiry.status === "open" ? "quoted" : inquiry.status, // Map open to quoted for shipper view
    sentAt: inquiry.sentToForwarders[0]?.sentAt || inquiry.createdAt,
    responseDate: inquiry.sentToForwarders.find(f => f.viewedAt)?.viewedAt,
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
  }))

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
    <FreightInquiryTable
      inquiries={transformedInquiries}
      onViewQuote={handleViewQuote}
    />
  )
}

export default InquiryList
