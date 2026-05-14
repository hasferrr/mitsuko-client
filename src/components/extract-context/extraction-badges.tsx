"use client"

import { Badge } from "@/components/ui/badge"
import { getEffectiveExtractionStatus } from "@/lib/extraction/status"
import { cn } from "@/lib/utils"
import { Extraction, ExtractionOrigin, ExtractionStatus } from "@/types/project"

const statusLabels: Record<ExtractionStatus, string> = {
  idle: "Draft",
  running: "Running",
  completed: "Ready",
  failed: "Failed",
  stopped: "Stopped",
}

const originLabels: Record<Exclude<ExtractionOrigin, "manual">, string> = {
  batch: "Batch",
  "auto-context": "Auto context",
}

const statusClassNames: Record<ExtractionStatus, string> = {
  idle: "bg-muted/50 text-muted-foreground",
  running: "border-sidebar-primary/40 bg-primary/10 text-sidebar-primary",
  completed: "bg-primary text-primary-foreground",
  failed: "bg-destructive/10 text-destructive dark:bg-destructive/20",
  stopped: "border-destructive/30 bg-destructive/10 text-destructive dark:bg-destructive/20",
}

const originClassNames: Record<Exclude<ExtractionOrigin, "manual">, string> = {
  batch: "border-border text-muted-foreground",
  "auto-context": "bg-primary/10 text-sidebar-primary",
}

interface ExtractionBadgesProps {
  extraction: Extraction
  runningIds: Set<string>
  className?: string
  size?: "default" | "compact"
}

export function ExtractionBadges({ extraction, runningIds, className, size = "default" }: ExtractionBadgesProps) {
  const status = getEffectiveExtractionStatus(extraction, runningIds)
  const origin = extraction.origin === "manual" ? null : extraction.origin

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Badge
        variant={status === "completed" ? "default" : "outline"}
        className={cn(statusClassNames[status], size === "compact" && "h-4 px-1.5 text-[10px]")}
      >
        {statusLabels[status]}
      </Badge>
      {origin && (
        <Badge
          variant={origin === "batch" ? "outline" : "secondary"}
          className={cn(originClassNames[origin], size === "compact" && "h-4 px-1.5 text-[10px]")}
        >
          {originLabels[origin]}
        </Badge>
      )}
    </span>
  )
}
