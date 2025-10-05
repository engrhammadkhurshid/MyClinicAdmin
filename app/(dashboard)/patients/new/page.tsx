'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { ArrowLeft, Upload, Trash2, User, Phone, Activity } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { compressImage, calculateAge, isValidImageType, isValidFileSize } from '@/lib/imageCompression'
import { uploadMedicalRecord, saveAttachmentMetadata } from '@/lib/supabase/storage'
import { ImageCropper } from '@/components/ImageCropper'

const labels = ['New Patient', 'Follow-up', 'Critical', 'Regular', 'VIP', 'Diabetes', 'Hypertension']

export default function NewPatientPage() {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    phone: '+92',
    email: '',
    reasonForVisit: '',
    medicalHistory: '',
    source: 'Walk In',
    labels: [] as string[],
  })

  const [medicalRecords, setMedicalRecords] = useState<File[]>([])
  const [recordPreviews, setRecordPreviews] = useState<string[]>([])

  // Cropper state
  const [cropperOpen, setCropperOpen] = useState(false)
  const [currentCropImage, setCurrentCropImage] = useState<string>('')
  const [currentCropFileName, setCurrentCropFileName] = useState<string>('')
  const [pendingFileIndex, setPendingFileIndex] = useState<number>(-1)

  // Calculate age from DOB
  const calculatedAge = formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : ''

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file type
      if (!isValidImageType(file)) {
        toast.error(`${file.name} is not a valid image type. Please use JPEG, PNG, or WebP.`)
        continue
      }

      // Validate file size (10MB max before compression)
      if (!isValidFileSize(file, 10)) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`)
        continue
      }

      // Read file and open cropper
      const reader = new FileReader()
      reader.onloadend = () => {
        setCurrentCropImage(reader.result as string)
        setCurrentCropFileName(file.name)
        setPendingFileIndex(medicalRecords.length + i)
        setCropperOpen(true)
      }
      reader.readAsDataURL(file)

      // Process one file at a time
      break
    }

    // Reset the input
    e.target.value = ''
  }

  const handleCropComplete = (croppedFile: File) => {
    // Add cropped file to records
    setMedicalRecords(prev => [...prev, croppedFile])

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setRecordPreviews(prev => [...prev, reader.result as string])
    }
    reader.readAsDataURL(croppedFile)

    toast.success('Image cropped successfully!')
  }

  const removeFile = (index: number) => {
    setMedicalRecords(prev => prev.filter((_, i) => i !== index))
    setRecordPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const loadingToast = toast.loading('Creating patient record...')

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('You must be logged in to add patients', { id: loadingToast })
        return
      }

      // Get user's clinic_id
      const { data: staffMember, error: staffError } = await supabase
        .from('staff_members')
        .select('clinic_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()

      if (staffError || !staffMember) {
        toast.error('You must be a member of a clinic to add patients', { id: loadingToast })
        return
      }

      const clinicId = (staffMember as any).clinic_id

      // Calculate age from DOB
      const age = formData.dateOfBirth ? parseInt(calculateAge(formData.dateOfBirth).split('y')[0]) || 0 : 0

      const { data: newPatient, error: insertError } = await supabase
        .from('patients')
        .insert({
          user_id: user.id,
          clinic_id: clinicId,
          full_name: formData.fullName,
          gender: formData.gender,
          date_of_birth: formData.dateOfBirth || null,
          age: age,
          address: formData.address,
          phone: formData.phone,
          email: formData.email || null,
          reason_for_visit: formData.reasonForVisit || null,
          medical_history: formData.medicalHistory || null,
          source: formData.source,
          labels: formData.labels,
        } as any)
        .select()
        .single()

      if (insertError) {
        toast.error(`Failed to create patient: ${insertError.message}`, { id: loadingToast })
        return
      }

      const patientId = (newPatient as any).id

      // Upload medical records if any
      if (medicalRecords.length > 0) {
        toast.loading('Compressing and uploading medical records...', { id: loadingToast })
        setUploading(true)

        for (let i = 0; i < medicalRecords.length; i++) {
          const file = medicalRecords[i]
          
          try {
            // Compress image
            const compressedFile = await compressImage(file)
            
            // Upload to storage
            const uploadResult = await uploadMedicalRecord(patientId, compressedFile)
            
            if (uploadResult.success && uploadResult.fileUrl) {
              // Save metadata to database
              await saveAttachmentMetadata(
                patientId,
                clinicId,
                uploadResult.fileUrl,
                compressedFile.name,
                compressedFile.type,
                compressedFile.size
              )
            } else {
              console.error('Upload failed:', uploadResult.error)
            }

            setUploadProgress(Math.round(((i + 1) / medicalRecords.length) * 100))
          } catch (uploadError: any) {
            console.error('Error uploading file:', uploadError)
            // Continue with other files even if one fails
          }
        }

        setUploading(false)
      }

      toast.success('Patient added successfully!', { id: loadingToast })
      router.push('/patients')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred', { id: loadingToast })
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  const handleLabelToggle = (label: string) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.includes(label)
        ? prev.labels.filter(l => l !== label)
        : [...prev.labels, label],
    }))
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/patients">
            <button className="p-2 hover:bg-white rounded-lg transition shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Add New Patient</h2>
            <p className="text-gray-600 text-sm">Fill in the patient details below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                {calculatedAge && (
                  <p className="mt-1 text-sm text-gray-500">Age: {calculatedAge}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Contact Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="+92 300 1234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="john@example.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="123 Main St, City, State 12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source *
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                >
                  <option value="Walk In">Walk In</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="Meta Ads">Meta Ads</option>
                  <option value="GMB">GMB (Google My Business)</option>
                  <option value="Referral">Referral</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Labels <span className="text-gray-400">(Optional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {labels.map(label => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleLabelToggle(label)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                        formData.labels.includes(label)
                          ? 'bg-green-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Medical Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Medical Information</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Visit / Symptoms <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  value={formData.reasonForVisit}
                  onChange={(e) => setFormData({ ...formData, reasonForVisit: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="Describe symptoms or reason for visit..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical History <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="Previous conditions, allergies, medications..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Records <span className="text-gray-400">(Optional)</span>
                </label>
                <div className="space-y-3">
                  {/* File Upload Button */}
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition cursor-pointer">
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Upload images (JPEG, PNG, WebP)
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>

                  {/* File Previews */}
                  {recordPreviews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {recordPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <div className="absolute bottom-1 left-1 right-1 bg-black/50 text-white text-xs px-2 py-1 rounded truncate">
                            {medicalRecords[index]?.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Progress */}
                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    Images will be automatically compressed to WebP format for optimal storage
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Submit Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || uploading}
              className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30"
            >
              {loading ? 'Adding Patient...' : uploading ? 'Uploading files...' : 'Add Patient'}
            </motion.button>
            <Link href="/patients" className="flex-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="w-full px-8 py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </motion.button>
            </Link>
          </motion.div>
        </form>

        {/* Image Cropper Modal */}
        <ImageCropper
          image={currentCropImage}
          fileName={currentCropFileName}
          isOpen={cropperOpen}
          onClose={() => setCropperOpen(false)}
          onCropComplete={handleCropComplete}
        />
      </div>
    </div>
  )
}
