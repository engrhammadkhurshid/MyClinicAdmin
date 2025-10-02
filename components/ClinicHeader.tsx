'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ClinicHeaderProps {
  className?: string
}

export function ClinicHeader({ className = '' }: ClinicHeaderProps) {
  const [clinicName, setClinicName] = useState<string>('')
  const [clinicType, setClinicType] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchClinicInfo() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('clinic_name, clinic_type')
            .eq('id', user.id)

          if (data && data.length > 0) {
            setClinicName((data[0] as any).clinic_name || 'MyClinic Admin')
            setClinicType((data[0] as any).clinic_type || 'Healthcare Facility')
          }
        }
      } catch (error) {
        console.error('Error fetching clinic info:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchClinicInfo()
  }, [supabase])

  if (loading) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <div className="h-8 w-64 bg-gray-200 animate-pulse rounded-lg mx-auto mb-2"></div>
        <div className="h-4 w-48 bg-gray-100 animate-pulse rounded mx-auto"></div>
      </div>
    )
  }

  return (
    <div className={`text-center py-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-blue-50 ${className}`}>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
        {clinicName}
      </h1>
      <p className="text-gray-600 text-sm md:text-base">
        {clinicType}
      </p>
    </div>
  )
}
