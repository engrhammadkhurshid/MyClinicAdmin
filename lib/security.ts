import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Security Headers Middleware
 * 
 * This middleware adds comprehensive security headers to protect against:
 * - XSS (Cross-Site Scripting)
 * - Clickjacking
 * - MIME type sniffing
 * - Referrer leakage
 * - And other common web vulnerabilities
 */

export function securityHeaders(request: NextRequest) {
  const response = NextResponse.next()

  // Prevent XSS attacks by blocking inline scripts unless explicitly allowed
  // Only allow scripts from self and trusted CDNs
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Required for Next.js and Framer Motion
      "style-src 'self' 'unsafe-inline'", // Required for Tailwind and inline styles
      "img-src 'self' data: https: blob:", // Allow images from self, data URIs, HTTPS, and blobs
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co", // Allow Supabase connections
      "frame-ancestors 'none'", // Prevent clickjacking
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests", // Force HTTPS
    ].join('; ')
  )

  // Prevent clickjacking by disallowing the page to be embedded in iframes
  response.headers.set('X-Frame-Options', 'DENY')

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Enable browser XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Enforce HTTPS (only if in production and using HTTPS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  // Control which features and APIs can be used
  response.headers.set(
    'Permissions-Policy',
    [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
    ].join(', ')
  )

  // Prevent DNS prefetching for privacy
  response.headers.set('X-DNS-Prefetch-Control', 'off')

  // Remove X-Powered-By header to not reveal tech stack
  response.headers.delete('X-Powered-By')

  return response
}

/**
 * Rate Limiting Configuration
 * 
 * Note: This is a basic in-memory implementation.
 * For production with multiple instances, use Redis or a dedicated service like:
 * - Upstash Rate Limiting
 * - Vercel Edge Config
 * - Redis (with @upstash/ratelimit)
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

export function rateLimit(
  identifier: string,
  limit: number = 100, // requests
  window: number = 60000 // time window in ms (default: 1 minute)
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    const keysToDelete: string[] = []
    rateLimitMap.forEach((value, key) => {
      if (value.resetTime < now) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => rateLimitMap.delete(key))
  }

  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired entry
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + window,
    })
    return {
      success: true,
      remaining: limit - 1,
      reset: now + window,
    }
  }

  if (entry.count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: entry.resetTime,
    }
  }

  entry.count++
  return {
    success: true,
    remaining: limit - entry.count,
    reset: entry.resetTime,
  }
}

/**
 * Input Sanitization Utilities
 */

export const sanitize = {
  /**
   * Sanitize string input by removing potentially dangerous characters
   */
  string: (input: string): string => {
    if (typeof input !== 'string') return ''
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
      .slice(0, 1000) // Limit length to prevent DOS
  },

  /**
   * Sanitize email input
   */
  email: (input: string): string => {
    if (typeof input !== 'string') return ''
    
    return input
      .trim()
      .toLowerCase()
      .slice(0, 254) // Max email length per RFC
  },

  /**
   * Sanitize phone number (allow only digits, +, -, spaces, parentheses)
   */
  phone: (input: string): string => {
    if (typeof input !== 'string') return ''
    
    return input
      .replace(/[^0-9+\-() ]/g, '')
      .slice(0, 20) // Reasonable phone number length
  },

  /**
   * Sanitize number input
   */
  number: (input: any, min?: number, max?: number): number => {
    const num = typeof input === 'number' ? input : parseFloat(input)
    
    if (isNaN(num)) return 0
    if (min !== undefined && num < min) return min
    if (max !== undefined && num > max) return max
    
    return num
  },

  /**
   * Sanitize array input
   */
  array: (input: any, maxLength: number = 100): any[] => {
    if (!Array.isArray(input)) return []
    return input.slice(0, maxLength)
  },
}

/**
 * SQL Injection Prevention
 * 
 * Supabase uses parameterized queries by default, which prevents SQL injection.
 * However, here are best practices:
 * 
 * ✅ SAFE (Parameterized - Supabase handles this):
 * await supabase
 *   .from('patients')
 *   .select('*')
 *   .eq('name', userInput) // Safe - parameterized
 * 
 * ❌ UNSAFE (Never do this):
 * await supabase.rpc('custom_function', {
 *   query: `SELECT * FROM patients WHERE name = '${userInput}'` // DANGEROUS!
 * })
 * 
 * RULES:
 * 1. Always use Supabase's query builder methods (eq, in, like, etc.)
 * 2. Never concatenate user input into SQL strings
 * 3. Always validate and sanitize input before passing to database
 * 4. Use RLS policies to enforce access control at the database level
 */

/**
 * XSS Prevention
 * 
 * Next.js automatically escapes content in JSX, preventing XSS.
 * However, be careful with:
 * 
 * ❌ UNSAFE:
 * <div dangerouslySetInnerHTML={{ __html: userInput }} />
 * 
 * ✅ SAFE:
 * <div>{userInput}</div> // Automatically escaped
 * 
 * If you must render HTML:
 * 1. Use a sanitization library like DOMPurify
 * 2. Validate the source of the HTML
 * 3. Use Content Security Policy headers (implemented above)
 */

/**
 * CSRF Protection
 * 
 * Supabase handles CSRF protection automatically through:
 * 1. Cookie-based authentication with SameSite attribute
 * 2. Short-lived access tokens
 * 3. Automatic token refresh
 * 
 * Additional protection:
 * - All state-changing operations require authentication
 * - Use POST/PUT/DELETE for mutations, never GET
 * - Validate origin headers for sensitive operations
 */

export const security = {
  /**
   * Validate that a request is from the same origin
   */
  validateOrigin: (request: NextRequest): boolean => {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    
    if (!origin) return true // Same-origin requests don't send Origin header
    
    return origin.includes(host || '')
  },

  /**
   * Check if request is from authenticated user
   */
  requireAuth: async (request: NextRequest): Promise<boolean> => {
    // This is handled by middleware.ts, but can be used for additional checks
    const authHeader = request.headers.get('authorization')
    return !!authHeader
  },
}

/**
 * Data Validation Schemas
 * 
 * Use these to validate input before processing
 */

export const validate = {
  patient: {
    fullName: (value: string) => value.length >= 2 && value.length <= 100,
    age: (value: number) => value >= 0 && value <= 150,
    gender: (value: string) => ['Male', 'Female', 'Other'].includes(value),
    phone: (value: string) => /^[+\-0-9() ]{7,20}$/.test(value),
    email: (value: string) => 
      value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  },

  appointment: {
    visitType: (value: string) => value.length >= 2 && value.length <= 100,
    diagnosis: (value: string) => value.length >= 2 && value.length <= 1000,
    notes: (value: string) => value.length <= 5000,
    date: (value: Date) => value >= new Date() || value <= new Date('2100-01-01'),
  },

  profile: {
    name: (value: string) => value.length >= 2 && value.length <= 100,
    phone: (value: string) => /^[+\-0-9() ]{7,20}$/.test(value),
    specialty: (value: string) => value.length >= 2 && value.length <= 100,
    clinicName: (value: string) => value.length >= 2 && value.length <= 200,
  },
}
