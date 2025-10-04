import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import InviteAcceptanceForm from '@/components/team/InviteAcceptanceForm'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

export const metadata = {
  title: 'Accept Invitation - MyClinicAdmin',
  description: 'Accept your invitation to join a clinic',
}

async function getInviteData(token: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // Fetch invite with clinic details
  const { data: invite, error } = await supabase
    .from('staff_invites')
    .select(`
      *,
      clinic:clinic_id (
        id,
        name,
        type,
        location
      )
    `)
    .eq('token', token)
    .is('accepted_at', null)
    .single()

  if (error || !invite) {
    return { invite: null, status: 'not_found' }
  }

  // Check if expired
  const expiresAt = new Date(invite.expires_at)
  if (expiresAt < new Date()) {
    return { invite, status: 'expired' }
  }

  return { invite, status: 'valid' }
}

export default async function InviteAcceptPage({ params }: { params: { token: string } }) {
  const { invite, status } = await getInviteData(params.token)

  // Invalid or not found
  if (status === 'not_found' || !invite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">
            This invitation link is invalid or has already been used.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    )
  }

  // Expired
  if (status === 'expired') {
    const clinic = Array.isArray(invite.clinic) ? invite.clinic[0] : invite.clinic
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Expired</h1>
          <p className="text-gray-600 mb-4">
            Your invitation to join <strong>{clinic?.name}</strong> has expired.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Please contact the clinic owner for a new invitation.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    )
  }

  // Valid invitation - show acceptance form
  const clinic = Array.isArray(invite.clinic) ? invite.clinic[0] : invite.clinic
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Invitation Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">You're Invited!</h1>
          <p className="text-lg text-gray-600 mb-4">
            Join <strong className="text-blue-600">{clinic?.name}</strong> as a Manager
          </p>
          {clinic?.location && (
            <p className="text-gray-500 text-sm">
              📍 {clinic.location}
            </p>
          )}
        </div>

        {/* Acceptance Form */}
        <InviteAcceptanceForm 
          invite={invite}
          clinic={clinic}
        />
      </div>
    </div>
  )
}
