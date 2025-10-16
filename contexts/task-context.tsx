"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Task, TaskFile } from "@/lib/types"

interface TaskContextType {
  tasks: Task[]
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void
  updateTask: (id: string, task: Partial<Task>) => void
  deleteTask: (id: string) => void
  addFileToTask: (taskId: string, file: TaskFile) => void
  removeFileFromTask: (taskId: string, fileId: string) => void
  toggleTaskCompletion: (id: string) => void
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load tasks from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("tasks")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Convert date strings back to Date objects
        const tasksWithDates = parsed.map((task: any) => ({
          ...task,
          startDate: new Date(task.startDate),
          endDate: new Date(task.endDate),
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          files: task.files.map((file: any) => ({
            ...file,
            uploadedAt: new Date(file.uploadedAt),
          })),
        }))
        setTasks(tasksWithDates)
      } catch (error) {
        console.error("Failed to load tasks:", error)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("tasks", JSON.stringify(tasks))
    }
  }, [tasks, isLoaded])

  const addTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setTasks((prev) => [...prev, newTask])
  }

  const updateTask = (id: string, taskData: Partial<Task>) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...taskData, updatedAt: new Date() } : task)))
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const addFileToTask = (taskId: string, file: TaskFile) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, files: [...task.files, file], updatedAt: new Date() } : task,
      ),
    )
  }

  const removeFileFromTask = (taskId: string, fileId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, files: task.files.filter((f) => f.id !== fileId), updatedAt: new Date() }
          : task,
      ),
    )
  }

  const toggleTaskCompletion = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed, updatedAt: new Date() } : task)),
    )
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
