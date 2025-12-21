import { create } from "zustand"
import { SubOnlyTranslated } from "@/types/subtitles"
import { parseTranslationJson } from "@/lib/parser/parser"
import { TRANSLATE_URL, TRANSLATE_URL_FREE, TRANSLATE_URL_PAID } from "@/constants/api"
import { handleStream } from "@/lib/api/stream"
import { RefObject } from "react"
import { RequestType } from "@/types/request"
import { useClientIdStore } from "../use-client-id-store"
import { TranslationRequestBody } from "@/types/request"
interface TranslationStore {
  isTranslatingSet: Set<string>
  abortControllerMap: Map<string, RefObject<AbortController>>
  setIsTranslating: (translationId: string, isTranslating: boolean) => void
  stopTranslation: (id: string) => void
  translateSubtitles: (
    requestBody: TranslationRequestBody,
    apiKey: string,
    requestType: RequestType,
    id: string,
    setResponse: (response: string) => void,
    isFormatReasoning?: boolean
  ) => Promise<{ parsed: SubOnlyTranslated[], raw: string }>
}

export const useTranslationStore = create<TranslationStore>()((set, get) => ({
  isTranslatingSet: new Set(),
  abortControllerMap: new Map(),

  setIsTranslating: (translationId, isTranslating) => {
    set(state => {
      const newSet = new Set(state.isTranslatingSet)
      if (isTranslating) {
        newSet.add(translationId)
      } else {
        newSet.delete(translationId)
      }
      return { isTranslatingSet: newSet }
    })
  },

  stopTranslation: (id: string) => {
    set(state => {
      const newSet = new Set(state.isTranslatingSet)
      newSet.delete(id)
      state.abortControllerMap.get(id)?.current.abort()
      state.abortControllerMap.delete(id)
      return { isTranslatingSet: newSet }
    })
  },

  translateSubtitles: async (
    requestBody: TranslationRequestBody,
    apiKey: string,
    requestType: RequestType,
    id: string,
    setResponse: (response: string) => void,
    isFormatReasoning?: boolean
  ): Promise<{ parsed: SubOnlyTranslated[], raw: string }> => {
    const abortControllerRef = { current: new AbortController() }
    get().abortControllerMap.set(id, abortControllerRef)

    let requestUrl = TRANSLATE_URL
    if (requestType === "free") {
      requestUrl = TRANSLATE_URL_FREE
    } else if (requestType === "paid") {
      requestUrl = TRANSLATE_URL_PAID
    }

    const buffer: string = await handleStream({
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

    let parsedResponse: SubOnlyTranslated[] = []
    try {
      parsedResponse = parseTranslationJson(buffer)
    } catch (error) {
      console.error("Error: ", error)
      console.log("Failed to parse: ", buffer)
      setResponse(buffer + "\n\n[Failed to parse]")
      throw error
    }

    get().abortControllerMap.delete(id)
    return {
      parsed: parsedResponse,
      raw: buffer,
    }
  },
}))
