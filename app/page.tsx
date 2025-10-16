import { TaskFormModal } from "@/components/task-form-modal"
import { TaskList } from "@/components/task-list"
import { CheckSquare } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="lg:pl-64">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <header className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <CheckSquare className="h-8 w-8" />
                  <h1 className="text-4xl font-bold tracking-tight">Task Management System</h1>
                </div>
                <p className="text-muted-foreground text-lg">Organize your tasks with deadlines and file attachments</p>
              </div>
              <TaskFormModal />
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
