"use client"

import Link from "next/link"
import { useTasks } from "@/contexts/task-context"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getTaskStatus } from "@/lib/types"
import { Calendar, ArrowLeft, Paperclip } from "lucide-react"
import { format } from "date-fns"

interface TaskPageProps {
  params: { id: string }
}

export default function TaskPage({ params }: TaskPageProps) {
  const { id } = params
  const { tasks } = useTasks()

  const task = tasks.find((t) => t.id === id)

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="lg:pl-64">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to tasks
            </Link>
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Task not found</CardTitle>
                <CardDescription>The task you are looking for does not exist.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const status = getTaskStatus(task)
  const statusToLabel: Record<string, string> = {
    overdue: "Overdue",
    urgent: "Urgent",
    approaching: "Approaching",
    "on-track": "On Track",
    pending: "Pending",
  }

  const statusToClass: Record<string, string> = {
    overdue: "bg-red-500 text-white",
    urgent: "bg-orange-500 text-white",
    approaching: "bg-amber-500 text-white",
    "on-track": "bg-emerald-500 text-white",
    pending: "bg-blue-500 text-white",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="lg:pl-64">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to tasks
          </Link>

          <Card className="mt-4">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-3xl">{task.title}</CardTitle>
                  {task.description && (
                    <CardDescription className="text-base mt-2">{task.description}</CardDescription>
                  )}
                </div>
                <Badge className={statusToClass[status]}>{statusToLabel[status]}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Start:</span>
                  <span className="font-medium">{format(new Date(task.startDate), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Due:</span>
                  <span className="font-medium">{format(new Date(task.endDate), "MMM dd, yyyy")}</span>
                </div>
              </div>

              {task.files.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 text-sm mb-3">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Attachments</span>
                  </div>
                  <div className="grid gap-2">
                    {task.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB • {format(new Date(file.uploadedAt), "MMM dd, yyyy")}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement("a")
                              link.href = file.data
                              link.download = file.name
                              link.click()
                            }}
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


