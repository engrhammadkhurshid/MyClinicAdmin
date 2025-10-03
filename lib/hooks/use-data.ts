import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Generic fetcher for Supabase
const fetcher = async (key: string, query: () => Promise<any>) => {
  const { data, error } = await query()
  if (error) throw error
  return data
}

// Dashboard KPIs with caching
export function useDashboardKPIs() {
  return useSWR(
    'dashboard-kpis',
    async () => {
      const [patientsRes, appointmentsRes] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }),
        supabase.from('appointments').select('id', { count: 'exact', head: true })
      ])
      
      return {
        totalPatients: patientsRes.count || 0,
        totalAppointments: appointmentsRes.count || 0,
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    }
  )
}

// Patients list with pagination
export function usePatients(page = 1, pageSize = 20, searchQuery = '') {
  return useSWR(
    ['patients', page, pageSize, searchQuery],
    async () => {
      let query = supabase
        .from('patients')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
      }

      const { data, error, count } = await query

      if (error) throw error

      return {
        patients: data || [],
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )
}

// Single patient details
export function usePatient(id: string | null) {
  return useSWR(
    id ? ['patient', id] : null,
    async () => {
      if (!id) return null
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )
}

// Appointments list with pagination
export function useAppointments(page = 1, pageSize = 20, date?: string) {
  return useSWR(
    ['appointments', page, pageSize, date],
    async () => {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(full_name, phone)
        `, { count: 'exact' })
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (date) {
        query = query.eq('appointment_date', date)
      }

      const { data, error, count } = await query

      if (error) throw error

      return {
        appointments: data || [],
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    },
    {
      revalidateOnFocus: true, // Appointments change frequently
      dedupingInterval: 10000, // 10 seconds
    }
  )
}

// Recent activity
export function useRecentActivity(limit = 10) {
  return useSWR(
    ['recent-activity', limit],
    async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          created_at,
          appointment_date,
          appointment_time,
          status,
          patient:patients(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )
}

// User profile
export function useProfile(userId: string | undefined) {
  return useSWR(
    userId ? ['profile', userId] : null,
    async () => {
      if (!userId) return null
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes (profile rarely changes)
    }
  )
}

// Optimistic update helpers - use these with useSWRConfig
// Example: const { mutate } = useSWRConfig()
// mutate(key => Array.isArray(key) && key[0] === 'patients')

