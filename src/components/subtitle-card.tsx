import { memo } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Timer } from "lucide-react"
import { Subtitle, UpdateSubtitle } from "@/types/types"

interface SubtitleCardProps {
  subtitle: Subtitle
  updateSubtitle: UpdateSubtitle
}

export const SubtitleCard = memo(({ subtitle, updateSubtitle }: SubtitleCardProps) => {
  return (
    <Card
      key={subtitle.index + "-" + subtitle.startTime}
      className="border border-border bg-card text-card-foreground group relative hover:shadow-md transition-shadow"
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">#{subtitle.index}</span>
            <div className="flex items-center gap-2 text-sm">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{subtitle.startTime}</span>
              <span className="text-sm text-muted-foreground">➝</span>
              <span className="text-sm text-muted-foreground">{subtitle.endTime}</span>
            </div>
          </div>

          <div className="grid gap-2">
            <Textarea
              value={subtitle.content}
              onChange={(e) => {
                updateSubtitle(subtitle.index, "content", e.target.value)
                e.target.style.height = "auto"
                e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
              }}
              onFocus={(e) => {
                e.target.style.height = "auto"
                e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
              }}
              placeholder="Original text"
              className="min-h-[35px] max-h-[120px] bg-muted/50 dark:bg-muted/30 resize-none overflow-y-hidden"
              rows={1}
            />
            <Textarea
              value={subtitle.translated}
              onChange={(e) => {
                updateSubtitle(subtitle.index, "translated", e.target.value)
                e.target.style.height = "auto"
                e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
              }}
              onFocus={(e) => {
                e.target.style.height = "auto"
                e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
              }}
              placeholder="Translated text"
              className="min-h-[35px] max-h-[120px] resize-none overflow-y-hidden"
              rows={1}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
