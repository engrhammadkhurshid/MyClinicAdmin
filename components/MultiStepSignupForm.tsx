'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Phone, MapPin, Briefcase, Building2, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'

interface SignupFormData {
  // Step 1: Personal Info
  fullName: string
  designation: string
  email: string
  phone: string
  address: string
  password: string
  confirmPassword: string
  
  // Step 2: Clinic Info
  clinicName: string
  clinicType: string
  clinicLocation: string
  
  // Step 3: OTP
  otp: string
}

const STEPS = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Clinic Details', icon: Building2 },
  { id: 3, title: 'Verify Email', icon: Mail }
]

export default function MultiStepSignupForm() {
  const router = useRouter()
  const supabase = createClient()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    designation: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    clinicName: '',
    clinicType: '',
    clinicLocation: '',
    otp: ''
  })

  const [errors, setErrors] = useState<Partial<SignupFormData>>({})

  const updateField = (field: keyof SignupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateStep1 = (): boolean => {
    const newErrors: Partial<SignupFormData> = {}
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = (): boolean => {
    const newErrors: Partial<SignupFormData> = {}
    
    if (!formData.clinicName.trim()) newErrors.clinicName = 'Clinic name is required'
    if (!formData.clinicType.trim()) newErrors.clinicType = 'Clinic type is required'
    if (!formData.clinicLocation.trim()) newErrors.clinicLocation = 'Clinic location is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = (): boolean => {
    const newErrors: Partial<SignupFormData> = {}
    
    if (!formData.otp.trim()) {
      newErrors.otp = 'OTP is required'
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2)
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        await sendOTP()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const sendOTP = async () => {
    setLoading(true)
    const loadingToast = toast.loading('Creating account and sending OTP...')

    try {
      // Sign up with Supabase (using email OTP - NO emailRedirectTo for OTP flow)
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          // Remove emailRedirectTo for OTP flow - it causes "confirm email" mode
          // emailRedirectTo is only for magic link/confirmation link flows
          data: {
            full_name: formData.fullName,
            designation: formData.designation,
            phone: formData.phone,
            address: formData.address,
            clinic_name: formData.clinicName,
            clinic_type: formData.clinicType,
            clinic_location: formData.clinicLocation
          }
        }
      })

      if (error) throw error

      if (data.user) {
        setUserId(data.user.id)
        setOtpSent(true)
        setCurrentStep(3)
        toast.success('OTP sent to your email! Check your inbox.', { id: loadingToast })
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP', { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  const resendOTP = async () => {
    if (!formData.email) return
    
    setLoading(true)
    const loadingToast = toast.loading('Resending OTP...')

    try {
      // Resend OTP using the same signup method
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
      })

      if (error) throw error

      toast.success('New OTP sent to your email!', { id: loadingToast })
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP', { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  const changeEmail = () => {
    // Go back to step 1 and allow user to change email
    setCurrentStep(1)
    setOtpSent(false)
    setUserId(null)
    toast('Please enter a new email address', {
      icon: 'ℹ️'
    })
  }

  const verifyOTP = async () => {
    if (!validateStep3()) return

    setLoading(true)
    const loadingToast = toast.loading('Verifying OTP...')

    try {
      // =====================================================
      // STEP 1: Verify OTP
      // =====================================================
      console.log('🔐 Step 1: Verifying OTP for:', formData.email)
      
      const { data, error} = await supabase.auth.verifyOtp({
        email: formData.email,
        token: formData.otp,
        type: 'signup'
      })

      if (error) {
        console.error('❌ OTP verification failed:', error)
        throw error
      }

      if (!data.user) {
        console.error('❌ No user returned after OTP verification')
        throw new Error('OTP verified but user not found')
      }

      console.log('✅ Step 1 Complete: OTP verified, user ID:', data.user.id)

      // =====================================================
      // STEP 2: Create/Update Profile
      // =====================================================
      console.log('👤 Step 2: Creating profile...')
      toast.loading('Creating your profile...', { id: loadingToast })
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          name: formData.fullName,
          phone: formData.phone,
          specialty: formData.designation
        })

      if (profileError) {
        console.error('❌ Profile creation failed:', profileError)
        throw new Error(`Failed to create profile: ${profileError.message}`)
      }

      console.log('✅ Step 2 Complete: Profile created')

      // =====================================================
      // STEP 3: Create Clinic
      // =====================================================
      console.log('🏥 Step 3: Creating clinic...')
      toast.loading('Setting up your clinic...', { id: loadingToast })
      
      const clinicSlug = formData.clinicName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinic')
        .insert({
          owner_id: data.user.id,
          name: formData.clinicName,
          slug: clinicSlug,
          type: formData.clinicType,
          location: formData.clinicLocation
        })
        .select()
        .single()

      if (clinicError) {
        console.error('❌ Clinic creation failed:', clinicError)
        console.error('Clinic error details:', {
          code: clinicError.code,
          message: clinicError.message,
          details: clinicError.details,
          hint: clinicError.hint
        })
        throw new Error(`Failed to create clinic: ${clinicError.message}`)
      }

      if (!clinicData) {
        console.error('❌ Clinic created but no data returned')
        throw new Error('Clinic created but data not available')
      }

      console.log('✅ Step 3 Complete: Clinic created with ID:', clinicData.id)

      // =====================================================
      // STEP 4: Create Staff Member (Owner Role)
      // =====================================================
      console.log('👔 Step 4: Creating owner staff membership...')
      toast.loading('Finalizing your account...', { id: loadingToast })
      
      const { data: staffData, error: staffError } = await supabase
        .from('staff_members')
        .insert({
          clinic_id: clinicData.id,
          user_id: data.user.id,
          role: 'owner',
          staff_id: '', // Auto-generated by trigger
          status: 'active'
        })
        .select()
        .single()

      if (staffError) {
        console.error('❌ Staff member creation failed:', staffError)
        console.error('Staff error details:', {
          code: staffError.code,
          message: staffError.message,
          details: staffError.details,
          hint: staffError.hint
        })
        throw new Error(`Failed to create staff membership: ${staffError.message}`)
      }

      if (!staffData) {
        console.error('❌ Staff member created but no data returned')
        throw new Error('Staff membership created but data not available')
      }

      console.log('✅ Step 4 Complete: Staff member created with role:', staffData.role)

      // =====================================================
      // STEP 5: Success - Show Confetti & Redirect
      // =====================================================
      console.log('🎉 ALL STEPS COMPLETE! Showing confetti and redirecting...')
      
      toast.success('Welcome to MyClinicAdmin! 🎉', { id: loadingToast })
      
      // Trigger confetti animation
      triggerConfetti()
      
      // Wait for confetti animation, then redirect
      setTimeout(() => {
        console.log('🚀 Redirecting to dashboard...')
        router.push('/dashboard')
        router.refresh()
      }, 2000)

    } catch (error: any) {
      console.error('💥 Signup failed at some step:', error)
      const errorMessage = error.message || 'Signup failed. Please try again.'
      toast.error(errorMessage, { id: loadingToast })
      
      // Show detailed error in console for debugging
      console.error('Full error details:', error)
    } finally {
      setLoading(false)
    }
  }

  const triggerConfetti = () => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)
  }

  const progressPercentage = (currentStep / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <motion.div
                      initial={false}
                      animate={{
                        backgroundColor: isCompleted ? '#10b981' : isActive ? '#6366f1' : '#e5e7eb',
                        scale: isActive ? 1.1 : 1
                      }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        isCompleted ? 'bg-green-500' : isActive ? 'bg-primary-500' : 'bg-gray-300'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      ) : (
                        <StepIcon className={`w-6 h-6 ${isActive || isCompleted ? 'text-white' : 'text-gray-500'}`} />
                      )}
                    </motion.div>
                    <span className={`text-sm font-medium ${isActive ? 'text-primary-700' : 'text-gray-600'}`}>
                      {step.title}
                    </span>
                  </div>
                  
                  {index < STEPS.length - 1 && (
                    <div className="flex-1 h-1 mx-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={false}
                        animate={{
                          width: currentStep > step.id ? '100%' : '0%'
                        }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-green-500"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Overall Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={false}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
            />
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <Step1Form
                key="step1"
                formData={formData}
                errors={errors}
                updateField={updateField}
                onNext={handleNext}
                loading={loading}
              />
            )}
            
            {currentStep === 2 && (
              <Step2Form
                key="step2"
                formData={formData}
                errors={errors}
                updateField={updateField}
                onNext={handleNext}
                onBack={handleBack}
                loading={loading}
              />
            )}
            
            {currentStep === 3 && (
              <Step3Form
                key="step3"
                formData={formData}
                errors={errors}
                updateField={updateField}
                onVerify={verifyOTP}
                onResend={resendOTP}
                onChangeEmail={changeEmail}
                onBack={handleBack}
                loading={loading}
                otpSent={otpSent}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

// Step 1: Personal Information
function Step1Form({ formData, errors, updateField, onNext, loading }: any) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
      
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Dr. John Doe"
            />
          </div>
          {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
        </div>

        {/* Designation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Designation / Role *
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => updateField('designation', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.designation ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="General Physician, Surgeon, etc."
            />
          </div>
          {errors.designation && <p className="mt-1 text-sm text-red-600">{errors.designation}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="doctor@example.com"
            />
          </div>
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+92 300 1234567"
            />
          </div>
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              rows={2}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="123 Medical Street, City, Country"
            />
          </div>
          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
        </div>
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={loading}
        className="w-full mt-6 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
      >
        Continue to Clinic Details
        <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  )
}

// Step 2: Clinic Information
function Step2Form({ formData, errors, updateField, onNext, onBack, loading }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Clinic Information</h2>
      
      <div className="space-y-4">
        {/* Clinic Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Clinic Name *
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.clinicName}
              onChange={(e) => updateField('clinicName', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.clinicName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="City Medical Center"
            />
          </div>
          {errors.clinicName && <p className="mt-1 text-sm text-red-600">{errors.clinicName}</p>}
        </div>

        {/* Clinic Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Clinic Type / Specialty *
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.clinicType}
              onChange={(e) => updateField('clinicType', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.clinicType ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="General Surgery, Dental Clinic, Neurosurgery, etc."
            />
          </div>
          {errors.clinicType && <p className="mt-1 text-sm text-red-600">{errors.clinicType}</p>}
        </div>

        {/* Clinic Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Clinic Location *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              value={formData.clinicLocation}
              onChange={(e) => updateField('clinicLocation', e.target.value)}
              rows={3}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.clinicLocation ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="456 Healthcare Ave, Medical District, City, Country"
            />
          </div>
          {errors.clinicLocation && <p className="mt-1 text-sm text-red-600">{errors.clinicLocation}</p>}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={loading}
          className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
        >
          {loading ? 'Sending OTP...' : 'Send OTP'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  )
}

// Step 3: Email Verification
function Step3Form({ formData, errors, updateField, onVerify, onResend, onChangeEmail, onBack, loading, otpSent }: any) {
  const [resendCooldown, setResendCooldown] = useState(0)

  const handleResend = async () => {
    if (resendCooldown > 0) return
    
    await onResend()
    setResendCooldown(60) // 60 second cooldown
    
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
        <p className="text-gray-600">
          We&apos;ve sent a 6-digit verification code to<br />
          <span className="font-semibold text-gray-900">{formData.email}</span>
        </p>
        <button
          type="button"
          onClick={onChangeEmail}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
        >
          Wrong email? Change it
        </button>
      </div>
      
      <div className="space-y-4">
        {/* OTP Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
            Enter 6-Digit OTP *
          </label>
          <input
            type="text"
            value={formData.otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6)
              updateField('otp', value)
            }}
            maxLength={6}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl tracking-widest font-semibold ${
              errors.otp ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="000000"
          />
          {errors.otp && <p className="mt-1 text-sm text-red-600 text-center">{errors.otp}</p>}
        </div>

        {/* Resend OTP */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Didn&apos;t receive the code?
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={loading || resendCooldown > 0}
            className={`font-semibold text-sm ${
              resendCooldown > 0 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-primary-600 hover:text-primary-700'
            }`}
          >
            {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={onVerify}
          disabled={loading || !formData.otp}
          className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
        >
          {loading ? 'Verifying...' : 'Complete Signup'}
          <CheckCircle2 className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  )
}
