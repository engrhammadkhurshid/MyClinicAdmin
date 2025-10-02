import Link from 'next/link'
import { createServerComponentClient } from '@/lib/supabase/server'
import { Plus, Calendar as CalendarIcon } from 'lucide-react'
import { format, subMonths, addDays } from 'date-fns'
import { AppointmentCalendar } from '@/components/AppointmentCalendar'
import { getCurrentPKT } from '@/lib/timezone'

async function getAppointments() {
  const supabase = await createServerComponentClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { appointments: [], calendarAppointments: [] }

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      patients (*)
    `)
    .eq('user_id', user.id)
    .order('appointment_date', { ascending: false })

  // Get appointments for calendar (last 2 months + next 2 months)
  const nowPKT = getCurrentPKT()
  const twoMonthsAgo = subMonths(nowPKT, 2)
  const twoMonthsAhead = addDays(nowPKT, 60)
  
  const { data: calendarAppointments } = await supabase
    .from('appointments')
    .select('id, appointment_date, visit_type, patients(id, full_name)')
    .eq('user_id', user.id)
    .gte('appointment_date', twoMonthsAgo.toISOString())
    .lte('appointment_date', twoMonthsAhead.toISOString())
    .order('appointment_date', { ascending: true })

  const formattedCalendarAppointments = (calendarAppointments || []).map((apt: any) => ({
    id: apt.id,
    appointment_date: apt.appointment_date,
    visit_type: apt.visit_type,
    patient_name: apt.patients?.full_name || 'Unknown',
    patient_id: apt.patients?.id || '',
  }))

  return { 
    appointments: appointments || [], 
    calendarAppointments: formattedCalendarAppointments 
  }
}

export default async function AppointmentsPage() {
  const { appointments, calendarAppointments } = await getAppointments()

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Appointments</h1>
          <p className="text-sm md:text-base text-gray-600">Manage your clinic appointments</p>
        </div>
        <Link href="/appointments/new">
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold transition text-sm md:text-base">
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            New Appointment
          </button>
        </Link>
      </div>

      {/* Calendar View */}
      <div className="mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Appointments Calendar</h2>
        <AppointmentCalendar appointments={calendarAppointments} />
      </div>

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 text-center">
          <CalendarIcon className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No appointments yet</h3>
          <p className="text-sm md:text-base text-gray-600 mb-6">Create your first appointment to get started</p>
          <Link href="/appointments/new">
            <button className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold transition text-sm md:text-base">
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              Create Appointment
            </button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Visit Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Diagnosis
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.map((appointment: any) => (
                  <tr key={appointment.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {appointment.patients?.full_name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {appointment.patients?.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {format(new Date(appointment.appointment_date), 'MMM d, yyyy • h:mm a')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {appointment.visit_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 max-w-xs truncate">
                      {appointment.diagnosis}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        appointment.status === 'scheduled'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'completed'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
