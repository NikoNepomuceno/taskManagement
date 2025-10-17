"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useTasks } from "@/contexts/task-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getTaskStatus } from "@/lib/types"
import { format, isSameDay } from "date-fns"
import { ArrowLeft } from "lucide-react"

interface CalendarDatePageProps {
  params: { date: string }
}

export default function CalendarDatePage({ params }: CalendarDatePageProps) {
  const { date } = params
  const parsedDate = useMemo(() => new Date(date), [date])
  const { tasks } = useTasks()

  const tasksForDate = useMemo(() => {
    if (Number.isNaN(parsedDate.getTime())) return []
    return tasks.filter((task) => {
      const startDate = new Date(task.startDate)
      const endDate = new Date(task.endDate)
      return (
        isSameDay(startDate, parsedDate) ||
        isSameDay(endDate, parsedDate) ||
        (parsedDate >= startDate && parsedDate <= endDate)
      )
    })
  }, [tasks, parsedDate])

  const statusColors: Record<string, string> = {
    pending: "bg-blue-100 text-blue-800",
    "on-track": "bg-green-100 text-green-800",
    approaching: "bg-yellow-100 text-yellow-800",
    urgent: "bg-orange-100 text-orange-800",
    overdue: "bg-red-100 text-red-800",
  }

  return (
    <div className="ml-64 p-6 lg:ml-64 lg:p-6">
      <div className="mb-6">
        <Link href="/calendar" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to calendar
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{Number.isNaN(parsedDate.getTime()) ? "Invalid date" : format(parsedDate, "MMMM d, yyyy")}</CardTitle>
            <CardDescription>
              {tasksForDate.length} task{tasksForDate.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Number.isNaN(parsedDate.getTime()) ? (
              <div className="text-center text-muted-foreground py-8">Provide a valid date string, e.g. 2025-10-17</div>
            ) : tasksForDate.length > 0 ? (
              <div className="space-y-3">
                {tasksForDate.map((task) => {
                  const status = getTaskStatus(task)
                  return (
                    <Link key={task.id} href={`/tasks/${task.id}`} className="block">
                      <div className="p-3 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <Badge className={`text-xs ${statusColors[status]}`}>{status.replace("-", " ")}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">No tasks for this date</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


