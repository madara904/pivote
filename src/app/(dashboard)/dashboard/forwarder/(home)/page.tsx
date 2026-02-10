import { requireForwarderAccess } from "@/lib/auth-utils";
import DashboardOverviewNew from "../components/dashboard-overview-new";
import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import Loading from "./loading";

export default async function ForwarderDashboard() {
  await requireForwarderAccess();

  void prefetch(trpc.dashboard.forwarder.getOverview.queryOptions({ period: "30d" }));

  return (
    <HydrateClient>
      <Suspense fallback={<Loading />}>
        <DashboardOverviewNew />
      </Suspense>
    </HydrateClient>
  );
}
