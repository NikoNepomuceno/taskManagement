"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useSession } from "next-auth/react"
import type { Task, TaskFile } from "@/lib/types"
import { notifyError, notifySuccess, notifyLoading, notifyLoadingSuccess, notifyLoadingError } from "@/lib/alerts"
import { showLoginNotification } from "@/lib/notifications"

interface TaskContextType {
  tasks: Task[]
  addTask: (task: Omit<Task, "id" | "_id" | "createdAt" | "updatedAt">) => Promise<void>
  updateTask: (id: string, task: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  addFileToTask: (taskId: string, file: TaskFile) => Promise<void>
  removeFileFromTask: (taskId: string, fileId: string) => Promise<void>
  toggleTaskCompletion: (id: string) => Promise<void>
  reorderTasks: (activeId: string, overId: string) => void
  isLoading: boolean
  error: string | null
  refetchTasks: () => Promise<void>
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  // Fetch tasks from database
  const fetchTasks = async () => {
    if (!session?.user?.email) {
      console.log('No session or user email, skipping fetch')
      setTasks([]) // Clear tasks when no session
      return
    }
    
    console.log('Fetching tasks for user:', session.user.email)
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/tasks', { cache: 'no-store' })
      if (!response.ok) {
        if (response.status === 401) {
          setError('Please sign in to view your tasks')
          setTasks([])
          return
        }
        if (response.status === 404) {
          // Treat missing user/tasks as empty state rather than fatal error
          setTasks([])
          return
        }
        throw new Error(`Failed to fetch tasks (${response.status})`)
      }
      const data = await response.json()
      
      // Convert database format to frontend format
      const formattedTasks = data.map((task: any) => ({
        ...task,
        id: task._id, // Use _id as id for compatibility
        startDate: task.startDate ? new Date(task.startDate) : (task.dueDate ? new Date(task.dueDate) : new Date()),
        endDate: task.endDate ? new Date(task.endDate) : (task.dueDate ? new Date(task.dueDate) : new Date()),
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        files: task.attachments || [],
        completed: task.completed || false,
        color: task.color || '#3b82f6',
      }))
      
      setTasks(formattedTasks)
      
      // Check for critical tasks and show notification
      if (formattedTasks.length > 0) {
        showLoginNotification(formattedTasks)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
      console.error('Error fetching tasks:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Load tasks when session is available
  useEffect(() => {
    if (session?.user?.email) {
      console.log('Session available, fetching tasks')
      fetchTasks()
    } else {
      console.log('No session, clearing tasks')
      setTasks([])
    }
  }, [session])

  const addTask = async (taskData: Omit<Task, "id" | "_id" | "createdAt" | "updatedAt">) => {
    if (!session?.user?.email) return
    
    setIsLoading(true)
    setError(null)
    
    // Show loading notification
    notifyLoading('Creating task...', 'Creating Task')
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: taskData.title,
          description: taskData.description,
          startDate: taskData.startDate.toISOString(),
          endDate: taskData.endDate.toISOString(),
          priority: taskData.priority || 'medium',
          color: taskData.color || '#3b82f6',
          attachments: taskData.files,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create task')
      }

      const newTask = await response.json()
      
      // Add the new task to local state
      const formattedTask = {
        ...newTask,
        id: newTask._id,
        startDate: new Date(taskData.startDate),
        endDate: new Date(taskData.endDate),
        createdAt: new Date(newTask.createdAt),
        updatedAt: new Date(newTask.updatedAt),
        files: taskData.files,
        completed: false,
      }
      
      setTasks((prev) => [...prev, formattedTask])
      notifyLoadingSuccess('Task created successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
      console.error('Error creating task:', err)
      notifyLoadingError('Failed to create task')
    } finally {
      setIsLoading(false)
    }
  }

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    if (!session?.user?.email) return
    
    setIsLoading(true)
    setError(null)
    
    // Show loading notification
    notifyLoading('Updating task...', 'Updating Task')
    
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      const updatedTask = await response.json()
      
      // Update local state
      setTasks((prev) => prev.map((task) => 
        task.id === id ? { ...task, ...taskData, updatedAt: new Date() } : task
      ))
      notifyLoadingSuccess('Task updated successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task')
      console.error('Error updating task:', err)
      notifyLoadingError('Failed to update task')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTask = async (id: string) => {
    if (!session?.user?.email) return
    
    setIsLoading(true)
    setError(null)
    
    // Show loading notification
    notifyLoading('Deleting task...', 'Deleting Task')
    
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete task')
      }

      // Remove from local state
      setTasks((prev) => prev.filter((task) => task.id !== id))
      notifyLoadingSuccess('Task deleted successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
      console.error('Error deleting task:', err)
      notifyLoadingError('Failed to delete task')
    } finally {
      setIsLoading(false)
    }
  }

  const addFileToTask = async (taskId: string, file: TaskFile) => {
    // For now, just update local state
    // TODO: Implement file upload API
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, files: [...task.files, file], updatedAt: new Date() } : task,
      ),
    )
  }

  const removeFileFromTask = async (taskId: string, fileId: string) => {
    // For now, just update local state
    // TODO: Implement file removal API
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, files: task.files.filter((f) => f.id !== fileId), updatedAt: new Date() }
          : task,
      ),
    )
  }

  const toggleTaskCompletion = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    
    await updateTask(id, { completed: !task.completed })
  }

  const reorderTasks = (activeId: string, overId: string) => {
    setTasks((items) => {
      const oldIndex = items.findIndex((item) => item.id === activeId)
      const newIndex = items.findIndex((item) => item.id === overId)
      
      if (oldIndex === -1 || newIndex === -1) return items
      
      const newItems = [...items]
      const [removed] = newItems.splice(oldIndex, 1)
      newItems.splice(newIndex, 0, removed)
      
      return newItems
    })
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        addFileToTask,
        removeFileFromTask,
        toggleTaskCompletion,
        reorderTasks,
        isLoading,
        error,
        refetchTasks: fetchTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider")
  }
  return context
}
