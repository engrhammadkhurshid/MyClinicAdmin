'use client'

import { motion } from 'framer-motion'
import { Search, Home, ArrowLeft, Mail, Phone, Linkedin } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full"
      >
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-blue-100">
          {/* Funny Illustration - Lost Doctor */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              {/* Large 404 */}
              <div className="text-center">
                <motion.h1
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="text-9xl md:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
                  style={{ lineHeight: '1' }}
                >
                  404
                </motion.h1>
              </div>

              {/* Stethoscope wrapped around 404 */}
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <svg
                  className="w-48 h-48 text-blue-400 opacity-30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </motion.div>

              {/* Floating question marks */}
              <motion.div
                animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0 }}
                className="absolute -top-4 -left-8 text-5xl"
              >
                🤔
              </motion.div>
              <motion.div
                animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
                className="absolute -top-4 -right-8 text-4xl"
              >
                ❓
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2.2, delay: 1 }}
                className="absolute bottom-4 left-4 text-3xl"
              >
                🔍
              </motion.div>
            </div>
          </motion.div>

          {/* Error Message */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Oops! Page Not Found 🏥
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              Looks like this patient (page) escaped from our clinic!
            </p>
            <p className="text-gray-700 mb-2">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <p className="text-sm text-gray-500">
              Don&apos;t worry, even the best doctors lose track of things sometimes! 😄
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              Quick Actions
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">→</span>
                <span>Check the URL for any typos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">→</span>
                <span>Use the navigation menu to find what you need</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">→</span>
                <span>Go back to the dashboard to start fresh</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-blue-500 hover:text-blue-600 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </motion.button>

            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              >
                <Home className="w-5 h-5" />
                Go to Dashboard
              </motion.button>
            </Link>
          </div>

          {/* Developer Contact Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Still Can&apos;t Find What You Need?
            </h3>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3 shadow-lg">
                  HK
                </div>
                <h4 className="text-lg font-bold text-gray-900">Engr. Hammad Khurshid</h4>
                <p className="text-xs text-gray-600">Full Stack Developer</p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {/* Email */}
                <a
                  href="mailto:engr.hammadkhurshid@gmail.com"
                  className="flex flex-col items-center gap-2 bg-white p-3 rounded-lg hover:shadow-md transition-shadow group"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                    <Mail className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-xs text-gray-900 font-medium">Email</p>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/923367126719"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 bg-white p-3 rounded-lg hover:shadow-md transition-shadow group"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <p className="text-xs text-gray-900 font-medium">WhatsApp</p>
                </a>

                {/* Phone */}
                <a
                  href="tel:+923367126719"
                  className="flex flex-col items-center gap-2 bg-white p-3 rounded-lg hover:shadow-md transition-shadow group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-900 font-medium">Call</p>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com/in/hammadkhurshid"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 bg-white p-3 rounded-lg hover:shadow-md transition-shadow group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Linkedin className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-900 font-medium">LinkedIn</p>
                </a>
              </div>

              {/* Website - Full Width */}
              <a
                href="https://hammadkhurshid.engineer"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white p-3 rounded-lg hover:shadow-md transition-shadow group"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <p className="text-sm text-gray-900 font-medium">hammadkhurshid.engineer</p>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          MyClinic Admin <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold ml-1">BETA v0.1.0</span> &copy; {new Date().getFullYear()} - Healthcare Management System
        </p>
      </motion.div>
    </div>
  )
}
