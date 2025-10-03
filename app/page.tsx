import { LandingPageServerOptimized } from '@/components/LandingPageServerOptimized'

// Force static generation for landing page
export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour (ISR)

export const metadata = {
  title: 'MyClinicAdmin - Modern Clinic Management Software',
  description: 'Simple, fast, and mobile-friendly clinic management. Track patients, appointments, and reports — all in one place.',
}

export default function Home() {
  return <LandingPageServerOptimized />
}
