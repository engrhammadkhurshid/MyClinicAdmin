'use client'

import { useEffect, useState } from 'react'
import { Download, CheckCircle, Smartphone } from 'lucide-react'
import toast from 'react-hot-toast'

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handler as EventListener)

    // Check if installed via appinstalled event
    const installedHandler = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      toast.success('App installed successfully!')
    }

    window.addEventListener('appinstalled', installedHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast.error('Installation prompt is not available')
      return
    }

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      toast.success('Installing app...')
      // Clear any reminder settings
      localStorage.removeItem('pwa-remind-later')
      localStorage.removeItem('pwa-permanently-dismissed')
    } else {
      toast('Installation cancelled', { icon: 'ℹ️' })
    }

    // Clear the deferred prompt
    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  if (isInstalled) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900 mb-1">App Installed</h3>
            <p className="text-sm text-green-700">
              MyClinic Admin is installed on your device. You can access it from your home screen or app drawer.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!isInstallable) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Smartphone className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">PWA Installation</h3>
            <p className="text-sm text-blue-700 mb-2">
              This app can be installed on supported browsers (Chrome, Edge, Safari on iOS 16.4+).
            </p>
            <p className="text-xs text-blue-600">
              The installation option will appear when available.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Download className="w-6 h-6 text-primary-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">Install MyClinic App</h3>
          <p className="text-sm text-gray-600 mb-3">
            Install MyClinic Admin for quick access, offline support, and a native app experience.
          </p>
          <button
            onClick={handleInstall}
            className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Install App
          </button>
        </div>
      </div>
    </div>
  )
}
