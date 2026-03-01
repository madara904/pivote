import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  );
}
