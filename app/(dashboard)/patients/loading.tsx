import { SkeletonTable, Skeleton } from '@/components/Skeleton'

export default function PatientsLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Skeleton variant="text" width="180px" height="2rem" className="mb-2" />
          <Skeleton variant="text" width="300px" height="1.25rem" />
        </div>
        <Skeleton variant="rounded" width="160px" height="44px" />
      </div>

      {/* Search and Filter Skeleton */}
      <div className="mb-6 flex gap-4">
        <Skeleton variant="rounded" className="flex-1" height="44px" />
        <Skeleton variant="rounded" width="120px" height="44px" />
        <Skeleton variant="rounded" width="120px" height="44px" />
      </div>

      {/* Table Skeleton */}
      <SkeletonTable rows={8} columns={5} />

      {/* Pagination Skeleton */}
      <div className="mt-6 flex items-center justify-between">
        <Skeleton variant="text" width="150px" height="1rem" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" width="40px" height="40px" />
          ))}
        </div>
      </div>
    </div>
  )
}
