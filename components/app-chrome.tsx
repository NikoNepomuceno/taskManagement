'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuth = pathname?.startsWith('/auth')
  if (isAuth) return <>{children}</>
  return (
    <>
      <Sidebar />
      {children}
    </>
  )
}


