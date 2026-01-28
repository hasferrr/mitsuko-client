import { memo } from "react"
import { SubtitleCard } from "./subtitle-card"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useLocalSettingsStore } from "@/stores/use-local-settings-store"
import type { SubtitleTranslated } from "@/types/subtitles"
import { VirtualizedList } from "../ui-custom/virtualized-list"

interface SubtitleListProps {
  hidden?: boolean
  translationId?: string
}

export const SubtitleList = memo(({
  hidden = false,
  translationId,
}: SubtitleListProps) => {
  const currentId = useTranslationDataStore((state) => state.currentId)
  const idToUse = translationId ?? currentId
  const subtitles = useTranslationDataStore((state) => {
    if (!idToUse) return [] as SubtitleTranslated[]
    return state.data[idToUse]?.subtitles ?? ([] as SubtitleTranslated[])
  })

  const isSubtitlePerformanceModeEnabled = useLocalSettingsStore((state) => state.isSubtitlePerformanceModeEnabled)

  if (hidden) {
    return (
      <div className="h-[510px] text-center flex items-center justify-center border rounded-md border-dashed p-4 text-muted-foreground">
        Subtitles hidden to improve performance
        <br />
        Click "Show" to view
      </div>
    )
  }

  if (!isSubtitlePerformanceModeEnabled) {
    return (
      <div className="h-[510px] pr-4 overflow-y-auto">
        <div className="space-y-4">
          {subtitles.map((subtitle) => (
            <SubtitleCard key={`sub-${subtitle.index}`} subtitle={subtitle} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <VirtualizedList
      id={idToUse || ""}
      items={subtitles}
      className="h-[510px] pr-4 overflow-y-auto"
      render={{
        key: (subtitle) => `sub-${subtitle.index}`,
        children: (subtitle) => <SubtitleCard subtitle={subtitle} />,
        paddingBottom: 16,
      }}
    />
  )
})
