import { memo, useCallback, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Timer } from "lucide-react"
import { SubtitleTranslated, UpdateSubtitle } from "@/types/types"
import { debounce, timestampToString } from "@/lib/utils"

interface SubtitleCardProps {
  subtitle: SubtitleTranslated
  updateSubtitle: UpdateSubtitle
}

export const SubtitleCard = memo(({ subtitle, updateSubtitle }: SubtitleCardProps) => {
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const translatedRef = useRef<HTMLTextAreaElement>(null)

  // Debounced handler for content changes.  Now reads from the ref.
  const debouncedContentUpdate = useCallback(
    debounce((index: number) => {
      if (contentRef.current) {
        updateSubtitle(index, "content", contentRef.current.value)
      }
    }, 300),
    [updateSubtitle]
  )

  // Debounced handler for translated changes. Now reads from the ref.
  const debouncedTranslatedUpdate = useCallback(
    debounce((index: number) => {
      if (translatedRef.current) {
        updateSubtitle(index, "translated", translatedRef.current.value)
      }
    }, 300),
    [updateSubtitle]
  )

  // useCallback is no longer necessary for onChange since it's now just for resizing
  const handleContentResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
  }

  const handleTranslatedResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
  }

  // Trigger the debounced update on blur (when the textarea loses focus)
  const handleContentBlur = useCallback(() => {
    debouncedContentUpdate(subtitle.index)
  }, [debouncedContentUpdate, subtitle.index])

  const handleTranslatedBlur = useCallback(() => {
    debouncedTranslatedUpdate(subtitle.index)
  }, [debouncedTranslatedUpdate, subtitle.index])

  return (
    <Card className="border border-border bg-card text-card-foreground group relative hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">#{subtitle.index}</span>
            <div className="flex items-center gap-2 text-sm">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {timestampToString(subtitle.timestamp.start)} ➝ {timestampToString(subtitle.timestamp.end)}
              </span>
            </div>
          </div>

          <div className="grid gap-2">
            <Textarea
              ref={contentRef}
              defaultValue={subtitle.content}
              onBlur={handleContentBlur}
              onFocus={handleContentResize}
              onChange={handleContentResize}
              placeholder="Original text"
              className="min-h-[36px] h-[36px] max-h-[120px] bg-muted/50 dark:bg-muted/30 resize-none overflow-y-hidden"
              rows={1}
            />
            <Textarea
              ref={translatedRef}
              defaultValue={subtitle.translated}
              onBlur={handleTranslatedBlur}
              onFocus={handleTranslatedResize}
              onChange={handleTranslatedResize}
              placeholder="Translated text"
              className="min-h-[36px] h-[36px] max-h-[120px] resize-none overflow-y-hidden"
              rows={1}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
