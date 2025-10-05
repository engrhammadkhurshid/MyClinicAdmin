import { createServerComponentClient } from '@/lib/supabase/server'
import { DashboardKPIs } from '@/components/DashboardKPIs'
import { QuickActions } from '@/components/QuickActions'
import { RecentActivityFeed } from '@/components/RecentActivityFeed'
import { AppointmentCalendar } from '@/components/AppointmentCalendar'
import { PatientQueue } from '@/components/PatientQueue'
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

  // Get recent completed appointments (last 3 today)
  const { data: recentCompleted } = await supabase
    .from('appointments')
    .select('id, patients(id, full_name), visit_type')
    .eq('user_id', user.id)
    .lt('appointment_date', nowPKT.toISOString())
    .order('appointment_date', { ascending: false })
    .limit(3)

  // Get upcoming appointments (next 3)
  const { data: upcomingQueue } = await supabase
    .from('appointments')
    .select('id, patients(id, full_name), visit_type')
    .eq('user_id', user.id)
    .gte('appointment_date', nowPKT.toISOString())
    .order('appointment_date', { ascending: true })
    .limit(3)

  const recentPatients = (recentCompleted || []).map((apt: any) => ({
    id: apt.patients?.id || '',
    name: apt.patients?.full_name || 'Unknown',
    visit_type: apt.visit_type,
  }))

  const upcomingPatients = (upcomingQueue || []).map((apt: any) => ({
    id: apt.patients?.id || '',
    name: apt.patients?.full_name || 'Unknown',
    visit_type: apt.visit_type,
  }))

  return {
    userName: userName,
    kpis: [
      {
        title: 'Total Patients',
        value: totalPatients || 0,
        change: 'Total registered patients',
        icon: 'Users' as const,
        color: 'bg-primary-500',
        trend: 'up' as const,
      },
      {
        title: 'Today\'s Appointments',
        value: appointmentsToday || 0,
        change: todayChange > 0 
          ? `+${todayChange} more than yesterday` 
          : todayChange < 0 
          ? `${Math.abs(todayChange)} less than yesterday`
          : 'Same as yesterday',
        icon: 'Calendar' as const,
        color: 'bg-green-500',
        trend: todayChange > 0 ? 'up' as const : todayChange < 0 ? 'down' as const : 'neutral' as const,
      },
      {
        title: 'Weekly Patients',
        value: weeklyPatients || 0,
        change: weeklyChange !== 0 
          ? `${weeklyChange > 0 ? '+' : ''}${weeklyChange}% from last week`
          : 'Same as last week',
        icon: 'Activity' as const,
        color: 'bg-blue-500',
        trend: weeklyChange > 0 ? 'up' as const : weeklyChange < 0 ? 'down' as const : 'neutral' as const,
      },
      {
        title: 'Monthly Visits',
        value: monthlyVisits || 0,
        change: monthlyChange !== 0
          ? `${monthlyChange > 0 ? '+' : ''}${monthlyChange}% from last month`
          : 'Same as last month',
        icon: 'TrendingUp' as const,
        color: 'bg-purple-500',
        trend: monthlyChange > 0 ? 'up' as const : monthlyChange < 0 ? 'down' as const : 'neutral' as const,
      },
      {
        title: 'Follow-ups Due',
        value: followUps?.length || 0,
        change: 'Patients requiring follow-up',
        icon: 'Clock' as const,
        color: 'bg-orange-500',
        trend: 'neutral' as const,
      },
    ],
    activities,
    appointments: formattedAppointments,
    recentPatients,
    upcomingPatients,
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

      {/* KPIs */}
      <div className="mb-8">
        <DashboardKPIs kpis={data.kpis} />
      </div>

      {/* Patient Queue */}
      <div className="mb-8">
        <PatientQueue 
          recentPatients={data.recentPatients} 
          upcomingPatients={data.upcomingPatients} 
        />
      </div>

      {/* Calendar View - Weekly */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">This Week</h2>
        <AppointmentCalendar appointments={data.appointments} weeklyView={true} />
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
