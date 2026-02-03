import { Skeleton } from "@/components/ui/skeleton";
import { PageLayout, PageContainer } from "@/components/ui/page-layout";
import DashboardOverviewHead from "../components/dashboard-overview-head";

export default function Loading() {
  return (
    <PageLayout>
      <DashboardOverviewHead />
      <PageContainer className="space-y-8">
        <div className="w-full max-w-2xl">
          <Skeleton className="h-48 w-full rounded-3xl" />
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
          <Skeleton className="h-40 w-full lg:col-span-5" />
          <Skeleton className="h-40 w-full lg:col-span-4" />
          <Skeleton className="h-40 w-full lg:col-span-3" />
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <Skeleton className="h-64 w-full lg:col-span-2" />
          <Skeleton className="h-64 w-full" />
        </div>

        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </PageContainer>
    </PageLayout>
  );
}