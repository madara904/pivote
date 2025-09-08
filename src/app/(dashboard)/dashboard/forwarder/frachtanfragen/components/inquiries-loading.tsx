export function InquiriesLoading() {
    return (
      <div className="space-y-6">
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border rounded-lg p-6">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-2" />
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16" />
            </div>
          ))}
        </div>
  
        {/* Filters Skeleton */}
        <div className="bg-white border rounded-lg p-6">
          <div className="mb-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-40" />
          </div>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="h-10 bg-gray-200 rounded animate-pulse flex-1" />
              <div className="h-10 bg-gray-200 rounded animate-pulse w-20" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                  <div className="h-10 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
  
        {/* Table Skeleton */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="p-6 border-b">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-48" />
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <th key={i} className="p-4 text-left">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="p-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }