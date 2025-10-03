import { Skeleton, SkeletonCard, SkeletonTable } from '@/components/Skeleton'

export default function PatientDetailsLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back Button Skeleton */}
      <div className="mb-6">
        <Skeleton variant="text" width="120px" height="1.25rem" />
      </div>

      {/* Patient Header Card Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex items-start gap-6">
          <Skeleton variant="circular" width={80} height={80} />
          <div className="flex-1 space-y-4">
            <Skeleton variant="text" width="250px" height="2rem" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton variant="text" width="80px" height="0.875rem" />
                  <Skeleton variant="text" width="120px" height="1rem" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="mb-6 flex gap-4 border-b border-gray-200">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="text" width="120px" height="1.25rem" className="mb-2" />
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Medical History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <Skeleton variant="text" width="180px" height="1.5rem" className="mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="text" height="1rem" />
              ))}
            </div>
          </div>

          {/* Appointments History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <Skeleton variant="text" width="220px" height="1.5rem" className="mb-4" />
            <SkeletonTable rows={5} columns={4} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
