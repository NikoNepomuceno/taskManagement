'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { notifyLoading, notifyLoadingSuccess, notifyLoadingError } from '@/lib/alerts'

export function OAuthButtons({ onGoogle }: { onGoogle?: () => void }) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleGoogleSignIn = async () => {
    if (onGoogle) {
      onGoogle()
      return
    }

    setIsLoading(true)
    notifyLoading('Signing you in with Google...', 'Logging In')
    
    try {
      const result = await signIn('google', { 
        callbackUrl: '/',
        redirect: false 
      })
      
      if (result?.error) {
        notifyLoadingError('Failed to sign in with Google')
      } else if (result?.ok) {
        notifyLoadingSuccess('Welcome! You\'re now logged in.')
        // Redirect manually since we disabled automatic redirect
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Google sign-in error:', error)
      notifyLoadingError('Failed to sign in with Google')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-3">
      <Button
        variant="outline"
        type="button"
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        <Image
          src="/google-icon-logo-svgrepo-com.svg"
          width={18}
          height={18}
          alt="Google"
          className="mr-2"
          priority
        />
        {isLoading ? 'Signing in...' : 'Continue with Google'}
      </Button>
    </div>
  )
}


