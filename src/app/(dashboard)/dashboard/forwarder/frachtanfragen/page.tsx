import { requireForwarderAccess } from "@/lib/auth-utils";
import { PageContainer, PageHeader } from "@/components/ui/page-layout";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { InquiryLoadingState } from "./inquiry-loading-state";
import InquiryView from "./inquiry-view";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";

export default async function ForwarderInquiriesPage() {
  await requireForwarderAccess();
  void prefetch(trpc.connections.forwarder.listConnectedShippers.queryOptions());

  return (
    <PageContainer className="space-y-8">
      <PageHeader title="Frachtanfragen" />
      <HydrateClient>
        <ErrorBoundary
          title="Fehler beim Laden der Frachtanfragen"
          description="Es ist ein Fehler beim Laden der Frachtanfragen aufgetreten. Bitte versuchen Sie es später erneut."
        >
          <Suspense fallback={<InquiryLoadingState />}>
            <InquiryView />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </PageContainer>
  );
}
