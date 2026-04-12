"use client"

import { memo } from "react"
import { Switch } from "@/components/ui/switch"
import { Sparkles } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export const AdvancedReasoningSwitch = memo(() => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          <span className="flex items-center gap-2">
            <Sparkles className="size-4" />
            Advanced Reasoning & Planning
          </span>
        </label>
        <Tooltip delayDuration={10}>
          <TooltipTrigger asChild>
            <div>
              <Switch checked disabled />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>This feature is always enabled for optimal translation quality</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <p className="text-xs text-muted-foreground">
        Enable the AI follows a more structured & multi-step thinking process.
        It first understands the original text and context, then reviews its translations, drafts, critiques, and refines the translation.
        Great for reasoning/thinking models.
      </p>
    </div>
  )
})