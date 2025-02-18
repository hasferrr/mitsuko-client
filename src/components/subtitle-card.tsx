import { memo, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Timer } from "lucide-react"
import { SubtitleTranslated, UpdateSubtitle } from "@/types/types"
import { timestampToString } from "@/lib/utils"

interface SubtitleCardProps {
  subtitle: SubtitleTranslated
  updateSubtitle: UpdateSubtitle
}

export const SubtitleCard = memo(({ subtitle, updateSubtitle }: SubtitleCardProps) => {
  const contentRef = useRef<HTMLTextAreaElement | null>(null)
  const translatedRef = useRef<HTMLTextAreaElement | null>(null)

  const contentUpdate = () => {
    if (contentRef.current) {
      updateSubtitle(subtitle.index, "content", contentRef.current.value)
    }
  }

  const translatedUpdate = () => {
    if (translatedRef.current) {
      updateSubtitle(subtitle.index, "translated", translatedRef.current.value)
    }
  }

  const handleResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
  }

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
              value={subtitle.content}
              onFocus={handleResize}
              onChange={contentUpdate}
              placeholder="Original text"
              className="min-h-[36px] h-[36px] max-h-[120px] bg-muted/50 dark:bg-muted/30 resize-none overflow-y-hidden"
              rows={1}
            />
            <Textarea
              ref={translatedRef}
              value={subtitle.translated}
              onFocus={handleResize}
              onChange={translatedUpdate}
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
