'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react'
import Link from 'next/link'
import { formatTimePKT, toPKT, getCurrentPKT } from '@/lib/timezone'

// Extend dayjs with plugins
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

interface Appointment {
  id: string
  appointment_date: string
  visit_type: string
  patient_name: string
  patient_id: string
}

interface AppointmentCalendarProps {
  appointments: Appointment[]
}

export function AppointmentCalendar({ appointments }: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(getCurrentPKT())
  const [selectedDate, setSelectedDate] = useState<Date | null>(getCurrentPKT())

  const monthStart = dayjs(currentMonth).startOf('month')
  const monthEnd = dayjs(monthStart).endOf('month')
  const startDate = dayjs(monthStart).startOf('week')
  const endDate = dayjs(monthEnd).endOf('week')

  const dateFormat = 'MMMM yyyy'
  const dayFormat = 'EEE'
  const numFormat = 'd'

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = toPKT(dayjs(apt.appointment_date).toDate())
      return dayjs(aptDate).isSame(date, 'day')
    })
  }

  // Get today's appointments (PKT)
  const todaysAppointments = getAppointmentsForDate(getCurrentPKT())

  // Get selected date appointments
  const selectedDateAppointments = selectedDate 
    ? getAppointmentsForDate(selectedDate) 
    : []

  // Generate calendar days
  const days = []
  let day = startDate

  while (day.isSameOrBefore(endDate)) {
    days.push(day)
    day = day.add(1, 'day')
  }

  const previousMonth = () => {
    setCurrentMonth(dayjs(currentMonth).subtract(1, 'month').toDate())
  }

  const nextMonth = () => {
    setCurrentMonth(dayjs(currentMonth).add(1, 'month').toDate())
  }

  return (
    <div className="space-y-6">
      {/* Today's Appointments Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Today&apos;s Appointments</h3>
        {todaysAppointments.length > 0 ? (
          <div className="space-y-3">
            {todaysAppointments.map((apt) => (
              <Link key={apt.id} href={`/patients/${apt.patient_id}`}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5" />
                      <div>
                        <p className="font-semibold">{apt.patient_name}</p>
                        <p className="text-sm text-white/80">{apt.visit_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      {formatTimePKT(apt.appointment_date)}
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-white/80">No appointments scheduled for today</p>
        )}
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {dayjs(currentMonth).format(dateFormat)}
          </h3>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(day.toDate())
            const hasAppointments = dayAppointments.length > 0
            const isCurrentMonth = day.isSame(monthStart, 'month')
            const isSelected = selectedDate && day.isSame(selectedDate, 'day')
            const isTodayDate = day.isSame(dayjs(), 'day')

            return (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(day.toDate())}
                className={`
                  relative aspect-square p-2 rounded-lg text-center transition-all
                  ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                  ${isTodayDate ? 'bg-primary-100 border-2 border-primary-500 font-bold' : ''}
                  ${isSelected && !isTodayDate ? 'bg-primary-50 border-2 border-primary-300' : ''}
                  ${!isSelected && !isTodayDate ? 'hover:bg-gray-100' : ''}
                  ${hasAppointments && !isTodayDate && !isSelected ? 'bg-green-50' : ''}
                `}
              >
                <span className="text-sm">{day.format(numFormat)}</span>
                {hasAppointments && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                    <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-primary-500 text-white rounded-full">
                      {dayAppointments.length}
                    </span>
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Selected Date Appointments */}
        {selectedDate && selectedDateAppointments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 pt-6 border-t border-gray-200"
          >
            <h4 className="font-semibold text-gray-900 mb-4">
              Appointments on {dayjs(selectedDate).format('MMMM D, YYYY')}
            </h4>
            <div className="space-y-2">
              {selectedDateAppointments.map((apt) => (
                <Link key={apt.id} href={`/patients/${apt.patient_id}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">{apt.patient_name}</p>
                        <p className="text-sm text-gray-600">{apt.visit_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {formatTimePKT(apt.appointment_date)}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {selectedDate && selectedDateAppointments.length === 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-gray-500">
            No appointments on {dayjs(selectedDate).format('MMMM D, YYYY')}
          </div>
        )}
      </div>
    </div>
  )
}
