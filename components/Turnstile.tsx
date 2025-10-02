'use client'

import { Turnstile } from '@marsidev/react-turnstile'
import { useState } from 'react'

interface TurnstileProps {
  onSuccess: (token: string) => void
  onError?: () => void
}

export function TurnstileWidget({ onSuccess, onError }: TurnstileProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const [error, setError] = useState(false)

  if (!siteKey) {
    console.error('❌ Turnstile site key not configured in environment variables')
    return (
      <div className="flex justify-center my-4">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md">
          <p className="text-sm text-yellow-800 font-medium">⚠️ CAPTCHA Not Configured</p>
          <p className="text-xs text-yellow-600 mt-1">
            Please add NEXT_PUBLIC_TURNSTILE_SITE_KEY to your .env.local file
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center my-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-2">
          <p className="text-sm text-red-800">Failed to load CAPTCHA. Please refresh the page.</p>
        </div>
      )}
      <Turnstile
        siteKey={siteKey}
        onSuccess={(token) => {
          console.log('✅ Turnstile verification successful')
          onSuccess(token)
        }}
        onError={() => {
          console.error('❌ Turnstile verification failed')
          setError(true)
          onError?.()
        }}
        onExpire={() => {
          console.warn('⚠️ Turnstile token expired')
          onSuccess('') // Clear token
        }}
        options={{
          theme: 'light',
          size: 'normal',
          action: 'login',
          appearance: 'always',
        }}
      />
    </div>
  )
}
