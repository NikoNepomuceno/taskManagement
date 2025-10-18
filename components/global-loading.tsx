'use client'

import { useState } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface GlobalLoadingProps {
  variant?: 'default' | 'circle' | 'pinwheel' | 'circle-filled' | 'ellipsis' | 'ring' | 'bars' | 'infinite'
  size?: number
  className?: string
  text?: string
  overlay?: boolean
}

export function GlobalLoading({
  variant = 'ring',
  size = 24,
  className,
  text = 'Loading...',
  overlay = true,
}: GlobalLoadingProps) {
  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Spinner variant={variant} size={size} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  )

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  return content
}

// Hook for managing global loading state
export function useGlobalLoading() {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('Loading...')

  const showLoading = (text?: string) => {
    if (text) setLoadingText(text)
    setIsLoading(true)
  }

  const hideLoading = () => {
    setIsLoading(false)
  }

  return {
    isLoading,
    loadingText,
    showLoading,
    hideLoading,
  }
}

// Global loading provider component
export function GlobalLoadingProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, loadingText } = useGlobalLoading()

  return (
    <>
      {children}
      {isLoading && (
        <GlobalLoading text={loadingText} />
      )}
    </>
  )
}
