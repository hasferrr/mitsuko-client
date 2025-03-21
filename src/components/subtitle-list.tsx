import { memo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SubtitleCard } from "./subtitle-card"
import { useTranslationDataStore } from "@/stores/use-translation-data-store"

export const SubtitleList = memo(() => {
  const currentId = useTranslationDataStore((state) => state.currentId)
  const translationData = useTranslationDataStore((state) => state.data)
  const subtitles = currentId ? translationData[currentId]?.subtitles ?? [] : []

  return (
    <ScrollArea className="h-[510px] pr-4">
      <div className="space-y-4">
        {subtitles.map((subtitle) => (
          <SubtitleCard key={`sub-${subtitle.index}`} subtitle={subtitle} />
        ))}
      </div>
    </ScrollArea>
  )
})
