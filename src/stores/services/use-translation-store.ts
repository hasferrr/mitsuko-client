import { create } from "zustand"
import { SubOnlyTranslated } from "@/types/subtitles"
import { parseTranslationJson } from "@/lib/parser/parser"
import { TRANSLATE_URL, TRANSLATE_URL_FREE, TRANSLATE_URL_PAID } from "@/constants/api"
import { handleStream } from "@/lib/api/stream"
import { RequestType } from "@/types/request"
import { useClientIdStore } from "@/stores/ui/use-client-id-store"
import { TranslationRequestBody } from "@/types/request"
import { createServiceSlice } from "../factories/create-service-slice"
import type { RefObject } from "react"

interface TranslationStore {
  isTranslatingSet: Set<string>
  abortControllerMap: Map<string, RefObject<AbortController>>
  setActive: (id: string, isActive: boolean) => void
  stop: (id: string) => void
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
  ...createServiceSlice("isTranslatingSet")(set as never),

  setIsTranslating: (translationId, isTranslating) => get().setActive(translationId, isTranslating),
  stopTranslation: (id) => get().stop(id),

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
      setResponse(buffer + "\n\n<error>[Failed to parse]</error>")
      throw error
    }

    get().abortControllerMap.delete(id)
    return {
      parsed: parsedResponse,
      raw: buffer,
    }
  },
}))
