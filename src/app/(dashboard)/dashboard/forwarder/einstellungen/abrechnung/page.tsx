import { requireForwarderAccess } from "@/lib/auth-utils";
import BillingCard from "../components/billing/billing-card";
import { Suspense } from "react";
import Loading from "./loading";

export default async function BillingSettingsPage() {
  await requireForwarderAccess();

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full">
        <BillingCard />
      </div>
    </Suspense>
  );
}
