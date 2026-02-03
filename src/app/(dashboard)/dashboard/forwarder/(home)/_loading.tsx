import { Skeleton } from "@/components/ui/skeleton";
import { PageLayout, PageContainer } from "@/components/ui/page-layout";
import DashboardOverviewHead from "../../components/dashboard-overview-head";

export default function Loading() {
  return (
    <PageLayout>
      <DashboardOverviewHead />
      <PageContainer>
        <div className="space-y-6">
          {/* Freight Inquiry Card Skeleton */}
          <div className="w-full max-w-2xl mb-6">
            <Skeleton className="h-48 w-full rounded-3xl" />
          </div>

          {/* Dashboard Metrics Skeleton */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>

          {/* Dashboard Quick Actions Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          </div>

          {/* Dashboard Bottom and Performance Grid Skeleton */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 w-full max-w-full">
            {/* Dashboard Bottom Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard Performance Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </PageContainer>
    </PageLayout>
  );
}
