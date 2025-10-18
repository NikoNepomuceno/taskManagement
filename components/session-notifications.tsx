'use client'

import * as React from 'react'
import { useSession } from 'next-auth/react'
import { notifySuccess } from '@/lib/alerts'

export function SessionNotifications() {
  const { data: session, status } = useSession()
  const [previousSession, setPreviousSession] = React.useState<any>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return

    // Check if user just logged in
    if (status === 'authenticated' && session && !previousSession) {
      // Only show notification if we're not on the login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/')) {
        notifySuccess('Welcome! You\'re now logged in.')
      }
    }
    
    // Check if user just logged out
    if (status === 'unauthenticated' && previousSession && !session) {
      // Only show notification if we're not on the login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/')) {
        notifySuccess('You have been logged out successfully!')
      }
    }

    setPreviousSession(session)
  }, [session, status, previousSession, mounted])

  return null
}
