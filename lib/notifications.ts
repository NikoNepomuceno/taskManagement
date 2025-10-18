import { notifyWarning, notifyInfo } from './alerts'
import type { Task } from './types'

export function checkCriticalTasks(tasks: Task[]): Task[] {
  const now = new Date()
  const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  
  return tasks.filter(task => {
    if (task.completed) return false
    
    const endDate = new Date(task.endDate)
    const isDueInOneDay = endDate <= oneDayFromNow && endDate >= now
    const isHighPriority = task.priority === 'high'
    
    return isDueInOneDay || isHighPriority
  })
}

export function showCriticalTaskNotification(tasks: Task[]) {
  const criticalTasks = checkCriticalTasks(tasks)
  
  if (criticalTasks.length === 0) return
  
  const highPriorityTasks = criticalTasks.filter(task => task.priority === 'high')
  const dueSoonTasks = criticalTasks.filter(task => {
    const endDate = new Date(task.endDate)
    const oneDayFromNow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
    return endDate <= oneDayFromNow && endDate >= new Date()
  })
  
  let message = ''
  let title = 'Critical Tasks Alert!'
  
  if (highPriorityTasks.length > 0 && dueSoonTasks.length > 0) {
    message = `You have ${highPriorityTasks.length} high priority task(s) and ${dueSoonTasks.length} task(s) due within 24 hours.`
  } else if (highPriorityTasks.length > 0) {
    message = `You have ${highPriorityTasks.length} high priority task(s) that need attention.`
  } else if (dueSoonTasks.length > 0) {
    message = `You have ${dueSoonTasks.length} task(s) due within 24 hours.`
  }
  
  if (message) {
    notifyWarning(message, title)
  }
}

export function showLoginNotification(tasks: Task[]) {
  const criticalTasks = checkCriticalTasks(tasks)
  
  if (criticalTasks.length === 0) return
  
  const taskList = criticalTasks.map(task => {
    const endDate = new Date(task.endDate)
    const isDueToday = endDate.toDateString() === new Date().toDateString()
    const isDueTomorrow = endDate.toDateString() === new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString()
    
    let urgencyText = ''
    if (task.priority === 'high') {
      urgencyText = ' (High Priority)'
    } else if (isDueToday) {
      urgencyText = ' (Due Today!)'
    } else if (isDueTomorrow) {
      urgencyText = ' (Due Tomorrow)'
    }
    
    return `• ${task.title}${urgencyText}`
  }).join('\n')
  
  const message = `You have critical tasks that need attention:\n\n${taskList}`
  
  notifyWarning(message, 'Critical Tasks Alert!')
}
