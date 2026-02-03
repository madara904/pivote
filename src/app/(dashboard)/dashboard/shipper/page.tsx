import { requireShipperAccess } from "@/lib/auth-utils";
import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import Loading from "./loading";
import DashboardOverviewHead from "../components/dashboard-overview-head";
import ShipperDashboardGrid from "./components/shipper-dashboard-grid";
import ShipperDashboardStatusCards from "./components/shipper-dashboard-status-cards";
import ShipperDashboardActivity from "./components/shipper-dashboard-activity";
import ShipperDashboardMetrics from "./components/shipper-dashboard-metrics";
import ShipperDashboardTips from "./components/shipper-dashboard-tips";
import { PageLayout, PageContainer } from "@/components/ui/page-layout";

const ShipperDashboard = async () => {
  await requireShipperAccess();

  trpc.organization.getMyOrganizations.prefetch();

  return (
    <>
      <HydrateClient>
        <ErrorBoundary
          title="Fehler beim Laden der Dashboard"
          description="Es ist ein Fehler beim Laden der Dashboard aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie den Support, wenn das Problem weiterhin besteht."
        >
          <Suspense fallback={<Loading />}>
            <PageLayout>
              <DashboardOverviewHead />
              <PageContainer>
                <ShipperDashboardGrid />
                <ShipperDashboardStatusCards />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <ShipperDashboardActivity />
                  <ShipperDashboardMetrics />
                </div>

                <ShipperDashboardTips />
              </PageContainer>
            </PageLayout>
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </>
  );
};

export default ShipperDashboard;