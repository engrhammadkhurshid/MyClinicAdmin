/**
 * Role-based authentication helpers for MyClinicAdmin
 * 
 * This module provides functions to check user roles and clinic membership.
 * All functions are server-side only and use Supabase RLS for security.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export interface UserRole {
  role: 'owner' | 'manager'
  clinic_id: string
  clinic: {
    id: string
    name: string
    slug: string
    type?: string
    location?: string
  }
  staff_id: string
  status: 'active' | 'inactive' | 'suspended'
}

/**
 * Get the current user's role and clinic information
 * 
 * @returns UserRole if user is authenticated and has a clinic, null otherwise
 * 
 * @example
 * ```ts
 * const role = await getUserRoleAndClinic()
 * if (role?.role === 'owner') {
 *   // Owner-specific logic
 * }
 * ```
 */
export async function getUserRoleAndClinic(): Promise<UserRole | null> {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return null
    }

    // Get user's staff membership with clinic details
    const { data, error } = await supabase
      .from('staff_members')
      .select(`
        role,
        clinic_id,
        staff_id,
        status,
        clinic:clinic_id (
          id,
          name,
          slug,
          type,
          location
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (error || !data) {
      return null
    }

    // Transform the nested clinic array to a single object
    const clinic = Array.isArray(data.clinic) ? data.clinic[0] : data.clinic

    return {
      role: data.role,
      clinic_id: data.clinic_id,
      staff_id: data.staff_id,
      status: data.status,
      clinic: clinic
    } as UserRole
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

/**
 * Check if current user is an owner
 * 
 * @returns true if user is an owner, false otherwise
 */
export async function isOwner(): Promise<boolean> {
  const role = await getUserRoleAndClinic()
  return role?.role === 'owner'
}

/**
 * Check if current user is a manager
 * 
 * @returns true if user is a manager, false otherwise
 */
export async function isManager(): Promise<boolean> {
  const role = await getUserRoleAndClinic()
  return role?.role === 'manager'
}

/**
 * Check if current user is a staff member (owner or manager)
 * 
 * @returns true if user has any role, false otherwise
 */
export async function isStaffMember(): Promise<boolean> {
  const role = await getUserRoleAndClinic()
  return role !== null
}

/**
 * Get the clinic ID for the current user
 * 
 * @returns clinic ID if user belongs to a clinic, null otherwise
 */
export async function getUserClinicId(): Promise<string | null> {
  const role = await getUserRoleAndClinic()
  return role?.clinic_id || null
}

/**
 * Require owner role - throws error if not owner
 * Use in server actions/components that need owner access
 * 
 * @throws Error if user is not an owner
 */
export async function requireOwner(): Promise<UserRole> {
  const role = await getUserRoleAndClinic()
  
  if (!role) {
    throw new Error('Unauthorized: No clinic membership found')
  }
  
  if (role.role !== 'owner') {
    throw new Error('Forbidden: Owner access required')
  }
  
  return role
}

/**
 * Require staff member role (owner or manager)
 * Use in server actions/components that need any staff access
 * 
 * @throws Error if user is not a staff member
 */
export async function requireStaffMember(): Promise<UserRole> {
  const role = await getUserRoleAndClinic()
  
  if (!role) {
    throw new Error('Unauthorized: No clinic membership found')
  }
  
  return role
}
