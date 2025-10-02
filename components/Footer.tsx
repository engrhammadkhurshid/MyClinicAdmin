'use client'

export function Footer() {
  return (
    <footer className="w-full py-3 px-6 bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-center text-xs text-gray-500">
            © {new Date().getFullYear()} MyClinic Admin. All rights reserved.
          </p>
          <p className="text-center text-xs text-gray-400 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold">BETA</span>
            <span>v0.1.0</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
