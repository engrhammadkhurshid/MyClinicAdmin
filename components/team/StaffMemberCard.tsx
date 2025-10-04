'use client'

import { Shield, Mail, User, Calendar, MoreVertical, Trash2, Ban, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface StaffMemberCardProps {
  staff: any
}

export default function StaffMemberCard({ staff }: StaffMemberCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const isOwner = staff.role === 'owner'
  const isActive = staff.status === 'active'

  const handleToggleStatus = async () => {
    setLoading(true)
    const newStatus = isActive ? 'inactive' : 'active'
    
    try {
      const { error } = await supabase
        .from('staff_members')
        .update({ status: newStatus })
        .eq('id', staff.id)

      if (error) throw error

      toast.success(`Staff member ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
      router.refresh()
      setShowMenu(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!confirm(`Are you sure you want to remove ${staff.profile?.name || staff.user?.email}?`)) {
      return
    }

    setLoading(true)
    
    try {
      const { error } = await supabase
        .from('staff_members')
        .delete()
        .eq('id', staff.id)

      if (error) throw error

      toast.success('Staff member removed')
      router.refresh()
      setShowMenu(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove staff member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${isActive ? 'border-gray-200' : 'border-gray-300 bg-gray-50'} p-6 relative`}>
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        {!isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={handleToggleStatus}
                  disabled={loading}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                >
                  {isActive ? (
                    <>
                      <Ban className="w-4 h-4 text-yellow-600" />
                      <span>Deactivate</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Activate</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleRemove}
                  disabled={loading}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Role Badge */}
      <div className="mb-4">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
          isOwner 
            ? 'bg-purple-100 text-purple-700' 
            : 'bg-blue-100 text-blue-700'
        }`}>
          <Shield className="w-3 h-3" />
          {isOwner ? 'Owner' : 'Manager'}
        </span>
      </div>

      {/* User Info */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
            {(staff.profile?.name || staff.user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {staff.profile?.name || 'No name set'}
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-1 truncate">
              <Mail className="w-3 h-3" />
              {staff.user?.email}
            </p>
          </div>
        </div>

        {/* Staff Details */}
        <div className="space-y-2 pt-3 border-t border-gray-200">
          {staff.profile?.specialty && (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{staff.profile.specialty}</span>
            </div>
          )}
          {staff.profile?.phone && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">📞</span>
              <span className="text-gray-600">{staff.profile.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">
              Joined {new Date(staff.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Staff ID */}
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">Staff ID</p>
          <p className="text-sm font-mono text-gray-700 truncate">{staff.staff_id}</p>
        </div>

        {/* Status */}
        {!isActive && (
          <div className="pt-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">
              <Ban className="w-3 h-3" />
              Inactive
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
