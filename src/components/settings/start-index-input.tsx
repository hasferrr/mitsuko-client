"use client"

import { memo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronsRight } from "lucide-react"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SettingsParentType } from "@/types/project"

interface Props {
  parent: SettingsParentType
}

export const StartIndexInput = memo(({ parent }: Props) => {
  const startIndex = useAdvancedSettingsStore((state) => state.getStartIndex())
  const endIndex = useAdvancedSettingsStore((state) => state.getEndIndex())
  const setStartIndex = useAdvancedSettingsStore((state) => state.setStartIndex)
  const setEndIndex = useAdvancedSettingsStore((state) => state.setEndIndex)
  const currentId = useTranslationDataStore((state) => state.currentId)
  const translationData = useTranslationDataStore((state) => state.data)
  const subtitles = currentId ? translationData[currentId]?.subtitles ?? [] : []

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (/^\d*$/.test(value)) {
      let num = parseInt(value, 10)
      num = Math.min(num, subtitles.length)
      num = value === "" ? 0 : num
      setStartIndex(num, parent)
    }
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value
    setStartIndex(Math.min(Math.max(parseInt(value, 10), 1), subtitles.length), parent)
    if (startIndex > endIndex) {
      setEndIndex(Math.max(1, startIndex), parent)
    }
  }

  const handleFindEmptyTranslation = () => {
    for (let i = 0; i < subtitles.length; i++) {
      if (
        subtitles[i].translated.trim() === "" &&
        subtitles[i].content.trim() !== ""
      ) {
        setStartIndex(i + 1, parent)
        setEndIndex(subtitles.length, parent)
        break
      }
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between mb-2 items-center">
        <label className="text-sm font-medium">Start Index</label>
      </div>
      <div className="relative">
        <Input
          type="text"
          value={startIndex}
          onBlur={handleBlur}
          onChange={handleChange}
          min={1}
          max={subtitles.length}
          step={1}
          className="bg-background dark:bg-muted/30 pr-10"
          inputMode="numeric"
        />
        <TooltipProvider>
          <Tooltip delayDuration={10}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
                onClick={handleFindEmptyTranslation}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium text-center">Find the first subtitle with empty</p>
              <p className="font-medium text-center">translation and set it as the start index</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <p className="text-xs text-muted-foreground">
        Start translation from this subtitle index. Useful for resuming translations. (1-{subtitles.length})
      </p>
    </div>
  )
})