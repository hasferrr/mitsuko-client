import { create } from "zustand"
import { SubtitleTranslated, UpdateSubtitle } from "@/types/types"
import { initialSubtitles } from "@/lib/dummy"
import { persist } from "zustand/middleware"

interface SubtitleStore {
  title: string
  subtitles: SubtitleTranslated[]
  setTitle: (title: string) => void
  setSubtitles: (subtitles: SubtitleTranslated[]) => void
  updateSubtitle: UpdateSubtitle
}

export const useSubtitleStore = create<SubtitleStore>()(
  persist(
    (set) => ({
      title: "Blue.Box.S01E19",
      subtitles: initialSubtitles,
      setTitle: (title) => set({ title }),
      setSubtitles: (subtitles) => set({ subtitles }),
      updateSubtitle: (index, field, value) => {
        set((state) => {
          const i = index - 1
          const updatedSubtitles = [...state.subtitles]
          updatedSubtitles[i] = {
            ...updatedSubtitles[i],
            [field]: value,
          }
          return { subtitles: updatedSubtitles }
        })
      }
    }),
    {
      name: 'subtitle-storage',
    }
  )
)
