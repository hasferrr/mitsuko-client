import { TRANSCRIPT_URL } from "@/constants/api"
import { isSRT } from "@/lib/subtitle-utils"
import { generateSRT } from "@/lib/srt/generate"
import { parseSRT } from "@/lib/srt/parse"
import { handleStream } from "@/lib/stream"
import { Subtitle } from "@/types/types"
import { create } from "zustand"
import { RefObject } from "react"
import { keepOnlyWrapped } from "@/lib/parser"
import { MAX_TRANSCRIPTION_SIZE } from "@/constants/default"
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
    setTranscriptionText: (text: string) => void,
    setTranscriptSubtitles: (subtitles: Subtitle[]) => void
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
      startTranscription: async (id, setTranscriptionText, setTranscriptSubtitles) => {
        const file = get().file
        if (!file) throw new Error("No file selected")
        if (file.size > MAX_TRANSCRIPTION_SIZE) {
          throw new Error(`File size must be less than ${MAX_TRANSCRIPTION_SIZE / (1024 * 1024)}MB`)
        }

        setTranscriptionText("")
        setTranscriptSubtitles([])

        const formData = new FormData()
        formData.append("audio", file)

        const abortControllerRef = { current: new AbortController() }
        get().abortControllerMap.set(id, abortControllerRef)

        const transcriptionText = await handleStream({
          setResponse: setTranscriptionText,
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
