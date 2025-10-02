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
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all hover:border-primary-300 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                {/* Animated Icon Container */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: index * 0.1 + 0.2,
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                  whileHover={{ 
                    rotate: [0, -10, 10, -10, 0],
                    transition: { duration: 0.5 }
                  }}
                  className={`relative p-4 rounded-xl ${kpi.color || 'bg-primary-500'} shadow-lg group-hover:shadow-xl transition-shadow`}
                >
                  {/* Glow effect */}
                  <div className={`absolute inset-0 rounded-xl ${kpi.color || 'bg-primary-500'} opacity-0 group-hover:opacity-30 blur-xl transition-opacity`} />
                  
                  {/* Icon with animation */}
                  {Icon && (
                    <motion.div
                      animate={{ 
                        y: [0, -3, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Icon className="w-7 h-7 text-white relative z-10" strokeWidth={2.5} />
                    </motion.div>
                  )}
                </motion.div>
                
                {/* Trend Indicator with animation */}
                {kpi.trend && (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.4 }}
                    className={`flex items-center gap-1 ${trendColor} bg-white px-2 py-1 rounded-lg shadow-sm`}
                  >
                    <motion.div
                      animate={kpi.trend === 'up' ? { y: [-2, 2, -2] } : kpi.trend === 'down' ? { y: [2, -2, 2] } : {}}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <TrendIcon className="w-4 h-4" />
                    </motion.div>
                  </motion.div>
                )}
              </div>

              <div className="space-y-2">
                {/* Period Label with fade-in */}
                {kpi.period && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                    className="text-xs font-bold text-gray-500 uppercase tracking-wider"
                  >
                    {kpi.period}
                  </motion.p>
                )}
                
                {/* Title */}
                <motion.h3 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.6 }}
                  className="text-sm font-semibold text-gray-700"
                >
                  {kpi.title}
                </motion.h3>
                
                {/* Value with count-up effect */}
                <motion.p 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: index * 0.1 + 0.7,
                    type: "spring",
                    stiffness: 200
                  }}
                  className="text-4xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors"
                >
                  {kpi.value}
                </motion.p>
                
                {/* Change/Description */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.8 }}
                  className="flex items-center gap-2"
                >
                  <p className="text-sm text-gray-600">{kpi.change}</p>
                </motion.div>
              </div>

              {/* Animated progress bar */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    transition={{ 
                      delay: index * 0.1 + 0.9, 
                      duration: 1,
                      ease: "easeOut"
                    }}
                    className={`h-full rounded-full ${kpi.color || 'bg-primary-500'} relative overflow-hidden`}
                  >
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      animate={{
                        x: ['-100%', '100%']
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                        delay: index * 0.1 + 1
                      }}
                    />
                  </motion.div>
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

