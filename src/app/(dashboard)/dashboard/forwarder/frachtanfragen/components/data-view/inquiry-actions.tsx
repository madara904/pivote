"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare, FileText, InfoIcon, X, Eye, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  canCreateQuotation,
  canRejectInquiry,
  isRejected,
  getDisplayStatus,
  StatusContext,
  toInquiryStatus,
  toQuotationStatus,
} from "@/lib/status-utils";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface InquiryActionsProps {
  status: string;
  quotationStatus?: string | null;
  onSendReminder?: (inquiryId: string) => void;
  onCreateQuote?: (inquiryId: string) => void;
  onViewInquiry?: (inquiryId: string) => void;
  onViewQuote?: (inquiryId: string) => void;
  onRejectInquiry?: (inquiryId: string) => void;
  inquiryId: string;
  className?: string;
}

export function InquiryActions({
  status,
  quotationStatus,
  onSendReminder,
  onCreateQuote,
  onViewInquiry,
  onViewQuote,
  onRejectInquiry,
  inquiryId,
  className,
}: InquiryActionsProps) {
  const context: StatusContext = {
    inquiryStatus: toInquiryStatus(status),
    quotationStatus: toQuotationStatus(quotationStatus),
  };

  const canCreate = canCreateQuotation(context);
  const canReject = canRejectInquiry(context);
  const rejected = isRejected(context);
  const displayStatus = getDisplayStatus(context);

  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
        Actions
      </h4>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:flex-col w-full">
        {canCreate && (
          <>
            {
              quotationStatus === "draft" ? (
                <Button
                  variant="edit"
                  onClick={() => onCreateQuote?.(inquiryId)}
                  className="justify-start w-full sm:flex-1 lg:w-full"
                  size="default"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Entwurf bearbeiten
                </Button>
              ) : (
              <Button
                onClick={() => onCreateQuote?.(inquiryId)}
                className="justify-start w-full sm:flex-1 lg:w-full"
                size={"default"}
              >
                <FileText className="h-4 w-4 mr-2" />
                Angebot erstellen
              </Button>
            )}
            {canReject && (
              <ConfirmationDialog
                title="Frachtanfrage ablehnen"
                description="Möchten Sie diese Frachtanfrage wirklich ablehnen? Diese Aktion kann nicht rückgängig gemacht werden."
                confirmText="Ablehnen"
                variant="destructive"
                onConfirm={() => onRejectInquiry?.(inquiryId)}
              >
                <Button
                  variant="outline"
                  className="justify-start w-full sm:flex-1 lg:w-full"
                  size="default"
                >
                  <X className="h-5 w-5 mr-2 text-destructive" />
                  Ablehnen
                </Button>
              </ConfirmationDialog>
            )}
            {status === "sent" && (
              <Button
                variant="outline"
                onClick={() => onSendReminder?.(inquiryId)}
                className="justify-start w-full sm:flex-1 lg:w-full"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Erinnerung senden
              </Button>
            )}
          </>
        )}
        {rejected &&
          (quotationStatus === "submitted" ||
            quotationStatus === "accepted") && (
            <Button
              variant="outline"
              onClick={() => onViewQuote?.(inquiryId)}
              className="justify-start w-full"
            >
              <InfoIcon className="h-4 w-4 mr-2" />
              Angebot anzeigen
            </Button>
          )}
        {(quotationStatus === "submitted" ||
          quotationStatus === "accepted") && (
          <Button
            variant="outline"
            onClick={() => onViewQuote?.(inquiryId)}
            className="justify-start w-full"
            size="sm"
          >
            <InfoIcon className="h-4 w-4 mr-2" />
            Angebot anzeigen
          </Button>
        )}
        {displayStatus === "rejected" && (
          <Button
            variant="outline"
            onClick={() => onViewInquiry?.(inquiryId)}
            className="justify-start w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            Anfrage anzeigen
          </Button>
        )}
        {status === "open" && !rejected && (
          <Button
            variant="outline"
            onClick={() => onViewInquiry?.(inquiryId)}
            className="justify-start w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            Anfrage anzeigen
          </Button>
        )}
      </div>
    </div>
  );
}
