'use client'

import * as React from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[calc(100vh-0px)] grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}


