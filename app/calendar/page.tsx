"use client"

import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTasks } from "@/contexts/task-context"
import { getTaskStatus } from "@/lib/types"
import { useState } from "react"
import { format, isSameDay } from "date-fns"
import Link from "next/link"

export default function CalendarPage() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const { tasks } = useTasks()

    // Get tasks for the selected date
    const getTasksForDate = (selectedDate: Date) => {
        return tasks.filter(task => {
            const startDate = new Date(task.startDate)
            const endDate = new Date(task.endDate)
            return isSameDay(startDate, selectedDate) || 
                   isSameDay(endDate, selectedDate) ||
                   (selectedDate >= startDate && selectedDate <= endDate)
        })
    }

    const selectedDateTasks = date ? getTasksForDate(date) : []

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="lg:pl-64">
                <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold">Calendar</h1>
                        <p className="text-muted-foreground">View your tasks and deadlines</p>
                    </div>
                    
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                        {/* Calendar Card */}
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Task Calendar</CardTitle>
                                <CardDescription>
                                    Click on a date to view tasks for that day
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-6">
                                <Calendar
                                    selectedDate={date}
                                    onDateSelect={setDate}
                                    tasks={tasks}
                                    className="rounded-md"
                                />
                            </CardContent>
                        </Card>

                        {/* Tasks for Selected Date */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg sm:text-xl">
                                    {date ? format(date, 'MMMM d, yyyy') : 'Select a date'}
                                </CardTitle>
                                <CardDescription>
                                    {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''} found
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {selectedDateTasks.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedDateTasks.map((task) => {
                                            const status = getTaskStatus(task)
                                            const statusColors = {
                                                pending: "bg-blue-100 text-blue-800",
                                                "on-track": "bg-green-100 text-green-800",
                                                approaching: "bg-yellow-100 text-yellow-800",
                                                urgent: "bg-orange-100 text-orange-800",
                                                overdue: "bg-red-100 text-red-800"
                                            }
                                            
                                            return (
                                                <Link href={`/tasks/${task.id}`} key={task.id} className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                    <div className="flex items-start justify-between mb-2 gap-2">
                                                        <h4 className="font-medium text-sm flex-1 min-w-0">{task.title}</h4>
                                                        <Badge className={`text-xs flex-shrink-0 ${statusColors[status]}`}>
                                                            {status.replace('-', ' ')}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                                        {task.description}
                                                    </p>
                                                    <div className="text-xs text-muted-foreground space-y-1">
                                                        <div>Start: {format(new Date(task.startDate), 'MMM d, yyyy')}</div>
                                                        <div>Due: {format(new Date(task.endDate), 'MMM d, yyyy')}</div>
                                                        {task.files.length > 0 && (
                                                            <div className="mt-1">
                                                                📎 {task.files.length} file{task.files.length !== 1 ? 's' : ''}
                                                            </div>
                                                        )}
                                                    </div>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-8">
                                        {date ? 'No tasks for this date' : 'Select a date to view tasks'}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}