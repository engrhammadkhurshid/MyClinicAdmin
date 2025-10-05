/**
 * Supabase Storage Utility for Medical Records
 * Handles upload, delete, and retrieval of patient medical record images
 */

import { createClient } from '@/lib/supabase/client'

const STORAGE_BUCKET = 'medical-records'

export interface UploadResult {
  success: boolean
  fileUrl?: string
  fileName?: string
  error?: string
}

/**
 * Upload a medical record image to Supabase Storage
 * @param patientId - Patient UUID
 * @param file - Compressed image file
 * @returns Upload result with public URL
 */
export async function uploadMedicalRecord(
  patientId: string,
  file: File
): Promise<UploadResult> {
  try {
    const supabase = createClient()
    
    // Generate unique filename
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop() || 'webp'
    const fileName = `${timestamp}-${patientId}.${fileExt}`
    const filePath = `${patientId}/${fileName}`
    
    console.log(`[Storage] Uploading ${fileName} to ${STORAGE_BUCKET}/${filePath}`)
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })
    
    if (error) {
      console.error('[Storage] Upload error:', error)
      return { success: false, error: error.message }
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath)
    
    console.log(`[Storage] Upload successful: ${publicUrl}`)
    
    return {
      success: true,
      fileUrl: publicUrl,
      fileName: fileName,
    }
  } catch (error: any) {
    console.error('[Storage] Upload exception:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete a medical record from Supabase Storage
 * @param patientId - Patient UUID
 * @param fileName - File name to delete
 * @returns Success status
 */
export async function deleteMedicalRecord(
  patientId: string,
  fileName: string
): Promise<boolean> {
  try {
    const supabase = createClient()
    const filePath = `${patientId}/${fileName}`
    
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath])
    
    if (error) {
      console.error('[Storage] Delete error:', error)
      return false
    }
    
    console.log(`[Storage] Deleted: ${filePath}`)
    return true
  } catch (error) {
    console.error('[Storage] Delete exception:', error)
    return false
  }
}

/**
 * Get all medical records for a patient
 * @param patientId - Patient UUID
 * @returns Array of file URLs
 */
export async function getPatientMedicalRecords(
  patientId: string
): Promise<string[]> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(patientId)
    
    if (error) {
      console.error('[Storage] List error:', error)
      return []
    }
    
    if (!data || data.length === 0) {
      return []
    }
    
    // Get public URLs for all files
    const urls = data.map(file => {
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(`${patientId}/${file.name}`)
      return publicUrl
    })
    
    return urls
  } catch (error) {
    console.error('[Storage] List exception:', error)
    return []
  }
}

/**
 * Save attachment metadata to database
 * @param patientId - Patient UUID
 * @param clinicId - Clinic UUID
 * @param fileUrl - Public URL of the file
 * @param fileName - Name of the file
 * @param fileType - MIME type
 * @param fileSize - Size in bytes
 * @returns Success status
 */
export async function saveAttachmentMetadata(
  patientId: string,
  clinicId: string,
  fileUrl: string,
  fileName: string,
  fileType: string,
  fileSize: number
): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false
    
    const { error } = await supabase
      .from('patient_attachments')
      .insert({
        patient_id: patientId,
        clinic_id: clinicId,
        file_name: fileName,
        file_url: fileUrl,
        file_type: fileType,
        file_size: fileSize,
        uploaded_by: user.id,
      })
    
    if (error) {
      console.error('[Database] Save attachment error:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('[Database] Save attachment exception:', error)
    return false
  }
}
