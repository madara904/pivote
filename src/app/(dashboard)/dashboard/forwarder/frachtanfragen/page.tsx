import { HydrateClient, trpc } from "@/trpc/server";
import { requireForwarderAccess } from "@/lib/auth-utils";
import { Separator } from "@/components/ui/separator";
import InquiryView from "./components/inquiry-view";
import { Suspense } from "react";


export default async function ForwarderInquiriesPage() {
await requireForwarderAccess();

  await trpc.inquiry.forwarder.getMyInquiriesFast.prefetch()

  return (
    <>
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Frachtanfragen
            </h1>
          </div>
        </div>
        <Separator />
      </div>
      <HydrateClient>
        <Suspense fallback={"loading..."}>
          <InquiryView />
        </Suspense>
      </HydrateClient>
    </>
  );
}
