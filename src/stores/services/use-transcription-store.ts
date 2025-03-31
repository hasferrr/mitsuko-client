import { TRANSCRIPT_URL } from "@/constants/api"
import { handleStream } from "@/lib/stream/stream"
import { create } from "zustand"
import { RefObject } from "react"
interface TranscriptionStore {
  file: File | null
  audioUrl: string | null
  isTranscribingSet: Set<string>
  abortControllerMap: Map<string, RefObject<AbortController>>
  setFileAndUrl: (file: File | null) => void
  setAudioUrl: (audioUrl: string | null) => void
  setIsTranscribing: (id: string, isTranscribing: boolean) => void
  stopTranscription: (id: string) => void
  startTranscription: (
    id: string,
    formData: FormData,
    setResponse: (response: string) => void,
  ) => Promise<string>
}

export const useTranscriptionStore = create<TranscriptionStore>()(
  (set, get) => {
    return ({
      file: null,
      audioUrl: null,
      isTranscribingSet: new Set(),
      abortControllerMap: new Map(),

      setFileAndUrl: (file) => {
        if (file) {
          const url = URL.createObjectURL(file)
          set({ file, audioUrl: url })
        } else {
          set({ file: null, audioUrl: null })
        }
      },

      setAudioUrl: (audioUrl) => set({ audioUrl }),

      setIsTranscribing: (id, isTranscribing) => {
        if (isTranscribing) {
          get().isTranscribingSet.add(id)
        } else {
          get().isTranscribingSet.delete(id)
        }
      },

      stopTranscription: (id) => {
        get().isTranscribingSet.delete(id)
        get().abortControllerMap.get(id)?.current?.abort()
        get().abortControllerMap.delete(id)
      },

      startTranscription: async (id, formData, setResponse) => {
        const abortControllerRef = { current: new AbortController() }
        get().abortControllerMap.set(id, abortControllerRef)

        const transcriptionText = await handleStream({
          setResponse,
          abortControllerRef,
          isFree: true,
          apiKey: "",
          requestUrl: TRANSCRIPT_URL,
          requestHeader: {},
          requestBody: formData,
        })
        get().abortControllerMap.delete(id)

        return transcriptionText
      },
    })
  }
)
