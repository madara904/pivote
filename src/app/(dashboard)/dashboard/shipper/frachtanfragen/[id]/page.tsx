import { requireShipperAccess } from "@/lib/auth-utils";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { Suspense } from "react";
import InquiryDetailsView from "./inquiry-details-view";
import { InquiryDetailsLoadingState } from "./inquiry-details-loading-state";
import { ErrorBoundary } from "@/components/error-boundary";

interface ShipperInquiryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ShipperInquiryDetailPage({
  params,
}: ShipperInquiryDetailPageProps) {
  await requireShipperAccess();
  const { id } = await params;

  void prefetch(trpc.inquiry.shipper.getInquiryDetail.queryOptions({ inquiryId: id }));

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
