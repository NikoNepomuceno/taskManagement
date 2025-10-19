"use client"

import { Button } from "@/components/ui/button"
import { LayoutGrid, Grid3X3, List } from "lucide-react"
import { cn } from "@/lib/utils"

export type LayoutType = "card" | "grid" | "list"

interface LayoutToggleProps {
  layout: LayoutType
  onLayoutChange: (layout: LayoutType) => void
  className?: string
}

export function LayoutToggle({ layout, onLayoutChange, className }: LayoutToggleProps) {
  return (
    <div className={cn("flex items-center gap-1 p-1 bg-muted rounded-lg", className)}>
      <Button
        variant={layout === "card" ? "default" : "ghost"}
        size="sm"
        onClick={() => onLayoutChange("card")}
        className="h-8 w-8 p-0"
        title="Card Layout"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={layout === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => onLayoutChange("grid")}
        className="h-8 w-8 p-0"
        title="2-Column Grid"
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant={layout === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onLayoutChange("list")}
        className="h-8 w-8 p-0"
        title="List Layout"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  )
}
