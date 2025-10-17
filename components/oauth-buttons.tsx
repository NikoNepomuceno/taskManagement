'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { signIn } from 'next-auth/react'

export function OAuthButtons({ onGoogle }: { onGoogle?: () => void }) {
  return (
    <div className="grid gap-3">
      <Button
        variant="outline"
        type="button"
        onClick={onGoogle ?? (() => signIn('google', { callbackUrl: '/' }))}
      >
        <Image
          src="/google-icon-logo-svgrepo-com.svg"
          width={18}
          height={18}
          alt="Google"
          className="mr-2"
          priority
        />
        Continue with Google
      </Button>
    </div>
  )
}


