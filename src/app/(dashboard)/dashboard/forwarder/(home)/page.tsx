import { requireForwarderAccess } from "@/lib/auth-utils";
import DashboardOverviewNew from "../components/dashboard-overview-new";
import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import Loading, { ActivitySkeleton } from "./loading";
import { PageContainer } from "@/components/ui/page-layout";

export default async function ForwarderDashboard() {
  await requireForwarderAccess();

  void prefetch(
    trpc.dashboard.forwarder.getHomeData.queryOptions({
      period: "30d",
      activityLimit: 3,
    }),
  );

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
