'use client'

import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { UserPlus, Calendar, FileText } from 'lucide-react'

interface Activity {
  id: string
  type: 'patient' | 'appointment' | 'note'
  title: string
  description: string
  timestamp: Date
}

export function RecentActivityFeed({ activities }: { activities: Activity[] }) {
  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'patient':
        return UserPlus
      case 'appointment':
        return Calendar
      case 'note':
        return FileText
      default:
        return FileText
    }
  }

  const getColor = (type: Activity['type']) => {
    switch (type) {
      case 'patient':
        return 'bg-primary-100 text-primary-600'
      case 'appointment':
        return 'bg-green-100 text-green-600'
      case 'note':
        return 'bg-purple-100 text-purple-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No recent activity</p>
        <p className="text-sm text-gray-400 mt-1">
          Activity will appear here once you start managing patients and appointments
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = getIcon(activity.type)
          const colorClass = getColor(activity.type)

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0"
            >
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-600 mt-0.5">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {format(activity.timestamp, 'MMM d, yyyy • h:mm a')}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
