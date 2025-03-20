import { create } from "zustand"
import { SubtitleTranslated, Parsed } from "@/types/types"
import { persist } from "zustand/middleware"
import { useProjectDataStore } from "./use-project-data-store"

type UpdateSubtitle = (
  index: number,
  field: keyof SubtitleTranslated,
  value: SubtitleTranslated[keyof SubtitleTranslated],
) => void

interface SubtitleStore {
  title: string
  subtitles: SubtitleTranslated[]
  parsed: Parsed
  setTitle: (title: string) => void
  setSubtitles: (subtitles: SubtitleTranslated[]) => void
  updateSubtitle: UpdateSubtitle
  setParsed: (parsed: Parsed) => void
  resetParsed: () => void
}

const initialParsedState: Parsed = { type: "srt", data: null }


export const useSubtitleStore = create<SubtitleStore>()(
  (set) => ({
    title: "",
    subtitles: [],
    parsed: initialParsedState,
    setTitle: (title) => {
      set({ title })
      const id = useProjectDataStore.getState().currentTranslationId
      if (id) {
        useProjectDataStore
          .getState()
          .mutateData(id, "translation", "title", title)
      }
    },
    setSubtitles: (subtitles) => {
      set({ subtitles })
      const id = useProjectDataStore.getState().currentTranslationId
      if (id) {
        useProjectDataStore
          .getState()
          .mutateData(id, "translation", "subtitles", subtitles)
      }
    },
    setParsed: (parsed) => {
      set({ parsed })
      const id = useProjectDataStore.getState().currentTranslationId
      if (id) {
        useProjectDataStore
          .getState()
          .mutateData(id, "translation", "parsed", parsed)
      }
    },
    resetParsed: () => {
      set({ parsed: initialParsedState })
      const id = useProjectDataStore.getState().currentTranslationId
      if (id) {
        useProjectDataStore
          .getState()
          .mutateData(id, "translation", "parsed", initialParsedState)
      }
    },
    updateSubtitle: (index, field, value) => {
      set((state) => {
        const i = index - 1
        const updatedSubtitles = [...state.subtitles]
        updatedSubtitles[i] = {
          ...updatedSubtitles[i],
          [field]: value,
        }
        const id = useProjectDataStore.getState().currentTranslationId
        if (id) {
          useProjectDataStore
            .getState()
            .mutateData(id, "translation", "subtitles", updatedSubtitles)
        }
        return { subtitles: updatedSubtitles }
      })
    }

  })
)
