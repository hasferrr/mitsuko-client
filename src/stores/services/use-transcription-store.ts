import { TRANSCRIPT_URL } from "@/constants/api"
import { handleStream } from "@/lib/api/stream"
import { create } from "zustand"
import { RefObject } from "react"
import { TranscriptionRequestBody } from "@/types/request"
import { calculateAudioDuration } from "@/lib/utils/audio"
import { createServiceSlice } from "../factories/create-service-slice"

export interface TranscriptionLocalFileMetadata {
  originalFileName: string
  isPrepared: boolean
  wasExtracted: boolean
  codec?: string
}

interface SetFileAndUrlOptions {
  knownDuration?: number
  originalFileName?: string
  isPrepared?: boolean
  wasExtracted?: boolean
  codec?: string
}

interface TranscriptionStore {
  files: Record<string, File | null>
  audioUrls: Record<string, string | null>
  fileDurations: Record<string, number>
  localFileMetadata: Record<string, TranscriptionLocalFileMetadata>
  isTranscribingSet: Set<string>
  abortControllerMap: Map<string, RefObject<AbortController>>
  setActive: (id: string, isActive: boolean) => void
  stop: (id: string) => void
  setFileAndUrl: (id: string, file: File | null, options?: SetFileAndUrlOptions) => Promise<void>
  setAudioUrl: (id: string, audioUrl: string | null) => void
  setIsTranscribing: (id: string, isTranscribing: boolean) => void
  stopTranscription: (id: string) => void
  startTranscription: (
    id: string,
    requestBody: TranscriptionRequestBody,
    setResponse: (response: string) => void,
  ) => Promise<string>
}

export const useTranscriptionStore = create<TranscriptionStore>()(
  (set, get) => {
    return ({
      ...createServiceSlice("isTranscribingSet")(set as never),

      files: {},
      audioUrls: {},
      fileDurations: {},
      localFileMetadata: {},

      setFileAndUrl: async (id, file, options) => {
        const previousUrl = get().audioUrls[id]
        if (previousUrl) URL.revokeObjectURL(previousUrl)

        if (file) {
          const url = URL.createObjectURL(file)
          const duration = options?.knownDuration ?? await calculateAudioDuration(file).catch(() => 0)
          set({
            files: { ...get().files, [id]: file },
            audioUrls: { ...get().audioUrls, [id]: url },
            fileDurations: { ...get().fileDurations, [id]: duration },
            localFileMetadata: {
              ...get().localFileMetadata,
              [id]: {
                originalFileName: options?.originalFileName ?? file.name,
                isPrepared: options?.isPrepared ?? true,
                wasExtracted: options?.wasExtracted ?? false,
                codec: options?.codec,
              },
            },
          })
        } else {
          const currentFiles = { ...get().files }
          const currentUrls = { ...get().audioUrls }
          const currentDurations = { ...get().fileDurations }
          const currentMetadata = { ...get().localFileMetadata }
          delete currentFiles[id]
          delete currentUrls[id]
          delete currentDurations[id]
          delete currentMetadata[id]
          set({
            files: currentFiles,
            audioUrls: currentUrls,
            fileDurations: currentDurations,
            localFileMetadata: currentMetadata,
          })
        }
      },

      setAudioUrl: (id, audioUrl) => set({
        audioUrls: { ...get().audioUrls, [id]: audioUrl }
      }),

      setIsTranscribing: (id, isTranscribing) => get().setActive(id, isTranscribing),
      stopTranscription: (id) => get().stop(id),

      startTranscription: async (id, requestBody, setResponse) => {
        const abortControllerRef = { current: new AbortController() }
        get().abortControllerMap.set(id, abortControllerRef)

        const bodyString = JSON.stringify(requestBody)

        const transcriptionText = await handleStream({
          setResponse,
          abortControllerRef,
          isUseApiKey: false,
          apiKey: "",
          requestUrl: TRANSCRIPT_URL,
          requestHeader: { "Content-Type": "application/json" },
          requestBody: bodyString,
        })
        get().abortControllerMap.delete(id)

        return transcriptionText
      },
    })
  },
)
