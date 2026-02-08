import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full space-y-6">
      {/* Organization List Card Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 border-b border-border/50">
        <div>
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-xl border bg-card overflow-hidden divide-y">
            <div className="p-4 flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Logo Card Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 border-b border-border/50">
        <div>
          <Skeleton className="h-5 w-36 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-6">
            <Skeleton className="h-24 w-24 rounded-xl" />
          </div>
          <Skeleton className="h-3 w-48" />
        </div>
      </div>

      {/* Organization Members Card Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
        <div>
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="md:col-span-2 space-y-6">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="divide-y border rounded-lg bg-background">
            <div className="p-4 flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
