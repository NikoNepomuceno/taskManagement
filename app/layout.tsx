import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import "sweetalert2/dist/sweetalert2.min.css"
import { TaskProvider } from "@/contexts/task-context"
import { LoadingProvider } from "@/contexts/loading-context"
import { AppChrome } from "@/components/app-chrome"
import { SessionProvider } from "@/components/session-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { SessionNotifications } from "@/components/session-notifications"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Task Management System",
  description: "Manage your tasks with deadlines and file attachments",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">
        <SessionProvider>
          <SessionNotifications />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="task-management-theme"
          >
            <TaskProvider>
              <LoadingProvider>
                <AppChrome>{children}</AppChrome>
              </LoadingProvider>
            </TaskProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
