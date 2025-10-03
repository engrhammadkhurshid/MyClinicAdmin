import { createServerComponentClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Phone, Mail, MapPin, FileText } from 'lucide-react'
import dayjs from 'dayjs'
import { extractIdFromSlug, createPatientSlug } from '@/lib/slugify'

async function getPatientProfile(slug: string) {
  const supabase = await createServerComponentClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error('[Patient Profile] No user found in session')
    return null
  }

  // First, try to extract ID from slug
  const shortId = extractIdFromSlug(slug)
  
  if (!shortId) {
    console.error('[Patient Profile] Invalid slug format:', slug)
    return null
  }

  console.log('[Patient Profile] Extracted ID from slug:', shortId)

  // Get all patients for this user and find the one matching the short ID
  const { data: patients, error: patientsError } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', user.id)

  if (patientsError) {
    console.error('[Patient Profile] Error fetching patients:', patientsError)
    return null
  }

  // Find patient whose ID starts with the short ID from the slug
  const patient = (patients as any[])?.find((p: any) => p.id.startsWith(shortId))

  if (!patient) {
    console.error('[Patient Profile] Patient not found for slug:', slug)
    return null
  }

  // Verify the slug matches the expected format (optional redirect if wrong format)
  const expectedSlug = createPatientSlug(patient.full_name, patient.id)
  if (slug !== expectedSlug) {
    console.warn('[Patient Profile] Slug mismatch. Expected:', expectedSlug, 'Got:', slug)
    // Continue anyway for backward compatibility
  }

  console.log('[Patient Profile] Patient found:', patient.full_name)

  // Get appointments for this patient
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', patient.id)
    .eq('user_id', user.id)
    .order('appointment_date', { ascending: false })

  // Get attachments for this patient
  const { data: attachments } = await supabase
    .from('attachments')
    .select('*')
    .eq('patient_id', patient.id)
    .eq('user_id', user.id)
    .order('uploaded_at', { ascending: false })

  return {
    patient: patient as any,
    appointments: (appointments || []) as any[],
    attachments: (attachments || []) as any[],
  }
}

export default async function PatientProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getPatientProfile(slug)

  if (!data) {
    notFound()
  }

  const { patient, appointments, attachments } = data

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/patients">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{patient.full_name}</h1>
          <p className="text-gray-600">Patient Profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Gender</p>
                <p className="font-medium text-gray-900">{patient.gender}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Age</p>
                <p className="font-medium text-gray-900">{patient.age} years</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Phone
                </p>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{patient.phone}</p>
                  {patient.phone && (
                    <a
                      href={`https://wa.me/${patient.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
                      title="Chat on WhatsApp"
                    >
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>

              {patient.email && (
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email
                  </p>
                  <p className="font-medium text-gray-900">{patient.email}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Address
                </p>
                <p className="font-medium text-gray-900">{patient.address}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Labels</p>
                <div className="flex flex-wrap gap-2">
                  {patient.labels.map((label: string) => (
                    <span
                      key={label}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Registered</p>
                <p className="font-medium text-gray-900">
                  {dayjs(patient.created_at).format('MMMM D, YYYY')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Visit History and Medical Records */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visit History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Visit History</h2>
              <Link href={`/appointments/new?patientId=${patient.id}`}>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  + New Appointment
                </button>
              </Link>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No appointments yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment: any) => (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {appointment.visit_type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {dayjs(appointment.appointment_date).format('MMM D, YYYY • h:mm A')}
                      </p>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Diagnosis:</p>
                      <p className="text-gray-900">{appointment.diagnosis}</p>
                    </div>

                    {appointment.notes && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                        <p className="text-gray-600 text-sm">{appointment.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h2>

            {attachments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No attachments yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {attachments.map((attachment: any) => (
                  <a
                    key={attachment.id}
                    href={attachment.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition"
                  >
                    <FileText className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {attachment.file_name}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {dayjs(attachment.uploaded_at).format('MMM D, YYYY')}
                    </p>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
