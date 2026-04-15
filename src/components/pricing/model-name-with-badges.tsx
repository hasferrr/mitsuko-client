"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { highQualityModels, favoriteModels } from '@/constants/model-preferences'

export default function ModelNameWithBadges({ name }: { name: string }) {
  return (
    <>
      {name}
      {highQualityModels.has(name) && (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <span className="cursor-default ml-1 text-[1rem]">⭐</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>High Quality</p>
          </TooltipContent>
        </Tooltip>
      )}
      {favoriteModels.has(name) && (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <span className="cursor-default ml-1 text-[1rem]">💙</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Favorite Model</p>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  )
}
