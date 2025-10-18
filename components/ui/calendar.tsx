"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface CalendarProps {
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  className?: string
  tasks?: Array<{
    id: string
    title: string
    startDate: Date
    endDate: Date
    completed: boolean
  }>
}

export function Calendar({ selectedDate, onDateSelect, className, tasks = [] }: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [viewDate, setViewDate] = React.useState(new Date())

  const today = new Date()
  const currentMonth = viewDate.getMonth()
  const currentYear = viewDate.getFullYear()

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const firstDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday, 1 = Monday, etc.
  const daysInMonth = lastDayOfMonth.getDate()

  // Get days from previous month to fill the grid
  const prevMonth = new Date(currentYear, currentMonth - 1, 0)
  const daysInPrevMonth = prevMonth.getDate()
  const prevMonthDays = Array.from({ length: firstDayOfWeek }, (_, i) => 
    daysInPrevMonth - firstDayOfWeek + i + 1
  )

  // Get days from next month to fill the grid
  const totalCells = 42 // 6 weeks * 7 days
  const remainingCells = totalCells - (firstDayOfWeek + daysInMonth)
  const nextMonthDays = Array.from({ length: remainingCells }, (_, i) => i + 1)

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const navigateMonth = (direction: 'prev' | 'next') => {
    setViewDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleDateClick = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return
    
    const clickedDate = new Date(currentYear, currentMonth, day)
    setCurrentDate(clickedDate)
    onDateSelect?.(clickedDate)
  }

  const isToday = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    const date = new Date(currentYear, currentMonth, day)
    return date.toDateString() === selectedDate.toDateString()
  }

  const getTasksForDate = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    return tasks.filter(task => {
      const startDate = new Date(task.startDate)
      const endDate = new Date(task.endDate)
      return date >= startDate && date <= endDate
    })
  }

  const getTaskIndicators = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    const dateTasks = getTasksForDate(day)
    return dateTasks.map((task, index) => {
      const startDate = new Date(task.startDate)
      const endDate = new Date(task.endDate)
      const isStart = date.toDateString() === startDate.toDateString()
      const isEnd = date.toDateString() === endDate.toDateString()
      const isMiddle = date > startDate && date < endDate
      
      return {
        ...task,
        isStart,
        isEnd,
        isMiddle,
        colorClass: undefined,
        colorHex: task.color || '#3b82f6',
        // fallback tailwind color classes if no custom color present
        fallbackClass: task.completed ? 'bg-green-500' : 
               isStart ? 'bg-blue-500' : 
               isEnd ? 'bg-red-500' : 'bg-yellow-500'
      }
    })
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateMonth('prev')}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-lg font-semibold">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateMonth('next')}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Previous month days */}
        {prevMonthDays.map((day) => (
          <Card key={`prev-${day}`} className="h-20 p-2 opacity-50">
            <div className="text-xs text-muted-foreground text-center">
              {day}
            </div>
          </Card>
        ))}

        {/* Current month days */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const taskIndicators = getTaskIndicators(day)
          // Always render start-date bars first, then others
          const startIndicators = taskIndicators.filter((ti: any) => ti.isStart)
          const otherIndicators = taskIndicators.filter((ti: any) => !ti.isStart)
          const orderedIndicators = [...startIndicators, ...otherIndicators]
          return (
            <Card
              key={day}
              className={cn(
                "h-20 p-2 cursor-pointer transition-all duration-200",
                "hover:shadow-md hover:scale-105",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                isToday(day) && "ring-2 ring-accent bg-accent/10",
                isSelected(day) && "ring-2 ring-primary bg-primary/10"
              )}
              onClick={() => handleDateClick(day, true)}
            >
              <div className="flex flex-col h-full">
                <div className={cn(
                  "text-sm font-medium text-center mb-1",
                  isToday(day) && "text-accent-foreground font-bold",
                  isSelected(day) && "text-primary-foreground font-bold"
                )}>
                  {day}
                </div>
                
                {/* Task indicators */}
                <div className="flex-1 flex flex-col gap-0.5">
                  {orderedIndicators.slice(0, 3).map((task: any, index) => (
                    <div
                      key={`${task.id}-${index}`}
                      className={cn(
                        "h-1.5 rounded-full",
                        task.colorHex ? undefined : task.fallbackClass,
                        task.isStart && "rounded-l-full",
                        task.isEnd && "rounded-r-full"
                      )}
                      style={task.colorHex ? { backgroundColor: task.colorHex } : undefined}
                      title={task.title}
                    />
                  ))}
                  {orderedIndicators.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{orderedIndicators.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}

        {/* Next month days */}
        {nextMonthDays.map((day) => (
          <Card key={`next-${day}`} className="h-20 p-2 opacity-50">
            <div className="text-xs text-muted-foreground text-center">
              {day}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}