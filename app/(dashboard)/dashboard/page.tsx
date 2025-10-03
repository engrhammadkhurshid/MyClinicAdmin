import { createServerComponentClient } from '@/lib/supabase/server'
import { DashboardKPIs, defaultKPIs } from '@/components/DashboardKPIs'
import { QuickActions } from '@/components/QuickActions'
import { RecentActivityFeed } from '@/components/RecentActivityFeed'
import { AppointmentCalendar } from '@/components/AppointmentCalendar'
import dayjs from 'dayjs'
import { getCurrentPKT, toPKT } from '@/lib/timezone'

export const revalidate = 300 // Revalidate every 5 minutes

async function getDashboardData() {
  const supabase = await createServerComponentClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get user profile for name
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
  
  const userName = (profile && profile.length > 0) ? (profile[0] as any).name : 'User'

  // Use PKT for all date calculations
  const nowPKT = getCurrentPKT()
  const today = dayjs(nowPKT).startOf('day')

  // Get total patients
  const { count: totalPatients } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Get appointments today (PKT)
  const { count: appointmentsToday } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('appointment_date', today.toISOString())
    .lt('appointment_date', dayjs(today).add(1, 'day').toISOString())

  // Get yesterday's appointments for comparison (PKT)
  const yesterday = dayjs(today).subtract(1, 'day')
  const { count: appointmentsYesterday } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('appointment_date', yesterday.toISOString())
    .lt('appointment_date', today.toISOString())

  // Get this week's patients (last 7 days in PKT)
  const sevenDaysAgo = dayjs(today).subtract(7, 'day')
  const { count: weeklyPatients } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('appointment_date', sevenDaysAgo.toISOString())
    .lte('appointment_date', today.toISOString())

  // Get previous week's patients for comparison (PKT)
  const fourteenDaysAgo = dayjs(today).subtract(14, 'day')
  const { count: previousWeekPatients } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('appointment_date', fourteenDaysAgo.toISOString())
    .lt('appointment_date', sevenDaysAgo.toISOString())

  // Get monthly visits (PKT)
  const startOfThisMonth = dayjs(nowPKT).startOf('month')
  const { count: monthlyVisits } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('appointment_date', startOfThisMonth.toISOString())

  // Get last month visits for comparison (PKT)
  const startOfLastMonth = dayjs(nowPKT).subtract(1, 'month').startOf('month')
  const { count: lastMonthVisits } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('appointment_date', startOfLastMonth.toISOString())
    .lt('appointment_date', startOfThisMonth.toISOString())

  // Calculate monthly change
  const monthlyChange = lastMonthVisits
    ? Math.round(((monthlyVisits || 0) - lastMonthVisits) / lastMonthVisits * 100)
    : 0

  // Calculate weekly change
  const weeklyChange = previousWeekPatients
    ? Math.round(((weeklyPatients || 0) - previousWeekPatients) / previousWeekPatients * 100)
    : 0

  // Calculate today vs yesterday change
  const todayChange = appointmentsYesterday
    ? (appointmentsToday || 0) - appointmentsYesterday
    : 0

  // Get follow-ups due (next 7 days in PKT)
  const nextWeek = dayjs(nowPKT).add(7, 'day')
  const { data: followUps } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', user.id)
    .contains('labels', ['Follow-up'])
    .gte('appointment_date', nowPKT.toISOString())
    .lte('appointment_date', nextWeek.toISOString())

  // Get recent activities
  const { data: recentAppointments } = await supabase
    .from('appointments')
    .select('*, patients(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const activities = (recentAppointments || []).map((apt: any) => ({
    id: apt.id,
    type: 'appointment' as const,
    title: `Appointment with ${apt.patients?.full_name || 'Unknown'}`,
    description: `${apt.visit_type} - ${dayjs(apt.appointment_date).format('MMM D, YYYY')}`,
    timestamp: new Date(apt.created_at),
  }))

  // Get all appointments for calendar (last 2 months + next 2 months in PKT)
  const twoMonthsAgo = dayjs(nowPKT).subtract(2, 'month')
  const twoMonthsAhead = dayjs(nowPKT).add(60, 'day')
  const { data: calendarAppointments } = await supabase
    .from('appointments')
    .select('id, appointment_date, visit_type, patients(id, full_name)')
    .eq('user_id', user.id)
    .gte('appointment_date', twoMonthsAgo.toISOString())
    .lte('appointment_date', twoMonthsAhead.toISOString())
    .order('appointment_date', { ascending: true })

  const formattedAppointments = (calendarAppointments || []).map((apt: any) => ({
    id: apt.id,
    appointment_date: apt.appointment_date,
    visit_type: apt.visit_type,
    patient_name: apt.patients?.full_name || 'Unknown',
    patient_id: apt.patients?.id || '',
  }))

  return {
    userName: userName,
    kpis: [
      {
        ...defaultKPIs[0],
        value: totalPatients || 0,
        change: 'Total registered patients',
        trend: 'up' as const,
      },
      {
        ...defaultKPIs[1],
        value: appointmentsToday || 0,
        change: todayChange > 0 
          ? `+${todayChange} more than yesterday` 
          : todayChange < 0 
          ? `${Math.abs(todayChange)} less than yesterday`
          : 'Same as yesterday',
        trend: todayChange > 0 ? 'up' as const : todayChange < 0 ? 'down' as const : 'neutral' as const,
      },
      {
        ...defaultKPIs[2],
        value: weeklyPatients || 0,
        change: weeklyChange !== 0 
          ? `${weeklyChange > 0 ? '+' : ''}${weeklyChange}% from last week`
          : 'Same as last week',
        trend: weeklyChange > 0 ? 'up' as const : weeklyChange < 0 ? 'down' as const : 'neutral' as const,
      },
      {
        ...defaultKPIs[3],
        value: monthlyVisits || 0,
        change: monthlyChange !== 0
          ? `${monthlyChange > 0 ? '+' : ''}${monthlyChange}% from last month`
          : 'Same as last month',
        trend: monthlyChange > 0 ? 'up' as const : monthlyChange < 0 ? 'down' as const : 'neutral' as const,
      },
      {
        ...defaultKPIs[4],
        value: followUps?.length || 0,
        change: 'Patients requiring follow-up',
        trend: 'neutral' as const,
      },
    ],
    activities,
    appointments: formattedAppointments,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  if (!data) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {data.userName}! Here&apos;s your clinic overview</p>
      </div>

      {/* KPIs with built-in heading */}
      <div className="mb-8">
        <DashboardKPIs kpis={data.kpis} />
      </div>

      {/* Calendar View */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Appointments Calendar</h2>
        <AppointmentCalendar appointments={data.appointments} />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <QuickActions />
      </div>

      {/* Recent Activity */}
      <div>
        <RecentActivityFeed activities={data.activities} />
      </div>
    </div>
  )
}
