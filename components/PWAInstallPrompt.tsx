'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

// Store the deferred prompt globally so it can be accessed from profile page
let globalDeferredPrompt: any = null
let hasShownInSession = false // Track if we've shown the prompt in this session

export function getInstallPrompt() {
  return globalDeferredPrompt
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Don't show if already shown in this session
    if (hasShownInSession) {
      return
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    // Check if permanently dismissed
    const permanentlyDismissed = localStorage.getItem('pwa-permanently-dismissed')
    if (permanentlyDismissed === 'true') {
      return
    }

    // Check if user chose "Remind Later" in this session
    const sessionDismissed = sessionStorage.getItem('pwa-session-dismissed')
    if (sessionDismissed === 'true') {
      return
    }

    // Check if user chose "Remind Later" and it hasn't expired (next login)
    const remindLater = localStorage.getItem('pwa-remind-later')
    if (remindLater) {
      return // Don't show until next session/login
    }

    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Store the event so it can be triggered later
      setDeferredPrompt(e)
      globalDeferredPrompt = e
      
      // Only show if we haven't shown in this session
      if (!hasShownInSession) {
        setTimeout(() => {
          setShowPrompt(true)
          hasShownInSession = true
        }, 3000)
      }
    }

    window.addEventListener('beforeinstallprompt', handler as EventListener)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
      // Clear all dismissal flags
      localStorage.removeItem('pwa-remind-later')
      localStorage.removeItem('pwa-permanently-dismissed')
      sessionStorage.removeItem('pwa-session-dismissed')
    }

    // Clear the prompt
    setDeferredPrompt(null)
    globalDeferredPrompt = null
    setShowPrompt(false)
    hasShownInSession = true
  }

  const handleRemindLater = () => {
    setShowPrompt(false)
    hasShownInSession = true
    // Mark as dismissed for this session only
    sessionStorage.setItem('pwa-session-dismissed', 'true')
    // Also set reminder for next login/session
    localStorage.setItem('pwa-remind-later', 'true')
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    hasShownInSession = true
    // Permanently dismiss (user can still install from profile page)
    localStorage.setItem('pwa-permanently-dismissed', 'true')
    sessionStorage.setItem('pwa-session-dismissed', 'true')
  }

  if (!showPrompt || !deferredPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl">
              🏥
            </div>
            <div>
              <h3 className="font-bold text-lg">Install MyClinic</h3>
              <p className="text-sm text-primary-100">Quick access anytime</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition"
            aria-label="Close permanently"
            title="Don't show again"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-gray-600 text-sm mb-4">
            Install MyClinic Admin on your device for quick access and offline capabilities.
          </p>
          
          <div className="flex flex-col gap-2">
            <button
              onClick={handleInstall}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 px-4 rounded-lg transition"
            >
              Install Now
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleRemindLater}
                className="flex-1 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition border border-gray-300"
              >
                Remind Later
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Don&apos;t Show Again
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            You can install anytime from your profile settings
          </p>
        </div>
      </div>
    </div>
  )
}
