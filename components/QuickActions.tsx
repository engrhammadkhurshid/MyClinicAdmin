'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { UserPlus, CalendarPlus } from 'lucide-react'

export function QuickActions() {
  const actions = [
    {
      title: 'Add Patient',
      description: 'Register a new patient',
      href: '/patients/new',
      icon: UserPlus,
      color: 'bg-primary-500',
    },
    {
      title: 'New Appointment',
      description: 'Schedule an appointment',
      href: '/appointments/new',
      icon: CalendarPlus,
      color: 'bg-green-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {actions.map((action, index) => {
        const Icon = action.icon
        return (
          <Link key={action.title} href={action.href}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${action.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            </motion.div>
          </Link>
        )
      })}
    </div>
  )
}
