"use client";

import { useState } from "react";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Calculator, Clock } from "lucide-react";
import { trpc } from "@/trpc/client";
import QuotationForm from "./quotation-form";
import { isQuotationDisabled, getQuotationButtonText, StatusContext, toInquiryStatus, toQuotationStatus } from "@/lib/status-utils";

interface QuotationModalProps {
  inquiryId: string;
  onQuotationCreated?: () => void;
  inquiryStatus?: string;
}

export default function QuotationModal({
  inquiryId,
  onQuotationCreated,
  inquiryStatus,
}: QuotationModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Check if quotation already exists
  const { data: quotationCheck, isLoading: isCheckingQuotation } = trpc.quotation.forwarder.checkQuotationExists.useQuery({
    inquiryId
  });

  const existingQuotation = quotationCheck?.quotation;
  const isEditMode = quotationCheck?.exists && existingQuotation;
  
  const context: StatusContext = {
    inquiryStatus: toInquiryStatus(inquiryStatus || "draft"),
    quotationStatus: toQuotationStatus(existingQuotation?.status)
  };
  
  const disabled = isQuotationDisabled(context);
  const buttonText = getQuotationButtonText(context);

  const handleSuccess = () => {
    setIsOpen(false);
    onQuotationCreated?.();
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  // Show loading state while checking
  if (isCheckingQuotation) {
    return (
      <Button disabled className="flex items-center gap-2">
        <Clock className="h-4 w-4 animate-spin" />
        Prüfe Angebot...
      </Button>
    );
  }

  // Don't show edit button if quotation or inquiry is rejected
  if (disabled) {
    return (
      <Button disabled className="flex items-center gap-2" variant="outline">
        <Calculator className="h-4 w-4" />
        {buttonText}
      </Button>
    );
  }

  const modalTitle = isEditMode ? "Angebot bearbeiten" : "Neues Angebot erstellen";

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
        variant={isEditMode ? "outline" : "default"}
      >
        <Calculator className="h-4 w-4" />
        {buttonText}
      </Button>

      <ResponsiveModal
        open={isOpen}
        onOpenChange={setIsOpen}
        title={modalTitle}
      >
        <QuotationForm
          inquiryId={inquiryId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </ResponsiveModal>
    </>
  );
}