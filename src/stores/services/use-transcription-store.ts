import { TRANSCRIPT_URL } from "@/constants/api"
import { handleStream } from "@/lib/api/stream"
import { create } from "zustand"
import { RefObject } from "react"

interface TranscriptionStore {
  files: Record<string, File | null>
  audioUrls: Record<string, string | null>
  isTranscribingSet: Set<string>
  abortControllerMap: Map<string, RefObject<AbortController>>
  setFileAndUrl: (id: string, file: File | null) => void
  setAudioUrl: (id: string, audioUrl: string | null) => void
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
      files: {},
      audioUrls: {},
      isTranscribingSet: new Set(),
      abortControllerMap: new Map(),

      setFileAndUrl: (id, file) => {
        if (file) {
          const url = URL.createObjectURL(file)
          set({
            files: { ...get().files, [id]: file },
            audioUrls: { ...get().audioUrls, [id]: url }
          })
        } else {
          const currentFiles = { ...get().files }
          const currentUrls = { ...get().audioUrls }
          delete currentFiles[id]
          delete currentUrls[id]
          set({
            files: currentFiles,
            audioUrls: currentUrls
          })
        }
      },

      setAudioUrl: (id, audioUrl) => set({
        audioUrls: { ...get().audioUrls, [id]: audioUrl }
      }),

      setIsTranscribing: (id, isTranscribing) => {
        set(state => {
          const newSet = new Set(state.isTranscribingSet)
          if (isTranscribing) {
            newSet.add(id)
          } else {
            newSet.delete(id)
          }
          return { isTranscribingSet: newSet }
        })
      },

      stopTranscription: (id) => {
        set(state => {
          const newSet = new Set(state.isTranscribingSet)
          newSet.delete(id)
          state.abortControllerMap.get(id)?.current?.abort()
          state.abortControllerMap.delete(id)
          return { isTranscribingSet: newSet }
        })
      },

      startTranscription: async (id, formData, setResponse) => {
        const abortControllerRef = { current: new AbortController() }
        get().abortControllerMap.set(id, abortControllerRef)

        const transcriptionText = await handleStream({
          setResponse,
          abortControllerRef,
          isUseApiKey: false,
          apiKey: "",
          requestUrl: TRANSCRIPT_URL,
          requestHeader: {},
          requestBody: formData,
        })
        get().abortControllerMap.delete(id)

        return transcriptionText
      },
    })
  },
)
