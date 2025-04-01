import { EXTRACT_CONTEXT_URL, EXTRACT_CONTEXT_URL_FREE } from "@/constants/api"
import { handleStream } from "@/lib/stream/stream"
import { create } from "zustand"
import { RefObject } from "react"

interface ExtractionStore {
  isExtractingSet: Set<string>
  abortControllerMap: Map<string, RefObject<AbortController>>
  setIsExtracting: (extractionId: string, isExtracting: boolean) => void
  stopExtraction: (id: string) => void
  extractContext: (
    requestBody: Record<string, unknown>,
    apiKey: string,
    isFree: boolean,
    extractionId: string,
    setResponse: (response: string) => void,
    previousResponse: string
  ) => Promise<void>
}

export const useExtractionStore = create<ExtractionStore>()((set, get) => ({
  isExtractingSet: new Set(),
  abortControllerMap: new Map(),
  setIsExtracting: (extractionId, isExtracting) => {
    if (isExtracting) {
      get().isExtractingSet.add(extractionId)
    } else {
      get().isExtractingSet.delete(extractionId)
    }
  },
  stopExtraction: (id) => get().abortControllerMap.get(id)?.current.abort(),
  extractContext: async (
    requestBody: Record<string, unknown>,
    apiKey: string,
    isFree: boolean,
    extractionId: string,
    setResponse: (response: string) => void,
    previousResponse: string
  ) => {
    const abortControllerRef = { current: new AbortController() }
    get().abortControllerMap.set(extractionId, abortControllerRef)

    await handleStream({
      setResponse,
      abortControllerRef,
      isFree,
      apiKey,
      requestUrl: isFree ? EXTRACT_CONTEXT_URL_FREE : EXTRACT_CONTEXT_URL,
      requestHeader: {
        "Content-Type": "application/json"
      },
      requestBody: JSON.stringify(requestBody),
      previousResponse,
    })

    get().abortControllerMap.delete(extractionId)
  },
}))
