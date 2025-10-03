import { SkeletonKPICard, SkeletonCalendar, SkeletonCard, Skeleton } from '@/components/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton variant="text" width="200px" height="2rem" className="mb-2" />
        <Skeleton variant="text" width="350px" height="1.25rem" />
      </div>

      {/* KPIs Skeleton */}
      <div className="mb-8">
        <Skeleton variant="text" width="180px" height="1.5rem" className="mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonKPICard key={i} />
          ))}
        </div>
      </div>

      {/* Calendar Skeleton */}
      <div className="mb-8">
        <Skeleton variant="text" width="220px" height="1.5rem" className="mb-4" />
        <SkeletonCalendar />
      </div>

      {/* Quick Actions Skeleton */}
      <div className="mb-8">
        <Skeleton variant="text" width="180px" height="1.5rem" className="mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-3">
                <Skeleton variant="circular" width={48} height={48} />
                <Skeleton variant="text" width="60%" height="1.25rem" />
              </div>
              <Skeleton variant="text" width="80%" height="0.875rem" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Skeleton */}
      <div>
        <Skeleton variant="text" width="200px" height="1.5rem" className="mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
