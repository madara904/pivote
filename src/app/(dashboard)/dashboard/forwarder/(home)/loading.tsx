import { Skeleton } from "@/components/ui/skeleton";

function MetricBlockSkeleton() {
  return (
    <div className="flex items-center gap-x-4">
      <Skeleton className="min-w-[64px] min-h-[64px] rounded-lg shrink-0" />
      <div className="flex flex-col justify-center gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-7 w-20" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="flex flex-col mt-5">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8 lg:gap-16 lg:mx-auto lg:w-[90%]">
        {/* Left column - metrics */}
        <div className="flex flex-col min-h-0 lg:min-h-[460px] py-4">
          <div className="flex flex-col w-full space-y-6 lg:space-y-15 lg:flex-1 lg:justify-center">
            <div className="shrink-0">
              <Skeleton className="h-8 w-[160px] rounded-md" />
            </div>
            <div className="grid grid-row md:grid-cols-2 gap-x-[3rem] gap-y-[2.5rem]">
              <MetricBlockSkeleton />
              <MetricBlockSkeleton />
              <MetricBlockSkeleton />
              <MetricBlockSkeleton />
            </div>
            <div className="flex flex-row gap-6 shrink-0 pt-6">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>

        {/* Right column - transport breakdown */}
        <div className="relative w-full border bg-slate-50/20 overflow-hidden flex flex-col min-h-[500px] md:min-h-[600px]">
          <div className="relative z-10 p-5 mb-20 md:mb-16">
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex-1 relative flex items-center justify-center">
            <div className="relative -translate-y-12 md:-translate-y-20 flex items-center justify-center">
              <Skeleton className="absolute w-[300px] h-[300px] md:w-[380px] md:h-[380px] rounded-full" />
              <div className="relative z-20">
                <Skeleton className="w-[200px] sm:w-[240px] h-14 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 lg:mx-auto lg:w-full mt-12 pb-20">
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50/10 border border-transparent rounded-sm">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-2.5 w-12" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    </div>
  );
}
