import { create } from "zustand"
import { SubOnlyTranslated } from "@/types/types"
import { parseTranslationJson } from "@/lib/parser"
import { TRANSLATE_URL, TRANSLATE_URL_FREE } from "@/constants/api"
import { abortedAbortController } from "@/lib/utils"
import { handleStream } from "@/lib/stream"

interface TranslationStore {
  isTranslatingSet: Set<string>
  abortControllerRef: React.RefObject<AbortController>
  setIsTranslating: (translationId: string, isTranslating: boolean) => void
  stopTranslation: () => void
  translateSubtitles: (
    requestBody: any,
    apiKey: string,
    isFree: boolean,
    setResponse: (response: string) => void
  ) => Promise<{ parsed: SubOnlyTranslated[], raw: string }>
}

export const useTranslationStore = create<TranslationStore>()((set, get) => ({
  isTranslatingSet: new Set(),
  abortControllerRef: { current: abortedAbortController() },

  setIsTranslating: (translationId, isTranslating) => {
    if (isTranslating) {
      get().isTranslatingSet.add(translationId)
    } else {
      get().isTranslatingSet.delete(translationId)
    }
  },

  stopTranslation: () => get().abortControllerRef.current?.abort(),
  translateSubtitles: async (
    requestBody: any,
    apiKey: string,
    isFree: boolean,
    setResponse: (response: string) => void
  ): Promise<{ parsed: SubOnlyTranslated[], raw: string }> => {
    const buffer: string = await handleStream({
      setResponse,
      abortControllerRef: get().abortControllerRef,
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

    return {
      parsed: parsedResponse,
      raw: buffer,
    }
  },
}))
