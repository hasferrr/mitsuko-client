"use client"

import type { CSSProperties } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GripVertical } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import type { Project } from "@/types/project"

interface SortableBatchCardProps {
  project: Project
  onSelect: (id: string) => void
}

export function SortableBatchCard({ project, onSelect }: SortableBatchCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  } as CSSProperties

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-pointer hover:border-primary transition-colors overflow-hidden border border-muted h-full flex flex-col",
        isDragging && "opacity-50"
      )}
      onClick={() => onSelect(project.id)}
    >
      <CardHeader className="flex-row items-center justify-between gap-2 pb-2">
        <CardTitle>{project.name}</CardTitle>
        <div className="flex items-center gap-4">
          <GripVertical
            className="h-4 w-4 cursor-grab text-muted-foreground focus:outline-none"
            {...attributes}
            {...listeners}
            onClick={e => e.stopPropagation()}
          />
        </div>
      </CardHeader>
      <CardContent className="pb-4 flex flex-col flex-1">
        <div className="flex-1"></div>
        <div className="flex flex-col gap-1 mt-auto">
          <p className="text-sm text-muted-foreground">
            {project.translations.length} {project.translations.length === 1 ? "file" : "files"}
          </p>
          <p className="text-xs text-muted-foreground">
            Created: {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
