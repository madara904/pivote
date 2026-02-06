import { requireShipperAccess } from "@/lib/auth-utils";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { Suspense } from "react";
import InquiryDetailsView from "./inquiry-details-view";
import { InquiryDetailsLoadingState } from "./inquiry-details-loading-state";
import { inquiry } from "@/db/schema";

interface ShipperInquiryDetailPageProps {
  params: Promise<{ id: string }>;
}

const ShipperInquiryDetailPage = async ({ params }: ShipperInquiryDetailPageProps) => {
  await requireShipperAccess();
  const { id } = await params;

  await prefetch(trpc.inquiry.shipper.getInquiryDetail.queryOptions({ inquiryId: id }));

  return (
    <HydrateClient>
      <Suspense fallback={<InquiryDetailsLoadingState />}>
        <InquiryDetailsView inquiryId={id} />
      </Suspense>
    </HydrateClient>
  );
};

export default ShipperInquiryDetailPage;
