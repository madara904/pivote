import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardOverviewHead from "./components/view/modules/dashboard-overview-head";
import DashboardBottom from "./components/view/modules/dashboard-last-table";
import DashboardMetrics from "./components/view/modules/dashboard-metrics";
import DashboardPerformance from "./components/view/modules/dashboard-performance";
import DashboardQuickActions from "./components/view/modules/dashboard-quick-action";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <main>
      <div className="space-y-6">
        <DashboardOverviewHead />
        <DashboardMetrics />
        <DashboardQuickActions />

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 w-full max-w-full">
          <DashboardBottom />
          <DashboardPerformance />
        </div>
      </div>
    </main>
  );
}
