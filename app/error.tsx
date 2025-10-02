'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, Mail, Phone, Linkedin } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Runtime Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        {/* Error Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-red-100">
          {/* Funny Illustration - Broken Robot */}
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 10 }}
            transition={{
              repeat: Infinity,
              repeatType: 'reverse',
              duration: 1,
              ease: 'easeInOut',
            }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              {/* Robot Body */}
              <div className="w-32 h-32 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-16 h-16 text-white" strokeWidth={2.5} />
              </div>
              
              {/* Robot Antenna - Broken */}
              <motion.div
                animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-8 left-1/2 -translate-x-1/2 w-1 h-8 bg-red-600"
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse" />
              </motion.div>

              {/* Sparks */}
              <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute top-0 right-0 text-yellow-400 text-2xl"
              >
                ⚡
              </motion.div>
              <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: 0.3 }}
                className="absolute top-4 left-0 text-orange-400 text-xl"
              >
                💥
              </motion.div>
            </div>
          </motion.div>

          {/* Error Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Oops! Something Broke 🔧
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Our robot had a little hiccup! Don&apos;t worry, it happens to the best of us.
            </p>
            
            {/* Error Details - Only show in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left mb-6">
                <p className="font-mono text-sm text-red-800 break-all">
                  <strong>Error:</strong> {error.message}
                </p>
                {error.digest && (
                  <p className="font-mono text-xs text-red-600 mt-2">
                    <strong>Digest:</strong> {error.digest}
                  </p>
                )}
              </div>
            )}

            <p className="text-gray-700 mb-6">
              This error has been automatically logged. You can also contact the developer below.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={reset}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </motion.button>

            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-blue-500 hover:text-blue-600 transition-all w-full sm:w-auto"
              >
                <Home className="w-5 h-5" />
                Go to Dashboard
              </motion.button>
            </Link>
          </div>

          {/* Developer Contact Information */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Need Help? Contact Developer
            </h2>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-lg">
                  HK
                </div>
                <h3 className="text-xl font-bold text-gray-900">Engr. Hammad Khurshid</h3>
                <p className="text-sm text-gray-600">Full Stack Developer</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Email */}
                <a
                  href="mailto:engr.hammadkhurshid@gmail.com"
                  className="flex items-center gap-3 bg-white p-3 rounded-lg hover:shadow-md transition-shadow group"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                    <Mail className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-500 font-medium">Email</p>
                    <p className="text-sm text-gray-900 font-medium truncate">
                      engr.hammadkhurshid@gmail.com
                    </p>
                  </div>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/923367126719"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-white p-3 rounded-lg hover:shadow-md transition-shadow group"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-500 font-medium">WhatsApp</p>
                    <p className="text-sm text-gray-900 font-medium">+92 336 7126719</p>
                  </div>
                </a>

                {/* Phone */}
                <a
                  href="tel:+923367126719"
                  className="flex items-center gap-3 bg-white p-3 rounded-lg hover:shadow-md transition-shadow group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-500 font-medium">Phone</p>
                    <p className="text-sm text-gray-900 font-medium">+92 336 7126719</p>
                  </div>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com/in/hammadkhurshid"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-white p-3 rounded-lg hover:shadow-md transition-shadow group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Linkedin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-500 font-medium">LinkedIn</p>
                    <p className="text-sm text-gray-900 font-medium truncate">
                      /in/hammadkhurshid
                    </p>
                  </div>
                </a>

                {/* Website - Full Width */}
                <a
                  href="https://hammadkhurshid.engineer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="md:col-span-2 flex items-center gap-3 bg-white p-3 rounded-lg hover:shadow-md transition-shadow group"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-500 font-medium">Website</p>
                    <p className="text-sm text-gray-900 font-medium">hammadkhurshid.engineer</p>
                  </div>
                </a>
              </div>
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
