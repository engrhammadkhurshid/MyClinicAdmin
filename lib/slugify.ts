/**
 * Utility functions for converting patient names to URL-friendly slugs
 * and retrieving patients by slug
 */

/**
 * Convert a patient name to a URL-friendly slug
 * Example: "Muhammad Ali Khan" -> "muhammad-ali-khan"
 * Example: "Dr. Sarah O'Brien" -> "dr-sarah-obrien"
 */
export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^\w\-]+/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/\-\-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

/**
 * Create a unique slug by appending patient ID
 * Format: "firstname-lastname-id"
 * Example: "muhammad-ali-khan-abc123"
 */
export function createPatientSlug(name: string, id: string): string {
  const nameSlug = nameToSlug(name)
  // Take first 8 characters of UUID for shorter URL
  const shortId = id.split('-')[0]
  return `${nameSlug}-${shortId}`
}

/**
 * Extract patient ID from slug
 * Example: "muhammad-ali-khan-abc123" -> "abc123"
 */
export function extractIdFromSlug(slug: string): string | null {
  const parts = slug.split('-')
  if (parts.length === 0) return null
  // The ID is the last part of the slug
  return parts[parts.length - 1]
}

/**
 * Check if a slug matches a patient's name and ID
 */
export function isValidSlug(slug: string, name: string, id: string): boolean {
  const expectedSlug = createPatientSlug(name, id)
  return slug === expectedSlug
}

/**
 * Create a fallback slug from ID only (for backward compatibility)
 */
export function idToSlug(id: string): string {
  return id.split('-')[0]
}
