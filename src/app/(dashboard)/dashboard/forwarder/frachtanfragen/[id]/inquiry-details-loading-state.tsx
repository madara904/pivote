import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-layout";
import { Skeleton } from "@/components/ui/skeleton";

export function InquiryDetailsLoadingState() {
  return (
    <PageContainer>
      <div className="w-full max-w-[1400px] mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-3" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>

        <div className="grid grid-cols-12">
          <div className="col-span-12 lg:col-span-8 p-8 md:border-r border-border space-y-10">
            <Card className="border-border rounded-2xl p-8">
              <div className="flex items-center justify-between gap-8">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>

                <div className="flex-1 px-8 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24 mx-auto" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-3 w-24 ml-auto" />
                  <Skeleton className="h-8 w-32 ml-auto" />
                  <Skeleton className="h-4 w-20 ml-auto" />
                </div>
              </div>
            </Card>

            <Card className="border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-5 w-44" />
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-12">
              <Card className="border-border p-5">
                <Skeleton className="h-4 w-32 mb-4" />
                <Skeleton className="h-16 w-full" />
              </Card>
              <Card className="border-border p-5">
                <Skeleton className="h-4 w-32 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </Card>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 p-8 space-y-6 bg-white">
            <Card className="border-border p-5 space-y-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </Card>

            <Card className="border-border p-5 space-y-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-20 w-full" />
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
