"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CheckCircle2 } from "lucide-react"
import type { Task } from "@/lib/types"

interface CompletionConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  task: Task | null
}

export function CompletionConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  task,
}: CompletionConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <AlertDialogTitle>Mark Task as Complete?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to mark this task as completed?
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        
        {task && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="font-medium text-sm mb-2">{task.title}</h4>
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700 focus:ring-green-600"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark Complete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
