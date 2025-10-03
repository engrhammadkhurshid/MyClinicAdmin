import { SkeletonCalendar, SkeletonTable, Skeleton } from '@/components/Skeleton'

export default function AppointmentsLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Skeleton variant="text" width="220px" height="2rem" className="mb-2" />
          <Skeleton variant="text" width="350px" height="1.25rem" />
        </div>
        <Skeleton variant="rounded" width="180px" height="44px" />
      </div>

      {/* View Toggle Skeleton */}
      <div className="mb-6 flex gap-4">
        <div className="flex gap-2">
          <Skeleton variant="rounded" width="100px" height="40px" />
          <Skeleton variant="rounded" width="100px" height="40px" />
        </div>
        <div className="flex-1" />
        <Skeleton variant="rounded" width="150px" height="40px" />
      </div>

      {/* Calendar View Skeleton */}
      <div className="mb-8">
        <SkeletonCalendar />
      </div>

      {/* Upcoming Appointments Table */}
      <div className="mt-8">
        <Skeleton variant="text" width="240px" height="1.5rem" className="mb-4" />
        <SkeletonTable rows={6} columns={5} />
      </div>
    </div>
  )
}
