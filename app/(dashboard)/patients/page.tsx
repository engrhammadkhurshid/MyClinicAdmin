import Link from 'next/link'
import { createServerComponentClient } from '@/lib/supabase/server'
import { Plus, Users as UsersIcon } from 'lucide-react'
import { PatientTable } from '@/components/PatientTable'

export const revalidate = 300 // Revalidate every 5 minutes

async function getPatients() {
  const supabase = await createServerComponentClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return patients || []
}

export default async function PatientsPage() {
  const patients = await getPatients()

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Patients</h1>
          <p className="text-sm md:text-base text-gray-600">Manage your patient records</p>
        </div>
        <Link href="/patients/new">
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold transition text-sm md:text-base">
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            Add Patient
          </button>
        </Link>
      </div>

      {/* Patient Table or Empty State */}
      {patients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 text-center">
          <UsersIcon className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No patients yet</h3>
          <p className="text-sm md:text-base text-gray-600 mb-6">Add your first patient to get started</p>
          <Link href="/patients/new">
            <button className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold transition text-sm md:text-base">
              <Plus className="w-5 h-5" />
              Add Patient
            </button>
          </Link>
        </div>
      ) : (
        <PatientTable initialPatients={patients} />
      )}
    </div>
  )
}
