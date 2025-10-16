"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useTasks } from "@/contexts/task-context"
import { Upload, X, Plus } from "lucide-react"
import type { TaskFile, Task } from "@/lib/types"

interface TaskFormModalProps {
  editTask?: Task | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function TaskFormModal({ editTask, open: controlledOpen, onOpenChange, trigger }: TaskFormModalProps) {
  const { addTask, updateTask } = useTasks()
  const [internalOpen, setInternalOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [files, setFiles] = useState<TaskFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  useEffect(() => {
    if (editTask && open) {
      setTitle(editTask.title)
      setDescription(editTask.description)
      setStartDate(new Date(editTask.startDate).toISOString().split("T")[0])
      setEndDate(new Date(editTask.endDate).toISOString().split("T")[0])
      setFiles(editTask.files)
    } else if (!open) {
      // Reset form when dialog closes
      setTitle("")
      setDescription("")
      setStartDate("")
      setEndDate("")
      setFiles([])
    }
  }, [editTask, open])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles) return

    const newFiles: TaskFile[] = []

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      const reader = new FileReader()

      await new Promise<void>((resolve) => {
        reader.onload = (event) => {
          const base64Data = event.target?.result as string
          newFiles.push({
            id: crypto.randomUUID(),
            name: file.name,
            size: file.size,
            type: file.type,
            data: base64Data,
            uploadedAt: new Date(),
          })
          resolve()
        }
        reader.readAsDataURL(file)
      })
    }

    setFiles((prev) => [...prev, ...newFiles])
  }

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !startDate || !endDate) return

    setIsSubmitting(true)

    if (editTask) {
      updateTask(editTask.id, {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        files,
      })
    } else {
      addTask({
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        files,
        completed: false,
      })
    }

    // Reset form
    setTitle("")
    setDescription("")
    setStartDate("")
    setEndDate("")
    setFiles([])
    setIsSubmitting(false)
    setOpen(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      {!trigger && controlledOpen === undefined && !editTask && (
        <DialogTrigger asChild>
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Create Task
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editTask ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {editTask ? "Update task details and attachments" : "Add a task with deadlines and attach files"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date / Deadline</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="files">Attach Files</Label>
            <div className="flex items-center gap-2">
              <Input id="files" type="file" multiple onChange={handleFileUpload} className="cursor-pointer" />
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Attached Files ({files.length})</Label>
              <div className="space-y-2">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(file.id)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (editTask ? "Updating..." : "Creating...") : editTask ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
