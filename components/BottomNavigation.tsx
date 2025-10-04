'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Users, Calendar, User, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const baseNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Profile', href: '/profile', icon: User },
]

const ownerNavigation = [
  { name: 'Team', href: '/team', icon: Shield, ownerOnly: true },
]

export function BottomNavigation() {
  const pathname = usePathname()
  const supabase = createClient()
  const [navigation, setNavigation] = useState(baseNavigation)

  useEffect(() => {
    async function checkRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('staff_members')
        .select('role')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (data?.role === 'owner') {
        setNavigation([...baseNavigation, ...ownerNavigation])
      }
    }

    checkRole()
  }, [])

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div className="flex justify-around items-center h-16">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? 'text-primary-500' : 'text-gray-400'
                  }`}
                />
                <span
                  className={`text-xs mt-1 ${
                    isActive ? 'text-primary-500 font-medium' : 'text-gray-600'
                  }`}
                >
                  {item.name}
                </span>
              </motion.div>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-0 right-0 h-0.5 bg-primary-500"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
