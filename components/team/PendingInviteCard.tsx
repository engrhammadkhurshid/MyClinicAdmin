'use client'

import { Mail, User, Clock, Copy, Trash2, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface PendingInviteCardProps {
  invite: any
}

export default function PendingInviteCard({ invite }: PendingInviteCardProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const inviteLink = `${window.location.origin}/invite/${invite.token}`
  const expiresAt = new Date(invite.expires_at)
  const createdAt = new Date(invite.created_at)
  const hoursRemaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)))

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    toast.success('Invite link copied to clipboard!')
  }

  const handleRevoke = async () => {
    if (!confirm(`Are you sure you want to revoke the invitation for ${invite.email}?`)) {
      return
    }

    setLoading(true)
    
    try {
      const { error } = await supabase
        .from('staff_invites')
        .delete()
        .eq('id', invite.id)

      if (error) throw error

      toast.success('Invitation revoked')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to revoke invitation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-100 p-2 rounded-lg">
            <Mail className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{invite.full_name || 'Unnamed'}</h3>
            <p className="text-sm text-gray-600">{invite.email}</p>
          </div>
        </div>
        <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-semibold rounded-full">
          Pending
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">
            {hoursRemaining > 0 ? (
              <>Expires in {hoursRemaining}h</>
            ) : (
              <span className="text-red-600 font-medium">Expired</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">
            Sent {createdAt.toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="bg-white border border-yellow-300 rounded-lg p-3 mb-4">
        <p className="text-xs text-gray-600 mb-1">Invite Link:</p>
        <p className="text-xs font-mono text-gray-800 break-all">{inviteLink}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCopyLink}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-white border border-yellow-300 text-yellow-700 font-medium rounded-lg hover:bg-yellow-50 transition-colors text-sm"
        >
          <Copy className="w-4 h-4" />
          Copy Link
        </button>
        <button
          onClick={handleRevoke}
          disabled={loading}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-white border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors text-sm disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          Revoke
        </button>
      </div>
    </div>
  )
}
