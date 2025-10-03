import dynamic from 'next/dynamic'

// Lazy load the heavy multi-step signup form
const MultiStepSignupForm = dynamic(
  () => import('@/components/MultiStepSignupForm'),
  {
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading signup form...</p>
        </div>
      </div>
    ),
    ssr: false // Client-only component (uses confetti, framer-motion)
  }
)

export const metadata = {
  title: 'Sign Up - MyClinicAdmin',
  description: 'Create your MyClinicAdmin account in 3 easy steps',
}

export default function SignUpPage() {
  return <MultiStepSignupForm />
}
