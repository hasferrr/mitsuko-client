"use client"

import React, { memo, useEffect, useRef } from "react"
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
    updateSubtitle(currentId, subtitle.index, field, e.target.value)
  }

  const handleResize = (element: HTMLTextAreaElement) => {
    element.style.height = "auto"
    element.style.height = `${Math.min(element.scrollHeight, 900)}px`
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target instanceof HTMLTextAreaElement) {
            handleResize(entry.target)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        root: null,
        threshold: 0.1,
      }
    )

    const contentEl = contentRef.current
    const translatedEl = translatedRef.current

    if (contentEl) {
      observer.observe(contentEl)
    }
    if (translatedEl) {
      observer.observe(translatedEl)
    }

    return () => {
      if (contentEl) {
        observer.unobserve(contentEl)
      }
      if (translatedEl) {
        observer.unobserve(translatedEl)
      }
      observer.disconnect()
    }
  }, [])

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
              onFocus={(e) => handleResize(e.target)}
              onChange={(e) => {
                subtitleUpdate(e, "content")
                handleResize(e.target)
              }}
              className="md:min-h-[36px] md:h-[36px] min-h-[40px] h-[40px] max-h-[120px] bg-muted/50 dark:bg-muted/30 resize-none overflow-y-hidden"
              rows={1}
            />
            <Textarea
              ref={translatedRef}
              value={subtitle.translated}
              onFocus={(e) => handleResize(e.target)}
              onChange={(e) => {
                subtitleUpdate(e, "translated")
                handleResize(e.target)
              }}
              className="md:min-h-[36px] md:h-[36px] min-h-[40px] h-[40px] max-h-[120px] resize-none overflow-y-hidden"
              rows={1}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
