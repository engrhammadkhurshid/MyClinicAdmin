'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Calendar, 
  Users, 
  FileText, 
  Smartphone, 
  CheckCircle,
  ArrowRight,
  Mail,
  Phone,
  Linkedin
} from 'lucide-react'

export function LandingPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200"
      >
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
              >
                Login
              </Link>
              <Link 
                href="/auth/signup"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.div variants={fadeInUp} className="inline-block mb-4">
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                ✨ Introducing MyClinicAdmin Beta v0.1
              </span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6"
            >
              Your Personal
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Clinic Manager
              </span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              Manage patients, appointments, and medical records — all from your phone browser.
              <br className="hidden md:block" />
              <span className="text-gray-500">No app installation required.</span>
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link 
                href="/auth/signup"
                className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              <Link 
                href="/auth/signin"
                className="px-8 py-4 bg-white hover:bg-gray-50 text-blue-600 font-bold rounded-xl transition border-2 border-blue-600"
              >
                Login
              </Link>
            </motion.div>

            <motion.p 
              variants={fadeInUp}
              className="mt-6 text-sm text-gray-500 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4 text-green-500" />
              No credit card required • Free forever
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Say goodbye to
                <br />
                <span className="text-red-500">messy registers</span> and
                <br />
                <span className="text-red-500">spreadsheets.</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Doctors and medical assistants waste hours managing patient data manually. 
                Appointments get mixed up, records are lost, and valuable time is wasted.
              </p>
              <p className="text-lg text-gray-700 font-semibold mb-8">
                MyClinicAdmin makes it effortless — secure, mobile-first, and always accessible.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  'Instant patient lookup',
                  'Automated appointment reminders',
                  'Secure cloud storage',
                  'Export reports with one click'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                <p className="text-gray-500 text-center px-8">
                  [Product mockup / screenshot will be added here]
                  <br />
                  <span className="text-sm">Dashboard + Patient Table</span>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage your clinic
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed for busy healthcare professionals
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Screenshots/Demo Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-2xl flex items-center justify-center mb-8">
              <div className="text-center px-8">
                <p className="text-gray-500 text-lg mb-2">
                  [Large mockup of Dashboard + Patient Table]
                </p>
                <p className="text-gray-400 text-sm">
                  Interactive demo coming soon
                </p>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              Built for doctors, designed for simplicity.
            </p>
          </motion.div>
        </div>
      </section>

      {/* About/Trust Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built with ❤️ by Healthcare Professionals
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Created by <span className="font-semibold text-blue-600">Engr. Hammad Khurshid</span>
              <br />
              <span className="text-gray-500">Full-Stack Developer & Healthcare Tech Enthusiast</span>
            </p>
            <div className="flex items-center justify-center gap-4 mb-8">
              <a
                href="https://www.linkedin.com/in/hammadkhurshid"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                <Linkedin className="w-5 h-5" />
                Connect on LinkedIn
              </a>
            </div>
            <p className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-4 inline-block">
              <span className="font-semibold text-yellow-700">Currently in Beta v0.1</span>
              <br />
              Early adopters welcome! Your feedback helps us improve.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Start managing your clinic today
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join hundreds of doctors who&apos;ve simplified their practice management
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 font-bold rounded-xl transition shadow-xl text-lg"
            >
              Get Started Free
              <ArrowRight className="w-6 h-6" />
            </Link>
            <p className="mt-6 text-blue-100 text-sm">
              No credit card required • Set up in 2 minutes
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-6">Contact Us</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
              <a 
                href="mailto:engr.hammadkhurshid@gmail.com"
                className="flex items-center gap-2 text-gray-300 hover:text-white transition"
              >
                <Mail className="w-5 h-5" />
                engr.hammadkhurshid@gmail.com
              </a>
              <a 
                href="https://wa.me/923367126719"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-300 hover:text-white transition"
              >
                <Phone className="w-5 h-5" />
                +92 336 7126719
              </a>
            </div>
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} MyClinicAdmin. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Built with Next.js, TailwindCSS, and Framer Motion
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
