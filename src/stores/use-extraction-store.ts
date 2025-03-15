import { EXTRACT_CONTEXT_URL, EXTRACT_CONTEXT_URL_FREE } from "@/constants/api"
import { handleStream } from "@/lib/stream"
import { abortedAbortController, sleep } from "@/lib/utils"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ExtractionStore {
  contextResult: string
  isExtracting: boolean
  abortControllerRef: React.RefObject<AbortController>
  setContextResult: (result: string) => void
  setIsExtracting: (isExtracting: boolean) => void
  extractContext: (requestBody: any, apiKey: string, isFree: boolean) => Promise<void>
  stopExtraction: () => void
}

export const useExtractionStore = create<ExtractionStore>()(persist((set, get) => ({
  contextResult: "",
  isExtracting: false,
  abortControllerRef: { current: abortedAbortController() },
  setContextResult: (result) => set({ contextResult: result }),
  setIsExtracting: (isExtracting) => set({ isExtracting }),
  stopExtraction: () => get().abortControllerRef.current.abort(),
  extractContext: async (requestBody, apiKey, isFree) => {
    await handleStream({
      setResponse: get().setContextResult,
      abortControllerRef: get().abortControllerRef,
      isFree,
      apiKey,
      requestUrl: isFree ? EXTRACT_CONTEXT_URL_FREE : EXTRACT_CONTEXT_URL,
      requestHeader: {
        "Content-Type": "application/json"
      },
      requestBody: JSON.stringify(requestBody),
    })
  },
}),
  {
    name: "extraction-storage",
    partialize: (state) => ({ contextResult: state.contextResult }),
  }
))
