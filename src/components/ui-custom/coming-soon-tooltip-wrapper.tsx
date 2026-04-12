"use client"

import React from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export const ComingSoonTooltipWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Tooltip delayDuration={50}>
      <TooltipTrigger asChild className="w-full">
        <span tabIndex={0} className="inline-block w-full">
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>Subscription plans are currently unavailable. Credit packs can still be purchased.</p>
      </TooltipContent>
    </Tooltip>
  )
}