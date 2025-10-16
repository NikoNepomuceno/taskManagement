export interface TaskFile {
  id: string
  name: string
  size: number
  type: string
  data: string // base64 encoded file data
  uploadedAt: Date
}

export interface Task {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  files: TaskFile[]
  createdAt: Date
  updatedAt: Date
  completed: boolean
}

export type TaskStatus = "pending" | "on-track" | "approaching" | "urgent" | "overdue"

export function getTaskStatus(task: Task): TaskStatus {
  const now = new Date()
  const startDate = new Date(task.startDate)
  const endDate = new Date(task.endDate)
  const daysUntilDue = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  // If task hasn't started yet
  if (now < startDate) {
    return "pending"
  }

  // If past deadline
  if (daysUntilDue < 0) {
    return "overdue"
  }

  // If deadline is very close (1-2 days)
  if (daysUntilDue <= 2) {
    return "urgent"
  }

  // If deadline is approaching (3-7 days)
  if (daysUntilDue <= 7) {
    return "approaching"
  }

  // Plenty of time remaining
  return "on-track"
}
