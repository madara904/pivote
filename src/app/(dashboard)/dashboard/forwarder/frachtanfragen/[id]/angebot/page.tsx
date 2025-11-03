import { requireForwarderAccess } from "@/lib/auth-utils";
import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { QuoteFormView } from "./quote-form-view";
import { QuoteFormLoadingState } from "./quote-form-loading-state";

export default async function CreateQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireForwarderAccess();
  const { id } = await params;

  // Prefetch the inquiry detail to get the reference number
  trpc.inquiry.forwarder.getInquiryDetail.prefetch({ inquiryId: id });

  return (
    <HydrateClient>
      <Suspense fallback={<QuoteFormLoadingState />}>
        <QuoteFormView inquiryId={id} />
      </Suspense>
    </HydrateClient>
  );
}
