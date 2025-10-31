"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { QuoteForm } from "../../components/quote-form";

export function QuoteFormView({ inquiryId }: { inquiryId: string }) {
  const [detail] = trpc.inquiry.forwarder.getInquiryDetail.useSuspenseQuery({
    inquiryId,
  });

  const inquiry = detail.inquiry;

  return (
    <>
      <div className="border-b border-border bg-card">
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <Link href={`/dashboard/forwarder/frachtanfragen/${inquiryId}`}>
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="min-w-0 flex-1 space-y-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground break-words">Angebot erstellen</h1>
              <p className="text-sm sm:text-base text-muted-foreground break-words">
                Für Anfrage: {inquiry.referenceNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        <QuoteForm inquiryId={inquiryId} inquiryReference={inquiry.referenceNumber} />
      </div>
    </>
  );
}
