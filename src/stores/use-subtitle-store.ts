import { create } from "zustand"
import { SubtitleTranslated, UpdateSubtitle } from "@/types/types"
import { initialSubtitles } from "@/lib/dummy"

interface SubtitleStore {
  title: string
  subtitles: SubtitleTranslated[]
  setTitle: (title: string) => void
  setSubtitles: (subtitles: SubtitleTranslated[]) => void
  updateSubtitle: UpdateSubtitle
}

export const useSubtitleStore = create<SubtitleStore>()(
  (set, get) => ({
    title: "Blue.Box.S01E19",
    subtitles: initialSubtitles,
    setTitle: (title) => set({ title }),
    setSubtitles: (subtitles) => set({ subtitles }),
    updateSubtitle: (index, field, value) => {
      const updatedSubtitles = get().subtitles.map((subtitle) =>
        subtitle.index === index ? { ...subtitle, [field]: value } : subtitle
      )
      set({ subtitles: updatedSubtitles })
    },
  })
)

