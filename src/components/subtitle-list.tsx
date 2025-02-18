import { memo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SubtitleTranslated, UpdateSubtitle } from "@/types/types"
import { SubtitleCard } from "./subtitle-card"

interface SubtitleListProps {
  subtitles: SubtitleTranslated[]
  updateSubtitle: UpdateSubtitle
}

export const SubtitleList = memo(({ subtitles, updateSubtitle }: SubtitleListProps) => {
  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-4">
        {subtitles.map((subtitle) => (
          <SubtitleCard key={`sub-${subtitle.index}`} subtitle={subtitle} updateSubtitle={updateSubtitle} />
        ))}
      </div>
    </ScrollArea>
  )
})
