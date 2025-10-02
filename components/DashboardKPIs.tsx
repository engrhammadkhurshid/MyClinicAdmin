'use client'

import { motion } from 'framer-motion'
import { Users, Calendar, TrendingUp, Clock, Activity, ArrowUp, ArrowDown, Minus, type LucideIcon } from 'lucide-react'

interface KPI {
  title: string
  value: string | number
  change: string
  icon: LucideIcon
  color: string
  trend?: 'up' | 'down' | 'neutral'
  period?: string
}

export function DashboardKPIs({ kpis }: { kpis: KPI[] }) {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Key Metrics</h2>
        <p className="text-sm text-gray-500">Real-time clinic statistics</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon
          
          // Determine trend icon
          let TrendIcon = Minus
          let trendColor = 'text-gray-400'
          
          if (kpi.trend === 'up') {
            TrendIcon = ArrowUp
            trendColor = 'text-green-600'
          } else if (kpi.trend === 'down') {
            TrendIcon = ArrowDown
            trendColor = 'text-red-600'
          }

          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all hover:border-primary-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-lg ${kpi.color || 'bg-primary-500'}`}
                >
                  {Icon && <Icon className="w-6 h-6 text-white" />}
                </div>
                
                {/* Trend Indicator */}
                {kpi.trend && (
                  <div className={`flex items-center gap-1 ${trendColor}`}>
                    <TrendIcon className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {/* Period Label */}
                {kpi.period && (
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {kpi.period}
                  </p>
                )}
                
                {/* Title */}
                <h3 className="text-sm font-semibold text-gray-700">
                  {kpi.title}
                </h3>
                
                {/* Value */}
                <p className="text-4xl font-bold text-gray-900">{kpi.value}</p>
                
                {/* Change/Description */}
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600">{kpi.change}</p>
                </div>
              </div>

              {/* Mini visual indicator bar */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '60%' }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                    className={`h-full rounded-full ${kpi.color?.replace('bg-', 'bg-opacity-50 bg-') || 'bg-opacity-50 bg-primary-500'}`}
                  />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}


export const defaultKPIs: KPI[] = [
  {
    title: 'Total Patients',
    value: 0,
    change: 'All time',
    icon: Users,
    color: 'bg-primary-500',
    period: 'ALL TIME',
    trend: 'up',
  },
  {
    title: 'Today\'s Appointments',
    value: 0,
    change: 'Scheduled today',
    icon: Calendar,
    color: 'bg-green-500',
    period: 'TODAY',
    trend: 'neutral',
  },
  {
    title: 'Weekly Patients',
    value: 0,
    change: 'Last 7 days',
    icon: Activity,
    color: 'bg-blue-500',
    period: 'WEEKLY',
    trend: 'up',
  },
  {
    title: 'Monthly Visits',
    value: 0,
    change: 'This month',
    icon: TrendingUp,
    color: 'bg-purple-500',
    period: 'MONTHLY',
    trend: 'up',
  },
  {
    title: 'Follow-ups Due',
    value: 0,
    change: 'Next 7 days',
    icon: Clock,
    color: 'bg-orange-500',
    period: 'UPCOMING',
    trend: 'neutral',
  },
]

