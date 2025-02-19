import { memo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SubtitleCard } from "./subtitle-card"
import { useSubtitleStore } from "@/stores/useSubtitleStore"

export const SubtitleList = memo(() => {
  const subtitles = useSubtitleStore((state) => state.subtitles)

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-4">
        {subtitles.map((subtitle) => (
          <SubtitleCard key={`sub-${subtitle.index}`} subtitle={subtitle} />
        ))}
      </div>
    </ScrollArea>
  )
})
