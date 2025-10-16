import { TaskList } from "@/components/task-list"
import { CheckCircle2 } from "lucide-react"

export default function CompletedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="lg:pl-64">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="h-8 w-8" />
              <h1 className="text-4xl font-bold tracking-tight">Completed Tasks</h1>
            </div>
            <p className="text-muted-foreground text-lg">View all your completed tasks</p>
          </header>

          <div className="max-w-4xl mx-auto">
            <TaskList showCompleted={true} />
          </div>
        </div>
      </div>
    </div>
  )
}
