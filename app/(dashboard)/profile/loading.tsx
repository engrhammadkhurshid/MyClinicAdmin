import { SkeletonProfile } from '@/components/Skeleton'

export default function ProfileLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <SkeletonProfile />
    </div>
  )
}
