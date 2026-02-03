import { requireForwarderAccess } from "@/lib/auth-utils";
import InquiryView from "./inquiry-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { InquiryLoadingState } from "./inquiry-loading-state";
import { ErrorBoundary } from "@/components/error-boundary";

export default async function ForwarderInquiriesPage() {

  await requireForwarderAccess();
   trpc.inquiry.forwarder.getMyInquiriesFast.prefetch();


  return (
    <HydrateClient>
      <ErrorBoundary
        title="Fehler beim Laden der Frachtanfragen"
        description="Es ist ein Fehler beim Laden der Frachtanfragen aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie den Support, wenn das Problem weiterhin besteht."
      >
        <Suspense fallback={<InquiryLoadingState text="Lade Frachtanfragen" />}>
          <InquiryView />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
