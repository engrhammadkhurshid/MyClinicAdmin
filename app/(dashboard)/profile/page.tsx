'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Lock, LogOut, Clock } from 'lucide-react'
import { formatPKTShort } from '@/lib/timezone'

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    specialty: '',
    clinicName: '',
    clinicType: '',
  })

  const [email, setEmail] = useState('')
  const [lastSignIn, setLastSignIn] = useState<Date | null>(null)
  const [accountCreated, setAccountCreated] = useState<Date | null>(null)

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const loadProfile = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      console.log('Loading profile for user:', user.id)

      // Get email from auth.users
      setEmail(user.email || '')
      
      // Get session timestamps
      if (user.last_sign_in_at) {
        setLastSignIn(new Date(user.last_sign_in_at))
      }
      if (user.created_at) {
        setAccountCreated(new Date(user.created_at))
      }

      // Get profile from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('name, phone, specialty, clinic_name, clinic_type')
        .eq('id', user.id)

      console.log('Profile load response:', { data, error })

      if (error) throw error

      if (data && data.length > 0) {
        const profileData = data[0] as any
        const loadedProfile = {
          name: profileData.name || '',
          phone: profileData.phone || '',
          specialty: profileData.specialty || '',
          clinicName: profileData.clinic_name || '',
          clinicType: profileData.clinic_type || '',
        }
        console.log('Setting profile state to:', loadedProfile)
        setProfile(loadedProfile)
      } else {
        console.warn('No profile data found for user:', user.id)
      }
    } catch (error: any) {
      console.error('Load profile error:', error)
      setError(error.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUpdateClinic = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setUpdating(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      console.log('Updating clinic for user:', user.id)
      console.log('Clinic data to update:', { clinic_name: profile.clinicName, clinic_type: profile.clinicType })

      // First, check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)

      console.log('Existing profile check:', existingProfile)

      let result
      if (!existingProfile || existingProfile.length === 0) {
        // Profile doesn't exist, INSERT it with minimal required fields
        console.log('Profile does not exist, creating new profile with clinic info...')
        // Note: Using 'as any' due to Supabase type inference limitations with Insert type
        result = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            name: 'User', // Default name, user can update later
            phone: '', // Default phone, user can update later
            specialty: '', // Default specialty
            clinic_name: profile.clinicName,
            clinic_type: profile.clinicType,
          } as any)
          .select()
      } else {
        // Profile exists, UPDATE only clinic fields
        console.log('Profile exists, updating clinic info only...')
        // Note: Using @ts-ignore due to Supabase type inference limitations with Update type
        result = await supabase
          .from('profiles')
          // @ts-ignore - Supabase type inference issue
          .update({
            clinic_name: profile.clinicName,
            clinic_type: profile.clinicType,
          })
          .eq('id', user.id)
          .select()
      }

      const { data: updateData, error: updateError } = result
      console.log('Update/Insert response:', { data: updateData, error: updateError })

      if (updateError) {
        console.error('Supabase error:', updateError)
        throw updateError
      }

      setSuccess('Clinic information updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
      
      // Reload profile to confirm changes
      await loadProfile()
    } catch (error: any) {
      console.error('Update error:', error)
      setError(error.message || 'Failed to update clinic information')
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdateAssistant = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setUpdating(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      console.log('Updating profile for user:', user.id)
      console.log('Profile data to update:', { name: profile.name, phone: profile.phone })

      // First, check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)

      console.log('Existing profile check:', existingProfile)

      let result
      if (!existingProfile || existingProfile.length === 0) {
        // Profile doesn't exist, INSERT it with manager info
        console.log('Profile does not exist, creating new profile with manager info...')
        result = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            name: profile.name,
            phone: profile.phone,
            specialty: '', // Default specialty
            clinic_name: null, // User can set later via Clinic Info section
            clinic_type: null, // User can set later via Clinic Info section
          } as any)
          .select()
      } else {
        // Profile exists, UPDATE only name and phone
        console.log('Profile exists, updating manager info only...')
        // Note: Using @ts-ignore due to Supabase type inference limitations with Update type
        result = await supabase
          .from('profiles')
          // @ts-ignore - Supabase type inference issue
          .update({
            name: profile.name,
            phone: profile.phone,
          })
          .eq('id', user.id)
          .select()
      }

      const { data: updateData, error: updateError } = result
      console.log('Update/Insert response:', { data: updateData, error: updateError })

      if (updateError) {
        console.error('Supabase error:', updateError)
        throw updateError
      }

      setSuccess('Manager information updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
      
      // Reload profile to confirm changes
      await loadProfile()
    } catch (error: any) {
      console.error('Update error:', error)
      setError(error.message || 'Failed to update manager information')
    } finally {
      setUpdating(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error: any) {
      setError('Failed to logout')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setUpdating(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) throw error

      setSuccess('Password changed successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setTimeout(() => setSuccess(''), 3000)
    } catch (error: any) {
      setError(error.message || 'Failed to change password')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
        >
          {success}
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600"
        >
          {error}
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Clinic Information - Prominent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-500 to-blue-600 rounded-xl shadow-lg p-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-6">Clinic Information</h2>

          <form onSubmit={handleUpdateClinic} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1">
                Clinic Name
              </label>
              <input
                type="text"
                value={profile.clinicName}
                onChange={(e) => setProfile({ ...profile, clinicName: e.target.value })}
                className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent outline-none bg-white/10 text-white placeholder-white/50"
                placeholder="e.g., City Medical Center"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-1">
                Clinic Type
              </label>
              <input
                type="text"
                value={profile.clinicType}
                onChange={(e) => setProfile({ ...profile, clinicType: e.target.value })}
                className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent outline-none bg-white/10 text-white placeholder-white/50"
                placeholder="e.g., General Surgery, Dental Clinic, Neurosurgery"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={updating}
              className="w-full bg-white text-primary-600 font-semibold py-3 rounded-lg hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? 'Updating...' : 'Update Clinic Information'}
            </motion.button>
          </form>
        </motion.div>

        {/* Manager Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Manager Info
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            This information is used in reports and internal records
          </p>

          <form onSubmit={handleUpdateAssistant} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Dr. John Smith"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="+92 300 1234567"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={updating}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? 'Updating...' : 'Update Manager Info'}
            </motion.button>
          </form>
        </motion.div>

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={updating}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? 'Changing Password...' : 'Change Password'}
            </motion.button>
          </form>
        </motion.div>

        {/* Session Information & Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Session Information</h2>

          <div className="space-y-4 mb-6">
            {lastSignIn && (
              <div className="flex items-center gap-3 text-gray-600">
                <Clock className="w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Last Login</p>
                  <p className="text-sm">{formatPKTShort(lastSignIn)}</p>
                </div>
              </div>
            )}

            {accountCreated && (
              <div className="flex items-center gap-3 text-gray-600">
                <User className="w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Account Created</p>
                  <p className="text-sm">{formatPKTShort(accountCreated)}</p>
                </div>
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
