"use client"

import { Home, CheckCircle2, Calendar, Settings, LogOut, Menu, X, Icon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { signOut } from "next-auth/react"
import { notifyError, notifySuccess, notifyLoading, notifyLoadingSuccess, notifyLoadingError } from "@/lib/alerts"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/completed", label: "Completed Tasks", icon: CheckCircle2 },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/settings", label: "Settings", icon: Settings }
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    
    // Show loading notification
    notifyLoading('Signing you out...', 'Logging Out')
    
    try {
      const res = await signOut({ callbackUrl: '/auth/login', redirect: false })
      notifyLoadingSuccess('You have been logged out successfully!')
      // NextAuth with redirect: false returns undefined in recent versions; fallback to manual redirect
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback to manual logout
      localStorage.clear()
      notifyLoadingError('Logout failed, clearing session')
      window.location.href = '/auth/login'
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-3 left-3 z-50 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border shadow-sm rounded-md h-9 w-9"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r transition-transform duration-300 ease-in-out lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Task Manager</h2>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setLogoutDialogOpen(true)}
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>This will clear all your local data and tasks.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout} 
              className="bg-destructive hover:bg-destructive/90"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
