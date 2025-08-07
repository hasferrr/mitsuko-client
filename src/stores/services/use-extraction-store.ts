import { EXTRACT_CONTEXT_URL, EXTRACT_CONTEXT_URL_FREE, EXTRACT_CONTEXT_URL_PAID } from "@/constants/api"
import { handleStream } from "@/lib/api/stream"
import { create } from "zustand"
import { RefObject } from "react"
import { RequestType } from "@/types/request"
import { useClientIdStore } from "../use-client-id-store"

interface ExtractionStore {
  isExtractingSet: Set<string>
  abortControllerMap: Map<string, RefObject<AbortController>>
  setIsExtracting: (extractionId: string, isExtracting: boolean) => void
  stopExtraction: (id: string) => void
  extractContext: (
    requestBody: Record<string, unknown>,
    apiKey: string,
    requestType: RequestType,
    extractionId: string,
    setResponse: (response: string) => void,
  ) => Promise<void>
}

export const useExtractionStore = create<ExtractionStore>()((set, get) => ({
  isExtractingSet: new Set(),
  abortControllerMap: new Map(),
  setIsExtracting: (extractionId, isExtracting) => {
    set(state => {
      const newSet = new Set(state.isExtractingSet)
      if (isExtracting) {
        newSet.add(extractionId)
      } else {
        newSet.delete(extractionId)
        state.abortControllerMap.delete(extractionId)
      }
      return { isExtractingSet: newSet }
    })
  },
  stopExtraction: (id) => {
    set(state => {
      const newSet = new Set(state.isExtractingSet)
      newSet.delete(id)
      state.abortControllerMap.get(id)?.current.abort()
      state.abortControllerMap.delete(id)
      return { isExtractingSet: newSet }
    })
  },
  extractContext: async (
    requestBody: Record<string, unknown>,
    apiKey: string,
    requestType: RequestType,
    extractionId: string,
    setResponse: (response: string) => void,
  ) => {
    const abortControllerRef = { current: new AbortController() }
    get().abortControllerMap.set(extractionId, abortControllerRef)

    let requestUrl = EXTRACT_CONTEXT_URL
    if (requestType === "free") {
      requestUrl = EXTRACT_CONTEXT_URL_FREE
    } else if (requestType === "paid") {
      requestUrl = EXTRACT_CONTEXT_URL_PAID
    }

    await handleStream({
      setResponse,
      abortControllerRef,
      isUseApiKey: requestType === "custom",
      apiKey,
      requestUrl,
      requestHeader: {
        "Content-Type": "application/json"
      },
      requestBody: JSON.stringify({ ...requestBody, clientId: useClientIdStore.getState().clientId }),
    })

    get().abortControllerMap.delete(extractionId)
  },
}))
