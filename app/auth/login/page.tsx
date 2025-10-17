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
import { login } from '@/lib/auth-mock'
import Link from 'next/link'
import { notifyError, notifySuccess } from '@/lib/alerts'

const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
  remember: z.boolean().optional(),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '', remember: false },
  })

  const onSubmit = async (values: LoginValues) => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await login(values.identifier, values.password)
      if (!res.ok) {
        setError(res.error || 'Login failed')
        notifyError(res.error || 'Login failed')
        return
      }
      notifySuccess('Logged in successfully')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>Access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <OAuthButtons />
              <div className="text-center text-xs text-muted-foreground">or continue with credentials</div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username or Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com or username" {...field} />
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
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" {...form.register('remember')} />
                      Remember me (30 days)
                    </label>
                    <Link className="text-sm text-primary hover:underline" href="#">Forgot password?</Link>
                  </div>
                  {error && <div className="text-destructive text-sm">{error}</div>}
                  <Button type="submit" disabled={submitting} className="w-full">Sign in</Button>
                </form>
              </Form>
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <div className="text-sm text-muted-foreground text-center">
              New here?{' '}
              <Link className="text-primary hover:underline" href="/auth/register">Create an account</Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}


