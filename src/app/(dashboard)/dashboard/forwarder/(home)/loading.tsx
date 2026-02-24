import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-4" />
        <Skeleton className="h-8 w-44" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {["a", "b", "c", "d"].map((id) => (
          <div key={id} className="border border-border p-6 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 border border-border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-[260px] w-full" />
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Skeleton className="h-40 w-full border border-border" />
          <Skeleton className="h-40 w-full border border-border" />
          <Skeleton className="h-28 w-full border border-border sm:col-span-2" />
        </div>
      </div>
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
      <div className="space-y-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-12 w-full border border-border" />
        <Skeleton className="h-12 w-full border border-border" />
        <Skeleton className="h-12 w-full border border-border" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-28 w-full border border-border" />
        <Skeleton className="h-28 w-full border border-border" />
      </div>
    </div>
  );
}
