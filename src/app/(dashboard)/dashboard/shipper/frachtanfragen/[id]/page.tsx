import { requireShipperAccess } from "@/lib/auth-utils";
import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import InquiryDetailsView from "./inquiry-details-view";
import { InquiryDetailsLoadingState } from "./inquiry-details-loading-state";

interface ShipperInquiryDetailPageProps {
  params: Promise<{ id: string }>;
}

const ShipperInquiryDetailPage = async ({ params }: ShipperInquiryDetailPageProps) => {
  await requireShipperAccess();
  const { id } = await params;

  // Prefetch the inquiry detail data
  trpc.inquiry.shipper.getInquiryDetail.prefetch({ inquiryId: id });

  return (
    <HydrateClient>
      <Suspense fallback={<InquiryDetailsLoadingState />}>
        <InquiryDetailsView inquiryId={id} />
      </Suspense>
    </HydrateClient>
  );
};

export default ShipperInquiryDetailPage;
