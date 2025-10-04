'use client'

import { useState } from 'react'
import { UserPlus, X, Mail, User, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface InviteManagerButtonProps {
  clinicId: string
}

export default function InviteManagerButton({ clinicId }: InviteManagerButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
  })
  const [errors, setErrors] = useState<{ email?: string; fullName?: string }>({})
  
  const router = useRouter()
  const supabase = createClient()

  const validateForm = () => {
    const newErrors: { email?: string; fullName?: string } = {}
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generateInviteToken = () => {
    return crypto.randomUUID() + '-' + Date.now().toString(36)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    const loadingToast = toast.loading('Checking email...')

    try {
      const emailToInvite = formData.email.toLowerCase().trim()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Not authenticated')
      }

      // Check 1: Can't invite yourself
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single()

      if (currentUserProfile?.email?.toLowerCase() === emailToInvite) {
        throw new Error("You can't invite yourself!")
      }

      // Check 2: Check if email already exists in profiles (registered user)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, email')
        .ilike('email', emailToInvite)
        .single()

      if (existingProfile) {
        // Check 3: Is this user already a staff member in THIS clinic?
        const { data: existingStaff } = await supabase
          .from('staff_members')
          .select('role, status')
          .eq('clinic_id', clinicId)
          .eq('user_id', existingProfile.id)
          .single()

        if (existingStaff) {
          if (existingStaff.status === 'active') {
            throw new Error(`This user is already an ${existingStaff.role} in your clinic`)
          } else if (existingStaff.status === 'inactive') {
            throw new Error('This user is inactive. Please activate them from the staff list instead.')
          } else {
            throw new Error('This user is already associated with your clinic')
          }
        }

        // Check 4: Is this user an owner of another clinic?
        const { data: ownerCheck } = await supabase
          .from('staff_members')
          .select('role')
          .eq('user_id', existingProfile.id)
          .eq('role', 'owner')
          .single()

        if (ownerCheck) {
          throw new Error('This user is already a clinic owner. They cannot be invited as a manager.')
        }

        // User exists but not in this clinic - can proceed with invite
        toast.loading('User found. Sending invitation...', { id: loadingToast })
      }

      // Check 5: Check for existing pending invites
      const { data: pendingInvite } = await supabase
        .from('staff_invites')
        .select('expires_at')
        .eq('clinic_id', clinicId)
        .ilike('email', emailToInvite)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (pendingInvite) {
        throw new Error('An active invitation already exists for this email. Please wait for it to expire or revoke it first.')
      }

      // All checks passed - create invite
      toast.loading('Creating invitation...', { id: loadingToast })
      
      const token = generateInviteToken()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 48) // 48 hours expiry

      const { error: inviteError } = await supabase
        .from('staff_invites')
        .insert({
          clinic_id: clinicId,
          email: emailToInvite,
          full_name: formData.fullName.trim(),
          role: 'manager',
          token,
          expires_at: expiresAt.toISOString(),
          invited_by: user.id
        })

      if (inviteError) {
        throw inviteError
      }

      // Send invitation email
      const inviteLink = `${window.location.origin}/invite/${token}`
      
      // Get clinic name for email
      const { data: clinicData } = await supabase
        .from('clinic')
        .select('name')
        .eq('id', clinicId)
        .single()
      
      try {
        const emailResponse = await fetch('/api/send-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailToInvite,
            inviteLink,
            clinicName: clinicData?.name || 'your clinic',
            inviterName: user.user_metadata?.full_name || user.email
          })
        })

        const emailResult = await emailResponse.json()

        if (!emailResponse.ok) {
          throw new Error(emailResult.error || 'Failed to send email')
        }

        toast.success('Invitation sent successfully!', { id: loadingToast })

        // In development, also show the link
        if (process.env.NODE_ENV === 'development' && emailResult.inviteLink) {
          toast(
            (t) => (
              <div className="flex flex-col gap-2">
                <p className="font-semibold text-sm">📧 Email sent! Dev link:</p>
                <div className="bg-gray-100 p-2 rounded text-xs break-all">
                  {emailResult.inviteLink}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(emailResult.inviteLink)
                    toast.success('Link copied!', { id: t.id })
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Copy Link
                </button>
              </div>
            ),
            { duration: 8000 }
          )
        }
      } catch (emailError: any) {
        // Email failed but invite was created - show fallback
        console.error('Email sending failed:', emailError)
        toast.error('Invite created but email failed to send', { id: loadingToast })
        
        // Show the link as fallback
        toast(
          (t) => (
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-orange-600">⚠️ Email failed - Share manually:</p>
              <div className="bg-gray-100 p-2 rounded text-xs break-all">
                {inviteLink}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink)
                  toast.success('Link copied!', { id: t.id })
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Copy Link
              </button>
            </div>
          ),
          { duration: 15000 }
        )
      }

      // Reset form and close modal
      setFormData({ email: '', fullName: '' })
      setIsOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation', { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
      >
        <UserPlus className="w-5 h-5" />
        Invite Manager
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Invite Manager</h2>
              </div>
              <p className="text-gray-600 text-sm">
                Send an invitation to add a new manager to your clinic
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value })
                      if (errors.fullName) setErrors({ ...errors, fullName: undefined })
                    }}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value })
                      if (errors.email) setErrors({ ...errors, email: undefined })
                    }}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="manager@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The invitation will expire in 48 hours. The manager will need to create an account or sign in to accept.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Invitation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
