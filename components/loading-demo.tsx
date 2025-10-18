'use client'

import { useLoading } from '@/contexts/loading-context'
import { Button } from '@/components/ui/button'

export function LoadingDemo() {
  const { showLoading, hideLoading } = useLoading()

  const handleAsyncOperation = async () => {
    showLoading('Processing your request...')
    
    // Simulate an async operation
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    hideLoading()
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Global Loading Demo</h3>
      <p className="text-muted-foreground">
        Click the button below to see the ring spinner in action:
      </p>
      <Button onClick={handleAsyncOperation}>
        Start Loading (3 seconds)
      </Button>
    </div>
  )
}
