import { EXTRACT_CONTEXT_URL, EXTRACT_CONTEXT_URL_FREE, EXTRACT_CONTEXT_URL_PAID } from "@/constants/api"
import { handleStream } from "@/lib/api/stream"
import { create } from "zustand"
import { RefObject } from "react"
import { RequestType } from "@/types/request"
import { useClientIdStore } from "../use-client-id-store"
import { ExtractionRequestBody } from "@/types/request"

interface ExtractionStore {
  isExtractingSet: Set<string>
  abortControllerMap: Map<string, RefObject<AbortController>>
  setIsExtracting: (extractionId: string, isExtracting: boolean) => void
  stopExtraction: (id: string) => void
  extractContext: (
    requestBody: ExtractionRequestBody,
    apiKey: string,
    requestType: RequestType,
    extractionId: string,
    setResponse: (response: string) => void,
    isFormatReasoning?: boolean,
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
    requestBody: ExtractionRequestBody,
    apiKey: string,
    requestType: RequestType,
    extractionId: string,
    setResponse: (response: string) => void,
    isFormatReasoning?: boolean,
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
      requestBody: JSON.stringify({
        ...requestBody,
        clientId: useClientIdStore.getState().clientId,
      }),
      isFormatReasoning,
    })

    get().abortControllerMap.delete(extractionId)
  },
}))
