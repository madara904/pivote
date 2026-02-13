
import { requireShipperAccess } from "@/lib/auth-utils";
import {  HydrateClient, prefetch, trpc } from "@/trpc/server";
import { Suspense } from "react";
import ShipperInquiryOverview from "../components/shipper-inquiry-overview";
import { DotLoading } from "@/components/ui/dot-loading";
import { ErrorBoundary } from "@/components/error-boundary";



const ShipperInquiriesPage = async () => {
  await requireShipperAccess();
  void prefetch(trpc.inquiry.shipper.getMyInquiries.queryOptions());

  return (
    <div className="flex flex-col gap-4">
      <HydrateClient>
        <ErrorBoundary
          title="Fehler beim Laden der Frachtanfragen"
          description="Es ist ein Fehler beim Laden der Frachtanfragen aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie den Support, wenn das Problem weiterhin besteht."
        >
          <Suspense fallback={<DotLoading text="Lade Frachtanfragen" />}>
            <ShipperInquiryOverview />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </div>
  );
};

export default ShipperInquiriesPage;  