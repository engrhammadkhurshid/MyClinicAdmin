'use client'

import { motion } from 'framer-motion'
import { Clock, CheckCircle, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { createPatientSlug } from '@/lib/slugify'

interface Patient {
  id: string
  name: string
  visit_type?: string
  appointment_date?: string
}

interface PatientQueueProps {
  recentPatients: Patient[]
  upcomingPatients: Patient[]
}

export function PatientQueue({ recentPatients, upcomingPatients }: PatientQueueProps) {
  const hasData = recentPatients.length > 0 || upcomingPatients.length > 0

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Patient Queue</h2>
        <Link href="/patients" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All
        </Link>
      </div>

      {!hasData ? (
        <div className="text-center py-8">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No patients in queue</p>
          <p className="text-sm text-gray-400 mt-1">Recent and upcoming appointments will appear here</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-200 via-gray-200 to-blue-200 transform -translate-x-1/2" />

          <div className="grid grid-cols-2 gap-6">
            {/* Recent Patients - Left Side */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <h3 className="text-sm font-semibold text-gray-700">Recent Patients</h3>
              </div>
              {recentPatients.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No recent patients</p>
              ) : (
                <div className="space-y-3">
                  {recentPatients.slice(0, 3).map((patient, idx) => (
                    <motion.div
                      key={patient.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Link
                        href={`/patients/${createPatientSlug(patient.name, patient.id)}`}
                        className="block bg-green-50 hover:bg-green-100 rounded-lg p-3 transition-colors border border-green-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm truncate">{patient.name}</p>
                            {patient.visit_type && (
                              <p className="text-xs text-gray-500 mt-1">{patient.visit_type}</p>
                            )}
                          </div>
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 ml-2" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Patients - Right Side */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-700">Next in Queue</h3>
              </div>
              {upcomingPatients.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No upcoming patients</p>
              ) : (
                <div className="space-y-3">
                  {upcomingPatients.slice(0, 3).map((patient, idx) => (
                    <motion.div
                      key={patient.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Link
                        href={`/patients/${createPatientSlug(patient.name, patient.id)}`}
                        className="block bg-blue-50 hover:bg-blue-100 rounded-lg p-3 transition-colors border border-blue-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm truncate">{patient.name}</p>
                            {patient.visit_type && (
                              <p className="text-xs text-gray-500 mt-1">{patient.visit_type}</p>
                            )}
                          </div>
                          <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center indicator */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="bg-white rounded-full p-2 shadow-lg border-2 border-gray-200">
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
