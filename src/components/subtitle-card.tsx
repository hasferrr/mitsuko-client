"use client"

import React, { memo, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Timer } from "lucide-react"
import { SubtitleTranslated } from "@/types/types"
import { timestampToString } from "@/lib/subtitles/timestamp"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"

interface SubtitleCardProps {
  subtitle: SubtitleTranslated
}

export const SubtitleCard = memo(({ subtitle }: SubtitleCardProps) => {
  const contentRef = useRef<HTMLTextAreaElement | null>(null)
  const translatedRef = useRef<HTMLTextAreaElement | null>(null)
  const currentId = useTranslationDataStore((state) => state.currentId)
  const updateSubtitle = useTranslationDataStore((state) => state.updateSubtitle)

  const { setHasChanges } = useUnsavedChanges()

  const subtitleUpdate = (e: React.ChangeEvent<HTMLTextAreaElement>, field: keyof SubtitleTranslated) => {
    if (!currentId) return
    setHasChanges(true)
    handleResize(e)
    updateSubtitle(currentId, subtitle.index, field, e.target.value)
  }

  const handleResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
  }

  return (
    <Card className="border border-border bg-card text-card-foreground group relative hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            {/* Left side (timestamp and index) */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">#{subtitle.index}</span>
              <div className="flex items-center gap-2 text-sm">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {timestampToString(subtitle.timestamp.start)} ➝ {timestampToString(subtitle.timestamp.end)}
                </span>
              </div>
            </div>

            {/* Right side (actor) */}
            <span className="text-sm font-medium text-muted-foreground">{subtitle.actor}</span>
          </div>

          <div className="grid gap-2">
            <Textarea
              ref={contentRef}
              value={subtitle.content}
              onFocus={handleResize}
              onChange={(e) => subtitleUpdate(e, "content")}
              className="md:min-h-[36px] md:h-[36px] min-h-[40px] h-[40px] max-h-[120px] bg-muted/50 dark:bg-muted/30 resize-none overflow-y-hidden"
              rows={1}
            />
            <Textarea
              ref={translatedRef}
              value={subtitle.translated}
              onFocus={handleResize}
              onChange={(e) => subtitleUpdate(e, "translated")}
              className="md:min-h-[36px] md:h-[36px] min-h-[40px] h-[40px] max-h-[120px] resize-none overflow-y-hidden"
              rows={1}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
