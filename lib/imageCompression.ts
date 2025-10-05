/**
 * Image Compression Utility
 * Compresses images to WebP format for optimal storage and performance
 */

import imageCompression from 'browser-image-compression'

export interface CompressionOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
  fileType?: string
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 0.5, // 500KB max
  maxWidthOrHeight: 1920, // Max width/height
  useWebWorker: true,
  fileType: 'image/webp', // Convert to WebP
}

/**
 * Compress an image file to WebP format
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Compressed image file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  try {
    const compressionOptions = { ...DEFAULT_OPTIONS, ...options }
    
    console.log(`[Image Compression] Original file: ${file.name}`)
    console.log(`[Image Compression] Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
    
    const compressedFile = await imageCompression(file, compressionOptions)
    
    console.log(`[Image Compression] Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`)
    console.log(`[Image Compression] Savings: ${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`)
    
    return compressedFile
  } catch (error) {
    console.error('[Image Compression] Error:', error)
    throw new Error('Failed to compress image')
  }
}

/**
 * Compress multiple image files
 * @param files - Array of image files
 * @param options - Compression options
 * @param onProgress - Progress callback (current, total)
 * @returns Array of compressed image files
 */
export async function compressMultipleImages(
  files: File[],
  options: CompressionOptions = {},
  onProgress?: (current: number, total: number) => void
): Promise<File[]> {
  const compressedFiles: File[] = []
  
  for (let i = 0; i < files.length; i++) {
    const compressed = await compressImage(files[i], options)
    compressedFiles.push(compressed)
    
    if (onProgress) {
      onProgress(i + 1, files.length)
    }
  }
  
  return compressedFiles
}

/**
 * Validate file type
 * @param file - File to validate
 * @returns true if valid image type
 */
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  return validTypes.includes(file.type)
}

/**
 * Validate file size
 * @param file - File to validate
 * @param maxSizeMB - Maximum size in MB
 * @returns true if within size limit
 */
export function isValidFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxBytes
}

/**
 * Get age from date of birth
 * @param dateOfBirth - Date of birth
 * @returns Age in format "2y 3m" (years and months)
 */
export function calculateAge(dateOfBirth: Date | string): string {
  const dob = new Date(dateOfBirth)
  const now = new Date()
  
  let years = now.getFullYear() - dob.getFullYear()
  let months = now.getMonth() - dob.getMonth()
  
  if (months < 0) {
    years--
    months += 12
  }
  
  if (years === 0) {
    return `${months}m`
  } else if (months === 0) {
    return `${years}y`
  } else {
    return `${years}y ${months}m`
  }
}
