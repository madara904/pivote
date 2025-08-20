import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col md:flex-row min-h-0"> {/* Key: min-h-0 prevents overflow */}
      {/* Mobile Navigation Skeleton */}
      <nav className="flex gap-2 bg-background p-4 border-b md:hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 flex-1 rounded-md" />
        ))}
      </nav>

      {/* Desktop Navigation Sidebar Skeleton */}
      <nav className="hidden md:flex w-56 p-6 flex-col gap-2 bg-background">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </nav>

      {/* Main Content Skeleton */}
      <main className="flex-1 p-2 md:p-5 min-h-0 overflow-hidden">
        <div className="space-y-6 max-h-full">
          {/* Account Settings Cards Skeleton (default tab) */}
          <div className="space-y-4">
            {/* Profile Card */}
            <div className="border rounded-lg p-6 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" /> {/* Card title */}
                <Skeleton className="h-4 w-64" /> {/* Card description */}
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" /> {/* Label */}
                  <Skeleton className="h-10 w-full" /> {/* Input */}
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" /> {/* Label */}
                  <Skeleton className="h-10 w-full" /> {/* Input */}
                </div>
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-10 w-20" /> {/* Save button */}
              </div>
            </div>

            {/* Email Card */}
            <div className="border rounded-lg p-6 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-56" />
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-10 w-20" />
              </div>
            </div>

            {/* Danger Zone Card */}
            <div className="border border-destructive/20 rounded-lg p-6 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-4 w-80" />
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}