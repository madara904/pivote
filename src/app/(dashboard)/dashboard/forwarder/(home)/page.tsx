import { requireForwarderAccess } from "@/lib/auth-utils";
import DashboardOverviewNew from "../components/dashboard-overview-new";
import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import Loading from "./loading";
import { ErrorBoundary } from "@/components/error-boundary";


export default async function ForwarderDashboard() {
  await requireForwarderAccess();

  void prefetch(
    trpc.dashboard.forwarder.getHomeData.queryOptions({
      period: "30d",
      activityLimit: 3,
    }),
  );

  return (
    <HydrateClient>
      <ErrorBoundary
        title="Fehler beim Laden des Dashboards"
        description="Es ist ein Fehler beim Laden der Dashboard-Daten aufgetreten. Bitte versuchen Sie es später erneut."
      >
        <Suspense fallback={<Loading />}>
          <DashboardOverviewNew />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
