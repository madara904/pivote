import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function InquiryDetailsLoadingState() {
  return (
    <>
      <div className="border-b border-border bg-card">
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 pb-4">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </Card>
            <Card className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
              </div>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="p-6">
              <Skeleton className="h-6 w-24 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
              </div>
            </Card>
            <Card className="p-6">
              <Skeleton className="h-6 w-24 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

