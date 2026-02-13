"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { QuoteForm } from "../../components/quote-form";
import { PageContainer } from "@/components/ui/page-layout";

export function QuoteFormView({ inquiryId }: { inquiryId: string }) {
  const trpcOptions = useTRPC();
  const { data: detail } = useSuspenseQuery(trpcOptions.inquiry.forwarder.getInquiryDetail.queryOptions({
    inquiryId,
  }));

  const inquiry = detail.inquiry;

  return (
    <PageContainer>
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-6">
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
      <QuoteForm inquiryId={inquiryId} inquiryReference={inquiry.referenceNumber} />
    </PageContainer>
  );
}
