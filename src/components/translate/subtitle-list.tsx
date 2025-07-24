import { memo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SubtitleCard } from "./subtitle-card"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"

interface SubtitleListProps {
  hidden?: boolean
  translationId?: string
}

export const SubtitleList = memo(({
  hidden = false,
  translationId,
}: SubtitleListProps) => {
  const currentId = useTranslationDataStore((state) => state.currentId)
  const translationData = useTranslationDataStore((state) => state.data)
  const idToUse = translationId ?? currentId
  const subtitles = idToUse ? translationData[idToUse]?.subtitles ?? [] : []

  if (hidden) {
    return (
      <div className="h-[510px] text-center flex items-center justify-center border rounded-md border-dashed p-4 text-muted-foreground">
        Subtitles hidden to improve performance
        <br />
        Click "Show" to view
      </div>
    )
  }

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
