'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { PasswordInput } from '@/components/password-input'
import { OAuthButtons } from '@/components/oauth-buttons'
import { requestEmailOtp, verifyEmailOtp, registerUser } from '@/lib/auth-mock'
import Link from 'next/link'

const registerSchema = z
  .object({
    email: z.string().email(),
    username: z.string().min(3),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

type RegisterValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [step, setStep] = React.useState<'form' | 'otp' | 'done'>('form')
  const [email, setEmail] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [otpError, setOtpError] = React.useState<string | null>(null)

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', username: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (values: RegisterValues) => {
    setSubmitting(true)
    try {
      await requestEmailOtp(values.email)
      setEmail(values.email)
      setStep('otp')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const code = String(data.get('otp') || '')
    setSubmitting(true)
    setOtpError(null)
    try {
      const ok = await verifyEmailOtp(email, code)
      if (!ok.ok) {
        setOtpError('Invalid code. Try again.')
        return
      }
      const values = form.getValues()
      await registerUser({ email: values.email, username: values.username, password: values.password })
      setStep('done')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Register</CardTitle>
            <CardDescription>Create your account</CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'form' && (
              <div className="grid gap-6">
                <OAuthButtons />
                <div className="text-center text-xs text-muted-foreground">or continue with email</div>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="name@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <PasswordInput placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm password</FormLabel>
                          <FormControl>
                            <PasswordInput placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={submitting} className="w-full">Continue</Button>
                  </form>
                </Form>
              </div>
            )}

            {step === 'otp' && (
              <form onSubmit={handleVerify} className="grid gap-4">
                <div className="text-sm text-muted-foreground text-center">Enter the 6-digit code sent to {email}</div>
                <Input name="otp" inputMode="numeric" maxLength={6} placeholder="123456" className="text-center text-lg tracking-widest" />
                {otpError && <div className="text-destructive text-sm text-center">{otpError}</div>}
                <Button type="submit" disabled={submitting} className="w-full">Verify</Button>
                <Button type="button" variant="ghost" onClick={() => setStep('form')} className="w-full">Change email</Button>
              </form>
            )}

            {step === 'done' && (
              <div className="grid gap-3 text-center">
                <div className="text-sm">Email verified. Account created.</div>
                <Button asChild className="w-full">
                  <Link href="/auth/login">Go to Login</Link>
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-center">
            <div className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <Link className="text-primary hover:underline" href="/auth/login">Sign in</Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}


