import { memo } from "react"
import { SubtitleCard } from "./subtitle-card"
import { useLocalSettingsStore } from "@/stores/use-local-settings-store"
import type { SubtitleTranslated } from "@/types/subtitles"
import { VirtualizedList } from "../ui-custom/virtualized-list"

interface SubtitleListProps {
  translationId: string
  subtitles: SubtitleTranslated[]
  hidden?: boolean
}

export const SubtitleList = memo(({
  translationId,
  subtitles,
  hidden = false,
}: SubtitleListProps) => {
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
      id={translationId}
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
