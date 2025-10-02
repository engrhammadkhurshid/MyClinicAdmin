import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { BottomNavigation } from '@/components/BottomNavigation'
import { ClinicHeader } from '@/components/ClinicHeader'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 pt-16">
        <main className="flex-1 overflow-y-auto pb-20">
          <ClinicHeader />
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Footer />
      <BottomNavigation />
    </div>
  )
}
