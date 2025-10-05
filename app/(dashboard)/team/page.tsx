import { redirect } from 'next/navigation'
import { requireOwner } from '@/lib/auth/role'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Users, UserPlus, Mail, Clock, CheckCircle, XCircle, Shield, UserCheck } from 'lucide-react'
import InviteManagerButton from '@/components/team/InviteManagerButton'
import StaffMemberCard from '@/components/team/StaffMemberCard'
import PendingInviteCard from '@/components/team/PendingInviteCard'

export const metadata = {
  title: 'Team Management - MyClinicAdmin',
  description: 'Manage your clinic staff and invitations',
}

async function getTeamData() {
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

  // Get role and verify owner
  const role = await requireOwner()

  // Fetch staff members with profile data
  const { data: staffMembers, error: staffError } = await supabase
    .from('staff_members')
    .select(`
      id,
      staff_id,
      role,
      status,
      created_at,
      user:user_id (
        id,
        email
      ),
      profile:user_id (
        name,
        phone,
        specialty
      )
    `)
    .eq('clinic_id', role.clinic_id)
    .order('created_at', { ascending: false })

  // Fetch pending invites
  const { data: pendingInvites, error: invitesError } = await supabase
    .from('staff_invites')
    .select('*')
    .eq('clinic_id', role.clinic_id)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (staffError) {
    console.error('Error fetching staff:', staffError)
  }

  if (invitesError) {
    console.error('Error fetching invites:', invitesError)
  }

  return {
    clinic: role.clinic,
    staffMembers: staffMembers || [],
    pendingInvites: pendingInvites || [],
  }
}

export default async function TeamPage() {
  try {
    const { clinic, staffMembers, pendingInvites } = await getTeamData()

    const activeStaff = staffMembers.filter((s: any) => s.status === 'active')
    const inactiveStaff = staffMembers.filter((s: any) => s.status === 'inactive')

    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                Team Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                Manage staff for <span className="font-semibold text-blue-600 break-words">{clinic.name}</span>
              </p>
            </div>
            <InviteManagerButton clinicId={clinic.id} />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Active Staff</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{activeStaff.length}</p>
              </div>
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
                <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Pending Invites</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{pendingInvites.length}</p>
              </div>
              <div className="bg-yellow-100 p-2 sm:p-3 rounded-lg">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Members</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{staffMembers.length}</p>
              </div>
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Pending Invitations</h2>
              <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold">
                {pendingInvites.length}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {pendingInvites.map((invite: any) => (
                <PendingInviteCard key={invite.id} invite={invite} />
              ))}
            </div>
          </div>
        )}

        {/* Active Staff Members */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Active Staff</h2>
            <span className="bg-green-100 text-green-700 px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold">
              {activeStaff.length}
            </span>
          </div>
          {activeStaff.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-6 sm:p-8 text-center">
              <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
              <p className="text-sm sm:text-base text-gray-600">No active staff members yet</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Invite managers to join your clinic</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {activeStaff.map((staff: any) => (
                <StaffMemberCard key={staff.id} staff={staff} />
              ))}
            </div>
          )}
        </div>

        {/* Inactive Staff (if any) */}
        {inactiveStaff.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Inactive Staff</h2>
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold">
                {inactiveStaff.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {inactiveStaff.map((staff: any) => (
                <StaffMemberCard key={staff.id} staff={staff} />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  } catch (error: any) {
    // If user is not an owner, redirect to dashboard
    if (error.message.includes('Owner access required') || error.message.includes('Unauthorized')) {
      redirect('/dashboard')
    }
    throw error
  }
}
