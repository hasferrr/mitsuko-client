import { create } from "zustand"
import { SubtitleTranslated, UpdateSubtitle, ASSParseOutput } from "@/types/types"
import { persist } from "zustand/middleware"

interface Parsed {
  type: "srt" | "ass"
  data: ASSParseOutput | null
}

interface SubtitleStore {
  title: string
  subtitles: SubtitleTranslated[]
  parsed: Parsed
  isInitRef: React.RefObject<boolean>
  setTitle: (title: string) => void
  setSubtitles: (subtitles: SubtitleTranslated[]) => void
  updateSubtitle: UpdateSubtitle
  setParsed: (parsed: Parsed) => void
  resetParsed: () => void
}

const initialParsedState: Parsed = { type: "srt", data: null }


export const useSubtitleStore = create<SubtitleStore>()(
  persist(
    (set) => ({
      title: "",
      subtitles: [],
      parsed: initialParsedState,
      isInitRef: { current: true },
      setTitle: (title) => set({ title }),
      setSubtitles: (subtitles) => set({ subtitles }),
      setParsed: (parsed) => set({ parsed }),
      resetParsed: () => set({ parsed: initialParsedState }),
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
