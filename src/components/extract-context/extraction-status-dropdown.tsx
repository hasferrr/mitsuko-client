"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ExtractionStatus } from "@/types/project"
import { Check, ChevronDown } from "lucide-react"

const statusDotColors: Record<ExtractionStatus, string> = {
  idle: "bg-muted-foreground/50",
  running: "bg-sidebar-primary animate-pulse",
  completed: "bg-primary",
  failed: "bg-destructive",
  stopped: "bg-orange-400 dark:bg-orange-500",
}

const statusLabels: Record<ExtractionStatus, string> = {
  idle: "Draft",
  running: "Running",
  completed: "Done",
  failed: "Failed",
  stopped: "Stopped",
}

const selectableStatuses: ExtractionStatus[] = ["idle", "completed", "failed", "stopped"]

interface ExtractionStatusDropdownProps {
  status: ExtractionStatus
  disabled: boolean
  onStatusChange: (status: ExtractionStatus) => void
}

export function ExtractionStatusDropdown({
  status,
  disabled,
  onStatusChange,
}: ExtractionStatusDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <span className={cn("size-1.5 rounded-full", statusDotColors[status])} />
          {statusLabels[status]}
          <ChevronDown className="size-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {selectableStatuses.map((s) => (
          <DropdownMenuItem key={s} onClick={() => onStatusChange(s)}>
            <span className={cn("size-1.5 rounded-full", statusDotColors[s])} />
            {statusLabels[s]}
            {status === s && <Check className="size-3 ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
