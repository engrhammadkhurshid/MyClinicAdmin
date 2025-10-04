'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Mail, Lock, User, Phone, Loader2, CheckCircle } from 'lucide-react'

interface InviteAcceptanceFormProps {
  invite: any
  clinic: any
}

export default function InviteAcceptanceForm({ invite, clinic }: InviteAcceptanceFormProps) {
  const [step, setStep] = useState<'check' | 'signup' | 'otp' | 'profile'>('check')
  const [loading, setLoading] = useState(false)
  const [hasAccount, setHasAccount] = useState<boolean | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    email: invite.email,
    password: '',
    confirmPassword: '',
    otp: '',
    phone: '',
    address: '',
  })
  
  const [errors, setErrors] = useState<any>({})
  
  const router = useRouter()
  const supabase = createClient()

  // Step 1: Check if user already has an account
  // Check if user is eligible to join the clinic
  const checkEligibility = async (uid: string): Promise<boolean> => {
    const loadingToast = toast.loading('Verifying eligibility...')
    
    try {
      // 1. Check if user is the owner of this clinic
      const { data: ownerCheck } = await supabase
        .from('clinic')
        .select('name, owner_id')
        .eq('id', invite.clinic_id)
        .single()

      if (ownerCheck?.owner_id === uid) {
        toast.error('You are the owner of this clinic and cannot be invited as a manager', { id: loadingToast })
        return false
      }

      // 2. Check if user already exists in clinic_staff
      const { data: existingStaff } = await supabase
        .from('clinic_staff')
        .select('role, status')
        .eq('clinic_id', invite.clinic_id)
        .eq('user_id', uid)
        .single()

      if (existingStaff) {
        toast.error(
          `You are already associated with this clinic as ${existingStaff.role} (Status: ${existingStaff.status})`,
          { id: loadingToast, duration: 6000 }
        )
        return false
      }

      toast.dismiss(loadingToast)
      return true
    } catch (error: any) {
      // Only fail if it's not a "no rows" error
      if (error.code !== 'PGRST116') {
        toast.error('Failed to verify eligibility', { id: loadingToast })
        return false
      }
      toast.dismiss(loadingToast)
      return true
    }
  }

  const handleCheckAccount = async (shouldHaveAccount: boolean) => {
    setHasAccount(shouldHaveAccount)
    
    if (shouldHaveAccount) {
      // Show login form
      setStep('signup') // We'll use same form for login
    } else {
      // Show signup form
      setStep('signup')
    }
  }

  // Step 2: Signup or Login
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.password) {
      setErrors({ password: 'Password is required' })
      return
    }

    if (!hasAccount && formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' })
      return
    }

    setLoading(true)
    const loadingToast = toast.loading('Checking eligibility...')

    try {
      if (hasAccount) {
        // Login first
        toast.loading('Signing in...', { id: loadingToast })
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) throw error

        // Verify email matches invite
        if (data.user && data.user.email?.toLowerCase() !== invite.email.toLowerCase()) {
          throw new Error('Email does not match invitation')
        }

        // CHECK ELIGIBILITY BEFORE PROCEEDING
        toast.loading('Checking if you can join...', { id: loadingToast })
        const canJoin = await checkEligibility(data.user!.id)
        if (!canJoin) {
          // Error already shown by checkEligibility
          return
        }

        setUserId(data.user!.id)
        toast.success('Signed in successfully!', { id: loadingToast })
        
        // Accept invite immediately
        await acceptInvite(data.user!.id)
      } else {
        // For new users, check if email is already registered FIRST
        toast.loading('Checking email...', { id: loadingToast })
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .ilike('email', formData.email)
          .single()

        if (existingUser) {
          throw new Error('This email is already registered. Please choose "Yes, I have an account" instead.')
        }

        // Signup with OTP
        toast.loading('Creating account...', { id: loadingToast })
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        })

        if (error) throw error

        if (data.user) {
          // CHECK ELIGIBILITY BEFORE SENDING OTP
          const canJoin = await checkEligibility(data.user.id)
          if (!canJoin) {
            // Delete the user we just created since they can't join
            await supabase.auth.admin.deleteUser(data.user.id)
            return
          }

          setUserId(data.user.id)
          toast.success('OTP sent to your email!', { id: loadingToast })
          setStep('otp')
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed', { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.otp || formData.otp.length < 6) {
      setErrors({ otp: 'Please enter a valid OTP' })
      return
    }

    setLoading(true)
    const loadingToast = toast.loading('Verifying OTP...')

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: formData.otp,
        type: 'email'
      })

      if (error) throw error

      if (data.user) {
        toast.success('Email verified!', { id: loadingToast })
        setUserId(data.user.id)
        setStep('profile')
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid OTP', { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  // Step 4: Complete Profile
  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userId) return

    setLoading(true)
    const loadingToast = toast.loading('Completing your profile...')

    try {
      // Create/update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: invite.full_name,
          phone: formData.phone,
          specialty: 'Manager'
        })

      if (profileError) throw profileError

      toast.success('Profile updated!', { id: loadingToast })
      
      // Accept invite
      await acceptInvite(userId)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile', { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  // Accept invite via RPC
  const acceptInvite = async (uid: string) => {
    const loadingToast = toast.loading('Checking eligibility...')
    
    try {
      // Check 1: Is user already an owner of another clinic?
      const { data: ownerCheck } = await supabase
        .from('staff_members')
        .select('role, clinic:clinic_id(name)')
        .eq('user_id', uid)
        .eq('role', 'owner')
        .single()

      if (ownerCheck) {
        const clinicName = Array.isArray(ownerCheck.clinic) 
          ? ownerCheck.clinic[0]?.name 
          : ownerCheck.clinic?.name
        throw new Error(
          `You are already an owner of "${clinicName}". Clinic owners cannot join other clinics as managers.`
        )
      }

      // Check 2: Is user already a staff member in THIS clinic?
      const { data: existingStaff } = await supabase
        .from('staff_members')
        .select('role, status')
        .eq('user_id', uid)
        .eq('clinic_id', invite.clinic_id)
        .single()

      if (existingStaff) {
        throw new Error(
          `You are already a ${existingStaff.role} in this clinic. Status: ${existingStaff.status}`
        )
      }

      // All checks passed - accept the invite
      toast.loading('Accepting invitation...', { id: loadingToast })
      
      const { data, error } = await supabase.rpc('accept_staff_invite', {
        p_token: invite.token,
        p_user_id: uid
      })

      if (error) throw error

      toast.success('Welcome to the team! 🎉', { id: loadingToast })
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1500)
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept invitation', { id: loadingToast })
      throw error
    }
  }

  // Render based on step
  if (step === 'check') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Do you already have an account?
        </h2>
        <div className="space-y-4">
          <button
            onClick={() => handleCheckAccount(true)}
            className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Yes, I have an account
          </button>
          <button
            onClick={() => handleCheckAccount(false)}
            className="w-full px-6 py-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-colors"
          >
            No, create a new account
          </button>
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">
          You must use the email: <strong>{invite.email}</strong>
        </p>
      </div>
    )
  }

  if (step === 'signup') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          {hasAccount ? 'Sign In' : 'Create Account'}
        </h2>
        <p className="text-gray-600 text-center mb-6">
          {hasAccount ? 'Enter your password to continue' : 'Set up your new account'}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value })
                  setErrors({ ...errors, password: undefined })
                }}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={hasAccount ? 'Enter your password' : 'Create a password (min 6 characters)'}
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {!hasAccount && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value })
                    setErrors({ ...errors, confirmPassword: undefined })
                  }}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {hasAccount ? 'Signing In...' : 'Creating Account...'}
              </>
            ) : (
              hasAccount ? 'Sign In & Accept Invite' : 'Continue'
            )}
          </button>
        </form>

        <button
          onClick={() => setStep('check')}
          className="w-full mt-4 text-sm text-gray-600 hover:text-gray-800"
        >
          ← Go Back
        </button>
      </div>
    )
  }

  if (step === 'otp') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Verify Your Email
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Enter the 6-digit code sent to <strong>{formData.email}</strong>
        </p>

        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OTP Code
            </label>
            <input
              type="text"
              value={formData.otp}
              onChange={(e) => {
                setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })
                setErrors({ ...errors, otp: undefined })
              }}
              className={`w-full px-4 py-3 border rounded-lg text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-blue-500 ${
                errors.otp ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="000000"
              maxLength={6}
            />
            {errors.otp && (
              <p className="text-red-500 text-sm mt-1 text-center">{errors.otp}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || formData.otp.length < 6}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Verify & Continue
              </>
            )}
          </button>
        </form>
      </div>
    )
  }

  if (step === 'profile') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Complete Your Profile
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Just a few more details to get you started
        </p>

        <form onSubmit={handleCompleteProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={invite.full_name}
                disabled
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Accept Invitation
              </>
            )}
          </button>
        </form>
      </div>
    )
  }

  return null
}
