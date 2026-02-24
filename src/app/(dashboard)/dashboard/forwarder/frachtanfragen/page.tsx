import { requireForwarderAccess } from "@/lib/auth-utils";
import { PageContainer, PageHeader } from "@/components/ui/page-layout";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { InquiryLoadingState } from "./inquiry-loading-state";
import InquiryView from "./inquiry-view";
import { Suspense } from "react";

export default async function ForwarderInquiriesPage() {
  await requireForwarderAccess();
  void prefetch(trpc.connections.forwarder.listConnectedShippers.queryOptions());

  return (
    <PageContainer className="space-y-8">
      <PageHeader title="Frachtanfragen" />
      <HydrateClient>
        <Suspense fallback={<InquiryLoadingState />}>
          <InquiryView />
        </Suspense>
      </HydrateClient>
    </PageContainer>
  );
}
