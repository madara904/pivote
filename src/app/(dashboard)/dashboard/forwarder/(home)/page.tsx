import { requireForwarderAccess } from "@/lib/auth-utils";
import DashboardOverviewNew from "../components/dashboard-overview-new";
import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import Loading, { ActivitySkeleton } from "./loading";
import { ActivityAndQuickActions } from "../components/activity/activity";
import { PageContainer } from "@/components/ui/page-layout";

export default async function ForwarderDashboard() {
  await requireForwarderAccess();

  void Promise.all([
    prefetch(trpc.dashboard.forwarder.getOverview.queryOptions({ period: "30d" })),
    prefetch(trpc.dashboard.forwarder.getActivityFeed.queryOptions({ limit: 8 })),
  ]);

  return (
    <PageContainer>
      <HydrateClient>
        <Suspense fallback={<Loading />}>
          <DashboardOverviewNew />
        </Suspense>
      </HydrateClient>
    </PageContainer>
  );
}
