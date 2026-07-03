"use client"

import { cn } from "@/lib/utils"

type AccentColor = "blue" | "green" | "purple"

const accentBg: Record<AccentColor, string> = {
  blue: "bg-blue-500/5 border-blue-500/25",
  green: "bg-green-500/5 border-green-500/25",
  purple: "bg-purple-500/5 border-purple-500/25",
}

const accentBadge: Record<AccentColor, string> = {
  blue: "bg-blue-500/10",
  green: "bg-green-500/10",
  purple: "bg-purple-500/10",
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
      "flex items-center gap-3 p-3 rounded-xl border border-dashed touch-none",
      accentBg[accentColor],
    )}>
      <div className={cn(
        "grid place-items-center size-9 rounded-lg shrink-0",
        accentBadge[accentColor],
      )}>
        {icon}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <h4 className="text-sm font-medium line-clamp-1">{title}</h4>
        <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
      </div>
    </div>
  )
}
