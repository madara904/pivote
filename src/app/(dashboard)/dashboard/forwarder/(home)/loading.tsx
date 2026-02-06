import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full p-10 space-y-12 sm:space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-12 items-center overflow-x-hidden">
        <div className="flex-1 space-y-5 sm:space-y-15 w-full flex flex-col">
          <div>
            <Skeleton className="h-8 w-[160px]" />
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-10">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <div className="pt-6 border-t border-border/40 flex gap-8">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        
        <div className="hidden lg:block">
          <Skeleton className="h-full w-[1px]" />
        </div>
        
        <div className="relative flex flex-col overflow-hidden">
          {/* Header Skeleton */}
          <div className="relative z-10 flex justify-between mb-8 p-5">
            <div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
