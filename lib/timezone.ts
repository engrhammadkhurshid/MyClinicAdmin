// Pakistan Standard Time (PKT) utilities
// PKT is UTC+5:00

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// Extend dayjs with plugins
dayjs.extend(utc)
dayjs.extend(timezone)

// Set default timezone to PKT
dayjs.tz.setDefault('Asia/Karachi')

const PKT_TIMEZONE = 'Asia/Karachi'

/**
 * Convert any date to Pakistan Standard Time
 * @param date - Date object, ISO string, or timestamp
 * @returns Date object adjusted to PKT
 */
export function toPKT(date: Date | string | number): Date {
  return dayjs(date).tz(PKT_TIMEZONE).toDate()
}

/**
 * Get current date/time in Pakistan Standard Time
 * @returns Date object in PKT
 */
export function getCurrentPKT(): Date {
  return toPKT(new Date())
}

/**
 * Format a date to Pakistan Standard Time
 * @param date - Date object, ISO string, or timestamp
 * @param formatStr - Format string (e.g., 'MMM d, yyyy h:mm a')
 * @returns Formatted date string in PKT
 */
export function formatToPKT(date: Date | string | number, formatStr: string = 'MMM d, yyyy h:mm a'): string {
  return dayjs(date).tz(PKT_TIMEZONE).format(formatStr)
}

/**
 * Format date for display in PKT with full details
 * @param date - Date to format
 * @returns Formatted string like "October 2, 2025 at 3:45 PM PKT"
 */
export function formatPKTLong(date: Date | string | number): string {
  const pktDate = dayjs(date).tz(PKT_TIMEZONE)
  const formatted = pktDate.format('MMMM D, YYYY')
  const time = pktDate.format('h:mm A')
  return `${formatted} at ${time} PKT`
}

/**
 * Format date for display in PKT (short version)
 * @param date - Date to format
 * @returns Formatted string like "Oct 2, 2025 3:45 PM PKT"
 */
export function formatPKTShort(date: Date | string | number): string {
  return formatToPKT(date, 'MMM d, yyyy h:mm a') + ' PKT'
}

/**
 * Format just the time in PKT
 * @param date - Date to format
 * @returns Formatted time string like "3:45 PM"
 */
export function formatTimePKT(date: Date | string | number): string {
  return formatToPKT(date, 'h:mm a')
}

/**
 * Format just the date in PKT
 * @param date - Date to format
 * @returns Formatted date string like "Oct 2, 2025"
 */
export function formatDatePKT(date: Date | string | number): string {
  return formatToPKT(date, 'MMM d, yyyy')
}

/**
 * Get date input value for forms (YYYY-MM-DD in PKT)
 * @param date - Date to format
 * @returns Date string for input field
 */
export function getDateInputValuePKT(date?: Date | string | number): string {
  const pktDate = date ? dayjs(date).tz(PKT_TIMEZONE) : dayjs().tz(PKT_TIMEZONE)
  return pktDate.format('YYYY-MM-DD')
}

/**
 * Get time input value for forms (HH:mm in PKT)
 * @param date - Date to format
 * @returns Time string for input field
 */
export function getTimeInputValuePKT(date?: Date | string | number): string {
  const pktDate = date ? dayjs(date).tz(PKT_TIMEZONE) : dayjs().tz(PKT_TIMEZONE)
  return pktDate.format('HH:mm')
}

/**
 * Get timezone label
 * @returns 'PKT'
 */
export function getTimezoneLabel(): string {
  return 'PKT (UTC+5)'
}
