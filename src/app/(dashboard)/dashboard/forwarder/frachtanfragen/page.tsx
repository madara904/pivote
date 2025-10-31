import { requireForwarderAccess } from "@/lib/auth-utils";
import { Separator } from "@/components/ui/separator";
import InquiryView from "./inquiry-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { InquiryLoadingState } from "./inquiry-loading-state";



export default async function ForwarderInquiriesPage() {
  await requireForwarderAccess();

  // Prefetch the inquiries data for Suspense
   trpc.inquiry.forwarder.getMyInquiriesFast.prefetch();

  return (
    <>
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl text-primary font-bold tracking-tight">
              Frachtanfragen
            </h1>
          </div>
        </div>
        <Separator />
      </div>
      <HydrateClient>
        <Suspense fallback={<InquiryLoadingState text="Lade Frachtanfragen" />}>
          <InquiryView />
        </Suspense>
      </HydrateClient>
    </>
  );
}
