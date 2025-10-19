"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTasks } from "@/contexts/task-context"
import { Upload, X } from "lucide-react"
import type { TaskFile } from "@/lib/types"

export function TaskForm() {
  const { addTask, isLoading, error } = useTasks()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [files, setFiles] = useState<TaskFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !startDate || !endDate) return

    setIsSubmitting(true)

    try {
      await addTask({
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        priority,
        files,
      })

      // Reset form only on success
      setTitle("")
      setDescription("")
      setStartDate("")
      setEndDate("")
      setPriority('medium')
      setFiles([])
    } catch (err) {
      console.error('Error creating task:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Task</CardTitle>
        <CardDescription>Add a task with deadlines and attach files</CardDescription>
      </CardHeader>
      <CardContent>
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
              placeholder="Supports Markdown: lists, checkboxes, bullets"
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
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">🔴 High Priority</SelectItem>
                <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                <SelectItem value="low">🟢 Low Priority</SelectItem>
              </SelectContent>
            </Select>
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

          {error && (
            <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
            {isSubmitting || isLoading ? "Creating..." : "Create Task"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
