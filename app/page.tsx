import { TaskFormModal } from "@/components/task-form-modal"
import { TaskList } from "@/components/task-list"
import { CheckSquare } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="lg:pl-64">
        <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 max-w-6xl">
          <header className="mt-8 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <CheckSquare className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight truncate">Task Management System</h1>
                </div>
                <p className="text-muted-foreground text-base sm:text-lg">Organize your tasks with deadlines and file attachments</p>
              </div>
              <div className="flex-shrink-0">
                <TaskFormModal />
              </div>
            </div>
          </header>

          <div className="max-w-4xl mx-auto">
            <TaskList />
          </div>
        </div>
      </div>
    </div>
  )
}
