import { requireForwarderAccess } from "@/lib/auth-utils";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { Suspense } from "react";
import InquiryDetailsView from "./inquiry-details-view";
import { InquiryDetailsLoadingState } from "./inquiry-details-loading-state";

export default async function InquiryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireForwarderAccess();
  const { id } = await params;

  // Prefetch the inquiry detail data
  void prefetch(trpc.inquiry.forwarder.getInquiryDetail.queryOptions({ inquiryId: id }));

  return (
    <HydrateClient>
      <Suspense fallback={<InquiryDetailsLoadingState />}>
        <InquiryDetailsView inquiryId={id} />
      </Suspense>
    </HydrateClient>
  );
}

