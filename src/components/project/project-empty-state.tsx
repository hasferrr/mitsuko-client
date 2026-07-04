"use client"

import { cn } from "@/lib/utils"

type AccentColor = "blue" | "green" | "purple"

const accentBg: Record<AccentColor, string> = {
  blue: "bg-blue-500/0 border-blue-500/15",
  green: "bg-green-500/0 border-green-500/15",
  purple: "bg-purple-500/0 border-purple-500/15",
}

const accentBadge: Record<AccentColor, string> = {
  blue: "bg-blue-500/5 text-blue-500/60",
  green: "bg-green-500/5 text-green-500/60",
  purple: "bg-purple-500/5 text-purple-500/60",
}

interface ProjectEmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  accentColor?: AccentColor
}

export function ProjectEmptyState({
  icon,
  title,
  description,
  accentColor = "blue",
}: ProjectEmptyStateProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl border border-dashed touch-none opacity-100",
      accentBg[accentColor],
    )}>
      <div className={cn(
        "grid place-items-center size-9 rounded-lg shrink-0",
        accentBadge[accentColor],
      )}>
        {icon}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <h4 className="text-sm font-medium text-muted-foreground italic line-clamp-1">{title}</h4>
        <p className="text-xs text-muted-foreground italic line-clamp-1">{description}</p>
      </div>
    </div>
  )
}
