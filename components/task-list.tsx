"use client"

import { useTasks } from "@/contexts/task-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, FileText, Trash2, Paperclip, Eye, Search, Edit, CheckCircle2 } from "lucide-react"
import { getTaskStatus, type Task, type TaskFile, type TaskStatus } from "@/lib/types"
import Link from "next/link"
import { format } from "date-fns"
import { useState, useMemo } from "react"
import { FileViewerDialog } from "./file-viewer-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TaskFormModal } from "./task-form-modal"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"
import { CompletionConfirmationDialog } from "./completion-confirmation-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface TaskListProps {
  showCompleted?: boolean
}

export function TaskList({ showCompleted = false }: TaskListProps) {
  const { tasks, deleteTask, toggleTaskCompletion, isLoading, error } = useTasks()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [viewingFile, setViewingFile] = useState<TaskFile | null>(null)
  const [fileDialogOpen, setFileDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false)
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue":
        return "bg-red-500 text-white hover:bg-red-600"
      case "urgent":
        return "bg-orange-500 text-white hover:bg-orange-600"
      case "approaching":
        return "bg-amber-500 text-white hover:bg-amber-600"
      case "on-track":
        return "bg-emerald-500 text-white hover:bg-emerald-600"
      case "pending":
        return "bg-blue-500 text-white hover:bg-blue-600"
      default:
        return "bg-gray-500 text-white hover:bg-gray-600"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "overdue":
        return "Overdue"
      case "urgent":
        return "Urgent"
      case "approaching":
        return "Approaching"
      case "on-track":
        return "On Track"
      case "pending":
        return "Pending"
      default:
        return "Unknown"
    }
  }

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter((task) => task.completed === showCompleted)

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (task) => task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query),
      )
    }

    // Apply status filter
    if (statusFilter !== "all" && !showCompleted) {
      filtered = filtered.filter((task) => getTaskStatus(task) === statusFilter)
    }

    // Sort by urgency
    const statusOrder: Record<TaskStatus, number> = {
      overdue: 0,
      urgent: 1,
      approaching: 2,
      "on-track": 3,
      pending: 4,
    }

    return filtered.sort((a, b) => {
      const statusA = getTaskStatus(a)
      const statusB = getTaskStatus(b)
      return statusOrder[statusA] - statusOrder[statusB]
    })
  }, [tasks, searchQuery, statusFilter, showCompleted])

  const handleViewFile = (file: TaskFile) => {
    setViewingFile(file)
    setFileDialogOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setEditModalOpen(true)
  }

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete.id)
      setTaskToDelete(null)
    }
    setDeleteDialogOpen(false)
  }

  const handleCompletionClick = (task: Task) => {
    setTaskToComplete(task)
    setCompletionDialogOpen(true)
  }

  const handleConfirmCompletion = async () => {
    if (taskToComplete) {
      await toggleTaskCompletion(taskToComplete.id)
      setTaskToComplete(null)
    }
    setCompletionDialogOpen(false)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg font-medium text-muted-foreground">Loading tasks...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-lg font-medium text-destructive mb-2">Error loading tasks</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          {error.includes('sign in') && (
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/register">Create Account</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (tasks.filter((task) => task.completed === showCompleted).length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          {showCompleted ? (
            <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
          ) : (
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          )}
          <p className="text-lg font-medium text-muted-foreground">
            {showCompleted ? "No completed tasks" : "No tasks yet"}
          </p>
          <p className="text-sm text-muted-foreground">
            {showCompleted ? "Complete some tasks to see them here" : "Create your first task to get started"}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{showCompleted ? "Completed Tasks" : "Your Tasks"}</h2>
          <Badge variant="secondary">
            {filteredAndSortedTasks.length} of {tasks.filter((task) => task.completed === showCompleted).length}
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {!showCompleted && (
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TaskStatus | "all")}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="on-track">On Track</SelectItem>
                <SelectItem value="approaching">Approaching</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {filteredAndSortedTasks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No tasks found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredAndSortedTasks.map((task) => {
              const status = getTaskStatus(task)
              const daysUntilDue = Math.ceil(
                (new Date(task.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
              )

              return (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 sm:gap-4">
                      <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => !task.completed ? handleCompletionClick(task) : toggleTaskCompletion(task.id)}
                          className="mt-1 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <CardTitle
                              className={cn("text-lg sm:text-xl break-words", task.completed && "line-through text-muted-foreground")}
                            >
                              <Link href={`/tasks/${task.id}`} className="hover:underline">
                                {task.title}
                              </Link>
                            </CardTitle>
                            {!showCompleted && (
                              <Badge className={cn(getStatusColor(status), "text-xs flex-shrink-0 w-fit")}>{getStatusLabel(status)}</Badge>
                            )}
                          </div>
                          {task.description && (
                            <CardDescription className={cn("text-sm sm:text-base break-words", task.completed && "line-through")}>
                              {task.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 sm:gap-2 shrink-0">
                        {!showCompleted && (
                          <Button variant="ghost" size="icon" onClick={() => handleEditTask(task)} className="h-8 w-8 sm:h-10 sm:w-10">
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(task)} className="h-8 w-8 sm:h-10 sm:w-10">
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground flex-shrink-0">Start:</span>
                          <span className="font-medium truncate">{format(new Date(task.startDate), "MMM dd, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground flex-shrink-0">Due:</span>
                          <span className="font-medium truncate">{format(new Date(task.endDate), "MMM dd, yyyy")}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          {daysUntilDue < 0
                            ? `${Math.abs(daysUntilDue)} days overdue`
                            : daysUntilDue === 0
                              ? "Due today"
                              : `${daysUntilDue} days remaining`}
                        </span>
                      </div>

                      {task.files.length > 0 && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <Button
                            variant="link"
                            className="h-auto p-0 text-sm"
                            onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                          >
                            {task.files.length} {task.files.length === 1 ? "file" : "files"} attached
                          </Button>
                        </div>
                      )}

                      {selectedTask?.id === task.id && task.files.length > 0 && (
                        <div className="space-y-2 pt-2">
                          {task.files.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between rounded-lg border bg-muted/50 p-3"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.size / 1024).toFixed(1)} KB •{" "}
                                  {format(new Date(file.uploadedAt), "MMM dd, yyyy")}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleViewFile(file)}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
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
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <TaskFormModal editTask={editingTask} open={editModalOpen} onOpenChange={setEditModalOpen} />
      <FileViewerDialog file={viewingFile} open={fileDialogOpen} onOpenChange={setFileDialogOpen} />
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        taskTitle={taskToDelete?.title || ""}
      />
      <CompletionConfirmationDialog
        open={completionDialogOpen}
        onOpenChange={setCompletionDialogOpen}
        onConfirm={handleConfirmCompletion}
        task={taskToComplete}
      />
    </>
  )
}
