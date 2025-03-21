import { create } from "zustand"
import { SubOnlyTranslated } from "@/types/types"
import { parseTranslationJson } from "@/lib/parser"
import { TRANSLATE_URL, TRANSLATE_URL_FREE } from "@/constants/api"
import { handleStream } from "@/lib/stream"

interface TranslationStore {
  isTranslatingSet: Set<string>
  abortControllerMap: Map<string, AbortController>
  setIsTranslating: (translationId: string, isTranslating: boolean) => void
  stopTranslation: (id: string) => void
  translateSubtitles: (
    requestBody: any,
    apiKey: string,
    isFree: boolean,
    id: string,
    setResponse: (response: string) => void
  ) => Promise<{ parsed: SubOnlyTranslated[], raw: string }>
}

export const useTranslationStore = create<TranslationStore>()((set, get) => ({
  isTranslatingSet: new Set(),
  abortControllerMap: new Map(),

  setIsTranslating: (translationId, isTranslating) => {
    if (isTranslating) {
      get().isTranslatingSet.add(translationId)
    } else {
      get().isTranslatingSet.delete(translationId)
    }
  },

  stopTranslation: (id: string) => get().abortControllerMap.get(id)?.abort(),
  translateSubtitles: async (
    requestBody: any,
    apiKey: string,
    isFree: boolean,
    id: string,
    setResponse: (response: string) => void
  ): Promise<{ parsed: SubOnlyTranslated[], raw: string }> => {
    const abortController = new AbortController()
    get().abortControllerMap.set(id, abortController)

    const buffer: string = await handleStream({
      setResponse,
      abortControllerRef: { current: abortController },
      isFree,
      apiKey,
      requestUrl: isFree ? TRANSLATE_URL_FREE : TRANSLATE_URL,
      requestHeader: {
        "Content-Type": "application/json"
      },
      requestBody: JSON.stringify(requestBody),
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
