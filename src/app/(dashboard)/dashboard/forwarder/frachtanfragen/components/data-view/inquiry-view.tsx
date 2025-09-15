"use client";

import { trpc } from "@/trpc/client";
import { FreightInquiryTable } from "@/app/(dashboard)/dashboard/forwarder/frachtanfragen/components/data-view/freight-inquiry-table";
import InquiryHeader from "./inquiry-header";
import { useRouter } from "next/navigation";
import { QuotationModal } from "@/app/(dashboard)/dashboard/forwarder/frachtanfragen/components/data-view/quotation-modal";
import { useState } from "react";
import { toast } from "sonner";

const InquiryView = () => {
  const router = useRouter();
  const [quotationModalOpen, setQuotationModalOpen] = useState(false);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [selectedInquiryReference, setSelectedInquiryReference] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const [inquiryData] = trpc.inquiry.forwarder.getMyInquiriesFast.useSuspenseQuery(undefined, {
    staleTime: 1, // 1 second 
  });

  const handleSendReminder = (inquiryId: string) => {
    // TODO: Implement reminder functionality
    console.log("Send reminder for inquiry:", inquiryId);
  };

  const handleCreateQuote = (inquiryId: string) => {
    router.push(`/dashboard/forwarder/frachtanfragen/${inquiryId}`);
  };

  const handleViewInquiry = (inquiryId: string) => {
    // Navigate to inquiry details page
    router.push(`/dashboard/forwarder/frachtanfragen/${inquiryId}`);
  };

  const rejectInquiryMutation = trpc.inquiry.forwarder.rejectInquiry.useMutation({
    onSuccess: () => {
      toast.warning("Frachtanfrage abgelehnt!");
      utils.inquiry.forwarder.getMyInquiriesFast.invalidate();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    }
  });

  const handleRejectInquiry = (inquiryId: string) => {
    rejectInquiryMutation.mutate({ inquiryId });
  };

  const handleViewQuote = (inquiryId: string) => {
    // Find the inquiry reference number for display
    const inquiry = transformedData?.find(item => item.id === inquiryId);
    setSelectedInquiryReference(inquiry?.referenceNumber || null);
    setSelectedInquiryId(inquiryId);
    setQuotationModalOpen(true);
  };

  const closeQuotationModal = () => {
    setQuotationModalOpen(false);
    setSelectedInquiryId(null);
    setSelectedInquiryReference(null);
  };

  // Transform the data to match the FreightInquiryTable interface
  const transformedData = inquiryData?.map((item) => {
    return {
      id: item.inquiryId, 
      referenceNumber: item.inquiry.referenceNumber,
      status: item.inquiry.status, 
      quotationStatus: item.quotationStatus, 
      responseStatus: item.responseStatus,
      sentAt: item.sentAt,
      responseDate: item.viewedAt || undefined,
      quotedPrice: item.quotationPrice ? Number(item.quotationPrice) : undefined,
      currency: item.quotationCurrency || "EUR",
      serviceType: item.inquiry.serviceType,
      serviceDetails: undefined,
      cargoType: item.inquiry.cargoType,
      cargoDescription: item.inquiry.cargoDescription,
      weight: item.inquiry.totalGrossWeight,
      unit: "kg" as const,
      pieces: item.inquiry.totalPieces,
      shipperName: item.inquiry.shipperOrganization.name,
      origin: {
        code: item.inquiry.originCity,
        country: item.inquiry.originCountry
      },
      destination: {
        code: item.inquiry.destinationCity,
        country: item.inquiry.destinationCountry
      }
    };
  }) || [];

  // Handle empty state - no loading state needed with Suspense
  if (!inquiryData || inquiryData.length === 0) {
    return (
      <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
        <InquiryHeader />
        <div className="text-center py-8 text-muted-foreground">
          <img 
            src="/empty.svg" 
            alt="Keine Frachtanfragen" 
            className="h-12 w-12 mx-auto mb-4 opacity-50" 
          />
          <p>Keine Frachtanfragen gefunden.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
        <InquiryHeader />
        <FreightInquiryTable
          inquiries={transformedData}
          onSendReminder={handleSendReminder}
          onCreateQuote={handleCreateQuote}
          onViewInquiry={handleViewInquiry}
          onViewQuote={handleViewQuote}
          onRejectInquiry={handleRejectInquiry}
        />
      </div>
      
      {selectedInquiryId && (
        <QuotationModal
          isOpen={quotationModalOpen}
          onClose={closeQuotationModal}
          inquiryId={selectedInquiryId}
          inquiryReferenceNumber={selectedInquiryReference || undefined}
          onQuotationWithdrawn={closeQuotationModal}
        />
      )}
    </>
  );
};

export default InquiryView;