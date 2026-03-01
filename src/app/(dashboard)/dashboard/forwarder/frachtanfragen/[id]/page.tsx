import { requireForwarderAccess } from "@/lib/auth-utils";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { Suspense } from "react";
import InquiryDetailsView from "./inquiry-details-view";
import { InquiryDetailsLoadingState } from "./inquiry-details-loading-state";
import { ErrorBoundary } from "@/components/error-boundary";

export default async function InquiryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireForwarderAccess();
  const { id } = await params;

  void prefetch(trpc.inquiry.forwarder.getInquiryDetail.queryOptions({ inquiryId: id }));

  return (
    <HydrateClient>
      <ErrorBoundary
        title="Fehler beim Laden der Frachtanfrage"
        description="Es ist ein Fehler beim Laden der Frachtanfrage aufgetreten. Bitte versuchen Sie es später erneut."
      >
        <Suspense fallback={<InquiryDetailsLoadingState />}>
          <InquiryDetailsView inquiryId={id} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}

