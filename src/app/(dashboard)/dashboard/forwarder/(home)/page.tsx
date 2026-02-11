import { requireForwarderAccess } from "@/lib/auth-utils";
import DashboardOverviewNew, {
  ActivityAndQuickActions,
} from "../components/dashboard-overview-new";
import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import Loading, { ActivitySkeleton } from "./loading";

export default async function ForwarderDashboard() {
  await requireForwarderAccess();

  void Promise.all([
    prefetch(trpc.dashboard.forwarder.getOverview.queryOptions({ period: "30d" })),
    prefetch(trpc.dashboard.forwarder.getActivityFeed.queryOptions({ limit: 8 })),
  ]);


  return (
    <>
      <HydrateClient>
        <Suspense fallback={<Loading />}>
          <DashboardOverviewNew />
        </Suspense>
      </HydrateClient>
      <HydrateClient>
        <Suspense fallback={<ActivitySkeleton />}>
      <div className="mt-12">
        <ActivityAndQuickActions />
      </div>
      </Suspense>
      </HydrateClient>
    </>
  );
}
