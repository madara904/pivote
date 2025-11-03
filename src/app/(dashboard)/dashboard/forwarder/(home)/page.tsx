import { requireForwarderAccess } from "@/lib/auth-utils";
import DashboardOverviewHead from "../../components/dashboard-overview-head";
import DashboardBottom from "../../components/dashboard-last-table";
import DashboardPerformance from "../../components/dashboard-performance";
import DashboardAsymmetricalGrid from "../../components/dashboard-asymmetrical-grid";
import DashboardStatusCards from "../../components/dashboard-status-cards";
import DashboardGrowBusiness from "../../components/dashboard-grow-business";
import FreightInquiryCard from "../components/dashboard-card";

export default async function ForwarderDashboard() {
 await requireForwarderAccess();
  
  return (
    <>
      <DashboardOverviewHead />
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
    </>
  );
}
