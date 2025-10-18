'use client'

import { Spinner } from '@/components/ui/spinner'
import { LoadingDemo } from '@/components/loading-demo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SpinnerTestPage() {
  const variants = [
    'default',
    'circle', 
    'pinwheel',
    'circle-filled',
    'ellipsis',
    'ring',
    'bars',
    'infinite'
  ] as const

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Spinner Component Showcase</h1>
        <p className="text-muted-foreground">
          All spinner variants from shadcn/ui with the ring animation as default
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ring Animation (Default)</CardTitle>
          <CardDescription>
            This is the ring animation you requested from the shadcn template
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Spinner variant="ring" size={48} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Spinner Variants</CardTitle>
          <CardDescription>
            All available spinner variants for comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {variants.map((variant) => (
              <div key={variant} className="flex flex-col items-center space-y-2">
                <Spinner variant={variant} size={32} />
                <span className="text-sm text-muted-foreground capitalize">
                  {variant.replace('-', ' ')}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Global Loading Demo</CardTitle>
          <CardDescription>
            Test the global loading functionality with ring spinner
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingDemo />
        </CardContent>
      </Card>
    </div>
  )
}
