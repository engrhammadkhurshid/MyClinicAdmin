// Server Component - No JS sent to client
import Link from 'next/link'
import Image from 'next/image'
import { 
  Calendar, 
  Users, 
  FileText, 
  Smartphone,
  CheckCircle,
  ArrowRight,
  Mail,
  Phone,
  Linkedin,
  Sparkles
} from 'lucide-react'

// Force static generation
export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour

const features = [
  {
    icon: Calendar,
    title: 'Smart Appointments',
    description: 'Schedule and manage daily visits with ease. Never miss an appointment again.'
  },
  {
    icon: Users,
    title: 'Patient Records',
    description: 'All patient history in one searchable place. Access medical records instantly.'
  },
  {
    icon: FileText,
    title: 'Instant Reports',
    description: 'Export monthly summaries in XLSX or PDF. Generate reports in seconds.'
  },
  {
    icon: Smartphone,
    title: 'Mobile-First Design',
    description: 'Optimized for phones — no app install needed. Works on any device, anywhere.'
  }
]

export function LandingPageServerOptimized() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                MyClinic<span className="text-blue-600">Admin</span>
              </div>
              <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                BETA
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/auth/signin"
                className="text-gray-700 hover:text-blue-600 font-medium transition"
                prefetch={true}
              >
                Login
              </Link>
              <Link 
                href="/auth/signup"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                prefetch={true}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Background Image with Glassmorphism */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/hero-background.webp"
            alt="Clinic receptionist using MyClinicAdmin"
            fill
            priority
            quality={90}
            className="object-cover"
            sizes="100vw"
          />
          {/* 10% Glassmorphic Overlay */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
          {/* Gradient for better readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/40 to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 w-full">
          <div className="max-w-3xl mx-auto text-center">
            
            {/* Glass Card with Content */}
            <div className="backdrop-blur-md bg-white/30 rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50 animate-fade-in-up">
              
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-blue-500/20 backdrop-blur-sm text-blue-900 rounded-full text-sm font-semibold border border-blue-300/50 animate-slide-in-left">
                <Sparkles className="w-4 h-4" />
                Trusted by 50+ Clinics
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight drop-shadow-lg">
                Manage Your Clinic
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Like a Pro
                </span>
              </h1>
              
              <p className="text-lg md:text-2xl text-gray-800 mb-10 max-w-2xl mx-auto font-medium drop-shadow-sm">
                Streamline appointments, manage patients, and grow your practice with our powerful, easy-to-use platform designed for modern clinics.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link 
                  href="/auth/signup"
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl gap-2 backdrop-blur-sm"
                  prefetch={true}
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="/auth/signin"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/80 hover:bg-white text-blue-600 font-semibold rounded-xl border-2 border-blue-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg backdrop-blur-sm"
                  prefetch={true}
                >
                  Sign In
                </Link>
              </div>

              {/* Stats with Glass Effect */}
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                <div className="backdrop-blur-sm bg-white/40 rounded-xl p-4 border border-white/50 transform transition hover:scale-105">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 drop-shadow">10K+</div>
                  <div className="text-sm text-gray-800 font-medium">Appointments</div>
                </div>
                <div className="backdrop-blur-sm bg-white/40 rounded-xl p-4 border border-white/50 transform transition hover:scale-105">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 drop-shadow">500+</div>
                  <div className="text-sm text-gray-800 font-medium">Clinics</div>
                </div>
                <div className="backdrop-blur-sm bg-white/40 rounded-xl p-4 border border-white/50 transform transition hover:scale-105">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 drop-shadow">99%</div>
                  <div className="text-sm text-gray-800 font-medium">Satisfaction</div>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center pt-2 backdrop-blur-sm bg-white/20">
            <div className="w-1 h-3 bg-white/90 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built specifically for clinics — no bloat, just the tools you actually need.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition">
                    <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Clinics
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { stat: '50+', label: 'Active Clinics' },
              { stat: '10k+', label: 'Patients Managed' },
              { stat: '99.9%', label: 'Uptime' }
            ].map((item, index) => (
              <div key={index} className="text-center p-8 bg-white rounded-xl shadow-md">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  {item.stat}
                </div>
                <div className="text-gray-600 font-medium">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose MyClinicAdmin?
              </h2>
              <div className="space-y-4">
                {[
                  'No complex setup — start in 5 minutes',
                  'Works on any device — phone, tablet, or desktop',
                  'Automatic backups — your data is always safe',
                  'Pakistani market expertise — built for local needs',
                  'Affordable pricing — no hidden fees'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-lg">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-2xl flex items-center justify-center">
                <p className="text-blue-600 font-semibold text-lg">Dashboard Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Clinic?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join 50+ clinics already using MyClinicAdmin. Start your free trial today.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition shadow-xl hover:shadow-2xl"
            prefetch={true}
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-6 text-sm text-blue-100">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="text-2xl font-bold text-white mb-4">
                MyClinicAdmin
              </div>
              <p className="text-gray-400 mb-4">
                Modern clinic management software built for Pakistani healthcare providers.
              </p>
              <div className="flex gap-4">
                <a href="mailto:support@myclinicadmin.com" className="hover:text-white transition">
                  <Mail className="w-5 h-5" />
                </a>
                <a href="tel:+923001234567" className="hover:text-white transition">
                  <Phone className="w-5 h-5" />
                </a>
                <a href="https://linkedin.com" className="hover:text-white transition" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="hover:text-white transition">Features</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white transition" prefetch={true}>Pricing</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white transition" prefetch={true}>Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="mailto:support@myclinicadmin.com" className="hover:text-white transition">Contact</a></li>
                <li><Link href="/auth/signin" className="hover:text-white transition" prefetch={true}>Login</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2025 MyClinicAdmin. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
