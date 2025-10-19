import { TaskList } from "@/components/task-list"
import { CheckCircle2 } from "lucide-react"

export default function CompletedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="lg:pl-64">
        <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 max-w-6xl">
          <header className="mt-8 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Completed Tasks</h1>
            </div>
            <p className="text-muted-foreground text-base sm:text-lg">View all your completed tasks</p>
          </header>

          <div className="max-w-4xl mx-auto">
            <TaskList showCompleted={true} />
          </div>
        </div>
      </div>
    </div>
  )
}
