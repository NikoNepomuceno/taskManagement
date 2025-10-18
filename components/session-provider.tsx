'use client'

import * as React from 'react'
import { SessionProvider as NextAuthSessionProvider, useSession } from 'next-auth/react'
import { notifySuccess } from '@/lib/alerts'

function SessionNotificationHandler() {
  const { data: session, status } = useSession()
  const [previousSession, setPreviousSession] = React.useState<any>(null)

  React.useEffect(() => {
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
  }, [session, status, previousSession])

  return null
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <SessionNotificationHandler />
      {children}
    </NextAuthSessionProvider>
  )
}


