'use client'

import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const getVariantClass = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full'
      case 'rectangular':
        return 'rounded-none'
      case 'rounded':
        return 'rounded-lg'
      case 'text':
      default:
        return 'rounded'
    }
  }

  const style = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%')
  }

  const baseClass = `bg-gray-200 ${getVariantClass()} ${className}`

  if (animation === 'wave') {
    return (
      <div className={`${baseClass} relative overflow-hidden`} style={style}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </div>
    )
  }

  if (animation === 'pulse') {
    return (
      <motion.div
        className={baseClass}
        style={style}
        animate={{
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    )
  }

  return <div className={baseClass} style={style} />
}

// Preset skeleton components for common use cases
export function SkeletonText({ lines = 1, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height="1rem"
          width={i === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" height="1.25rem" width="60%" />
          <SkeletonText lines={2} />
        </div>
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} variant="text" height="1rem" width="70%" />
          ))}
        </div>
      </div>
      
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="border-b border-gray-100 p-4 last:border-b-0"
        >
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                variant="text"
                height="1rem"
                width={colIndex === 0 ? '90%' : '60%'}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonKPICard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="text" width="40%" height="1rem" />
        <Skeleton variant="circular" width={40} height={40} />
      </div>
      <Skeleton variant="text" width="50%" height="2rem" className="mb-2" />
      <Skeleton variant="text" width="60%" height="0.875rem" />
    </div>
  )
}

export function SkeletonForm() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" width="30%" height="0.875rem" />
          <Skeleton variant="rounded" height="3rem" />
        </div>
      ))}
      <Skeleton variant="rounded" height="3rem" width="100%" />
    </div>
  )
}

export function SkeletonCalendar() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton variant="text" width="40%" height="1.5rem" />
        <div className="flex gap-2">
          <Skeleton variant="circular" width={36} height={36} />
          <Skeleton variant="circular" width={36} height={36} />
        </div>
      </div>
      
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} variant="text" height="1rem" />
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height="3rem" />
        ))}
      </div>
    </div>
  )
}

export function SkeletonProfile() {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary-500 to-blue-600 rounded-xl p-8">
        <div className="flex items-center gap-6">
          <Skeleton variant="circular" width={80} height={80} className="bg-white/20" />
          <div className="flex-1 space-y-3">
            <Skeleton variant="text" width="40%" height="1.5rem" className="bg-white/30" />
            <Skeleton variant="text" width="60%" height="1rem" className="bg-white/20" />
          </div>
        </div>
      </div>
      
      {/* Form Sections */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <Skeleton variant="text" width="30%" height="1.5rem" className="mb-6" />
          <SkeletonForm />
        </div>
      ))}
    </div>
  )
}
