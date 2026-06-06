"use client"

import { Badge } from "@/components/ui/badge"
import { getEffectiveExtractionStatus } from "@/lib/extraction/status"
import { cn } from "@/lib/utils"
import { Extraction, ExtractionStatus } from "@/types/project"

const statusLabels: Record<ExtractionStatus, string> = {
  idle: "Draft",
  running: "Running",
  completed: "Done",
  failed: "Failed",
  stopped: "Stopped",
}

const statusClassNames: Record<ExtractionStatus, string> = {
  idle: "bg-muted/50 text-muted-foreground",
  running: "border-sidebar-primary/40 bg-primary/10 text-sidebar-primary",
  completed: "bg-primary text-primary-foreground",
  failed: "bg-destructive/10 text-destructive dark:bg-destructive/20",
  stopped: "border-destructive/30 bg-destructive/10 text-destructive dark:bg-destructive/20",
}

interface ExtractionBadgesProps {
  extraction: Extraction
  runningIds: Set<string>
  className?: string
  size?: "default" | "compact"
}

export function ExtractionBadges({ extraction, runningIds, className, size = "default" }: ExtractionBadgesProps) {
  const status = getEffectiveExtractionStatus(extraction, runningIds)

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Badge
        variant={status === "completed" ? "default" : "outline"}
        className={cn(statusClassNames[status], size === "compact" && "h-4 px-1.5 text-[10px]")}
      >
        {statusLabels[status]}
      </Badge>
    </span>
  )
}
