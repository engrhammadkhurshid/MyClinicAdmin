import { SkeletonForm, Skeleton } from '@/components/Skeleton'

export default function NewPatientLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back Button Skeleton */}
      <div className="mb-6">
        <Skeleton variant="text" width="120px" height="1.25rem" />
      </div>

      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton variant="text" width="200px" height="2rem" className="mb-2" />
        <Skeleton variant="text" width="350px" height="1.25rem" />
      </div>

      {/* Form Card Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <Skeleton variant="text" width="180px" height="1.5rem" className="mb-6" />
        <SkeletonForm />
      </div>
    </div>
  )
}
