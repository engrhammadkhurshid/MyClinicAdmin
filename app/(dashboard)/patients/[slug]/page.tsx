import { createServerComponentClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Phone, Mail, MapPin, FileText, User, Activity, Cake, Trash2, ImageIcon } from 'lucide-react'
import dayjs from 'dayjs'
import { extractIdFromSlug, createPatientSlug } from '@/lib/slugify'
import { calculateAge } from '@/lib/imageCompression'
import { MedicalRecordsGallery } from '@/components/MedicalRecordsGallery'

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
    .from('patient_attachments')
    .select('*')
    .eq('patient_id', patient.id)
    .order('created_at', { ascending: false })

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

  const calculatedAge = patient.date_of_birth ? calculateAge(patient.date_of_birth) : `${patient.age} years`

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/patients">
            <button className="p-2 hover:bg-white rounded-lg transition shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{patient.full_name}</h1>
            <p className="text-gray-600">Patient Profile</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Patient Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Full Name</p>
                  <p className="font-medium text-gray-900">{patient.full_name}</p>
                </div>

                {patient.date_of_birth && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                      <Cake className="w-4 h-4" /> Date of Birth
                    </p>
                    <p className="font-medium text-gray-900">
                      {dayjs(patient.date_of_birth).format('MMMM D, YYYY')}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Age: {calculatedAge}</p>
                  </div>
                )}

                {!patient.date_of_birth && patient.age && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Age</p>
                    <p className="font-medium text-gray-900">{patient.age} years</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-1">Gender</p>
                  <p className="font-medium text-gray-900">{patient.gender}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Registered</p>
                  <p className="font-medium text-gray-900">
                    {dayjs(patient.created_at).format('MMMM D, YYYY')}
                  </p>
                </div>

                {patient.source && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Source</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {patient.source}
                    </span>
                  </div>
                )}

                {patient.labels && patient.labels.length > 0 && (
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
                )}
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Contact</h2>
              </div>

              <div className="space-y-4">
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
              </div>
            </div>

            {/* Medical Information Card */}
            {(patient.reason_for_visit || patient.medical_history) && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Medical Info</h2>
                </div>

                <div className="space-y-4">
                  {patient.reason_for_visit && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Reason for Visit</p>
                      <p className="text-gray-900">{patient.reason_for_visit}</p>
                    </div>
                  )}

                  {patient.medical_history && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Medical History</p>
                      <p className="text-gray-900 whitespace-pre-wrap">{patient.medical_history}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Visit History and Medical Records */}
          <div className="lg:col-span-2 space-y-6">
            {/* Medical Records Gallery */}
            {attachments && attachments.length > 0 && (
              <MedicalRecordsGallery attachments={attachments as any[]} />
            )}

            {/* Visit History */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Visit History</h2>
                </div>
                <Link href={`/appointments/new?patientId=${patient.id}`}>
                  <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition text-sm">
                    + New Appointment
                  </button>
                </Link>
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No appointments yet</p>
                  <p className="text-sm mt-1">Create the first appointment for this patient</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment: any) => (
                    <div
                      key={appointment.id}
                      className="border-2 border-gray-200 rounded-xl p-5 hover:border-orange-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {appointment.visit_type}
                          </span>
                          {appointment.source && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              {appointment.source}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-600">
                          {dayjs(appointment.appointment_date).format('MMM D, YYYY • h:mm A')}
                        </p>
                      </div>
                      
                      <div className="mt-3 space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Diagnosis:</p>
                          <p className="text-gray-900">{appointment.diagnosis}</p>
                        </div>

                        {appointment.notes && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Notes:</p>
                            <p className="text-gray-600">{appointment.notes}</p>
                          </div>
                        )}

                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            Status: <span className="font-medium capitalize">{appointment.status}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
