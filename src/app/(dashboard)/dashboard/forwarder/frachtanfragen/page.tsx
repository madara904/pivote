import { requireForwarderAccess } from "@/lib/auth-utils";
import { Separator } from "@/components/ui/separator";
import InquiryView from "./components/inquiry-view";

export default async function ForwarderInquiriesPage() {
await requireForwarderAccess();

  // Remove prefetch to eliminate server-side latency
  // Let the client handle the query with proper loading states

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
      <InquiryView />
    </>
  );
}