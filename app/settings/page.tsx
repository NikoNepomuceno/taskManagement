'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Trash2, Settings, Palette, Lock, AlertTriangle, RotateCcw, Calendar, Clock } from 'lucide-react'
import { useTheme } from 'next-themes'
import { notifySuccess, notifyError } from '@/lib/alerts'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface TrashTask {
  _id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  color?: string
  deletedAt: string
  createdAt: string
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [userTheme, setUserTheme] = useState<string>('system')
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [trashDialogOpen, setTrashDialogOpen] = useState(false)
  const [trashTasks, setTrashTasks] = useState<TrashTask[]>([])
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TrashTask | null>(null)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    // Load user theme preference and trash tasks
    const loadData = async () => {
      try {
        const [themeResponse, trashResponse] = await Promise.all([
          fetch('/api/users/theme'),
          fetch('/api/tasks/trash')
        ])
        
        if (themeResponse.ok) {
          const themeData = await themeResponse.json()
          setUserTheme(themeData.theme || 'system')
        }
        
        if (trashResponse.ok) {
          const trashData = await trashResponse.json()
          setTrashTasks(trashData)
        }
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }
    loadData()
  }, [mounted])

  const handleThemeChange = async (newTheme: string) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/users/theme', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme: newTheme }),
      })

      if (response.ok) {
        setUserTheme(newTheme)
        setTheme(newTheme)
        notifySuccess('Theme updated successfully!')
      } else {
        notifyError('Failed to update theme')
      }
    } catch (error) {
      console.error('Error updating theme:', error)
      notifyError('Failed to update theme')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      notifyError('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      notifyError('Password must be at least 6 characters long')
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/users/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (response.ok) {
        notifySuccess('Password updated successfully!')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const error = await response.json()
        notifyError(error.message || 'Failed to update password')
      }
    } catch (error) {
      console.error('Error updating password:', error)
      notifyError('Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmptyTrash = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/tasks/trash', {
        method: 'DELETE',
      })

      if (response.ok) {
        notifySuccess('Trash emptied successfully!')
        setTrashTasks([])
      } else {
        notifyError('Failed to empty trash')
      }
    } catch (error) {
      console.error('Error emptying trash:', error)
      notifyError('Failed to empty trash')
    } finally {
      setIsLoading(false)
      setTrashDialogOpen(false)
    }
  }

  const handleRestore = async (task: TrashTask) => {
    try {
      const response = await fetch(`/api/tasks/trash/${task._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'restore' }),
      })

      if (response.ok) {
        notifySuccess('Task restored successfully!')
        setTrashTasks(trashTasks.filter(t => t._id !== task._id))
      } else {
        notifyError('Failed to restore task')
      }
    } catch (error) {
      console.error('Error restoring task:', error)
      notifyError('Failed to restore task')
    }
  }

  const handlePermanentDelete = async (task: TrashTask) => {
    try {
      const response = await fetch(`/api/tasks/trash/${task._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'permanent' }),
      })

      if (response.ok) {
        notifySuccess('Task permanently deleted!')
        setTrashTasks(trashTasks.filter(t => t._id !== task._id))
      } else {
        notifyError('Failed to permanently delete task')
      }
    } catch (error) {
      console.error('Error permanently deleting task:', error)
      notifyError('Failed to permanently delete task')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDaysUntilPermanentDeletion = (deletedAt: string) => {
    const deletedDate = new Date(deletedAt)
    const now = new Date()
    const daysDiff = Math.ceil((30 * 24 * 60 * 60 * 1000 - (now.getTime() - deletedDate.getTime())) / (24 * 60 * 60 * 1000))
    return Math.max(0, daysDiff)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="lg:pl-64">
        <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
      <div className="mt-8 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 sm:h-8 sm:w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Manage your account preferences and application settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme Preferences
            </CardTitle>
            <CardDescription>
              Choose your preferred theme for the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Label htmlFor="theme-select">Theme</Label>
              {!mounted ? (
                <div className="w-full sm:max-w-xs h-10 bg-muted animate-pulse rounded-md" />
              ) : (
                <Select
                  value={userTheme}
                  onValueChange={handleThemeChange}
                  disabled={isLoading}
                >
                  <SelectTrigger id="theme-select" className="w-full sm:max-w-xs">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <p className="text-sm text-muted-foreground">
                System theme will automatically switch between light and dark based on your device settings.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your account password for security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  required
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  required
                  disabled={isLoading}
                  minLength={6}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Trash Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Trash Management
            </CardTitle>
            <CardDescription>
              Manage deleted tasks and clean up your trash
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trashTasks.length === 0 ? (
                <div className="text-center py-8">
                  <Trash2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tasks in trash</h3>
                  <p className="text-muted-foreground">
                    Deleted tasks will appear here and be automatically removed after 30 days.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Empty Trash ({trashTasks.length} items)</p>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete all tasks in trash
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => setTrashDialogOpen(true)}
                      disabled={isLoading}
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Empty Trash
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Deleted Tasks</h4>
                    {trashTasks.map((task) => {
                      const daysLeft = getDaysUntilPermanentDeletion(task.deletedAt)
                      return (
                        <div key={task._id} className="border rounded-lg p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1">
                              <h5 className="font-medium">{task.title}</h5>
                              {task.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Created: {formatDate(task.createdAt)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Deleted: {formatDate(task.deletedAt)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:ml-4">
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                              {daysLeft <= 7 && (
                                <Badge variant="destructive" className="flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  {daysLeft} days left
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTask(task)
                                setRestoreDialogOpen(true)
                              }}
                              className="w-full sm:w-auto"
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Restore
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedTask(task)
                                setDeleteDialogOpen(true)
                              }}
                              className="w-full sm:w-auto"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Forever
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                <span>
                  Deleted tasks are automatically removed from trash after 30 days
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty Trash Confirmation Dialog */}
      <AlertDialog open={trashDialogOpen} onOpenChange={setTrashDialogOpen}>
        <AlertDialogContent className="mx-4 sm:mx-0">
          <AlertDialogHeader>
            <AlertDialogTitle>Empty Trash</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete all tasks in your trash. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEmptyTrash}
              className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading ? 'Emptying...' : 'Empty Trash'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent className="mx-4 sm:mx-0">
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore "{selectedTask?.title}"? This will move it back to your active tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedTask) {
                  handleRestore(selectedTask)
                  setRestoreDialogOpen(false)
                }
              }}
              className="w-full sm:w-auto"
            >
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="mx-4 sm:mx-0">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Forever</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "{selectedTask?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedTask) {
                  handlePermanentDelete(selectedTask)
                  setDeleteDialogOpen(false)
                }
              }}
              className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </div>
      </div>
    </div>
  )
}
