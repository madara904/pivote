import { requireForwarderAccess } from "@/lib/auth-utils";
import DashboardOverviewHead from "../../components/dashboard-overview-head";
import DashboardBottom from "../../components/dashboard-last-table";
import DashboardPerformance from "../../components/dashboard-performance";
import DashboardAsymmetricalGrid from "../../components/dashboard-asymmetrical-grid";
import DashboardStatusCards from "../../components/dashboard-status-cards";
import DashboardGrowBusiness from "../../components/dashboard-grow-business";
import FreightInquiryCard from "../components/dashboard-card";
import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import Loading from "./_loading";

export default async function ForwarderDashboard() {
  await requireForwarderAccess();

  trpc.organization.getMyOrganizations.prefetch();
  
  return (
    <>
      <HydrateClient>
        <ErrorBoundary
          title="Fehler beim Laden der Dashboard"
          description="Es ist ein Fehler beim Laden der Dashboard aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie den Support, wenn das Problem weiterhin besteht."
        >
          <Suspense fallback={<Loading />}>
            <DashboardOverviewHead/>
            <main className="container mx-auto">
              <FreightInquiryCard />
              <DashboardAsymmetricalGrid />
              <DashboardStatusCards />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <DashboardBottom />
                <DashboardPerformance />
              </div>

              <DashboardGrowBusiness />
            </main>
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </>
  );
}
