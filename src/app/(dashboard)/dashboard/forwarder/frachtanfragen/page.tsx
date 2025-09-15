import { requireForwarderAccess } from "@/lib/auth-utils";
import { Separator } from "@/components/ui/separator";
import InquiryView from "./components/data-view/inquiry-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { InquiryLoadingState } from "./components/inquiry-loading-state";

export default async function ForwarderInquiriesPage() {

  // Promise all für Waterfall Verkürzung, da next js Middleware keine Option ist und wir müssen die Session immernoch page level checken
  const authPromise = requireForwarderAccess();
  const dataPromise = trpc.inquiry.forwarder.getMyInquiriesFast.prefetch();

  await Promise.all([authPromise, dataPromise]);

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
