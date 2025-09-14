import { requireForwarderAccess } from "@/lib/auth-utils";
import { Separator } from "@/components/ui/separator";
import InquiryView from "./components/data-view/inquiry-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { DotLoading } from "@/components/ui/dot-loading";

// Loading fallback component
function InquiryViewFallback() {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <div className="text-center space-y-2">
        <DotLoading size="md" />
        <p className="text-center py-8 text-muted-foreground">
          Lade Frachtanfragen
        </p>
      </div>
    </div>
  );
}

export default async function ForwarderInquiriesPage() {
  await requireForwarderAccess();
  
  
  // Prefetch the inquiries data for Suspense
  await trpc.inquiry.forwarder.getMyInquiriesFast.prefetch();

  return (
    <HydrateClient>
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
      
      <Suspense fallback={<InquiryViewFallback />}>
        <InquiryView />
      </Suspense>
    </HydrateClient>
  );
}