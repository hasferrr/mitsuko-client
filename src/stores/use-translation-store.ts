import { create } from "zustand"
import { SubOnlyTranslated } from "@/types/types"
import { parseTranslationJson } from "@/lib/parser"
import { persist } from "zustand/middleware"
import { TRANSLATE_URL, TRANSLATE_URL_FREE } from "@/constants/api"
import { abortedAbortController } from "@/lib/utils"
import { handleStream } from "@/lib/stream"

interface TranslationStore {
  response: string
  setResponse: (response: string) => void
  isTranslating: boolean
  setIsTranslating: (isTranslating: boolean) => void
  jsonResponse: SubOnlyTranslated[]
  setJsonResponse: (jsonResponse: SubOnlyTranslated[]) => void
  appendJsonResponse: (jsonResponse: SubOnlyTranslated[]) => void
  abortControllerRef: React.RefObject<AbortController>
  translateSubtitles: (requestBody: any, apiKey: string, isFree: boolean) => Promise<{ parsed: SubOnlyTranslated[], raw: string }>
  stopTranslation: () => void
}

export const useTranslationStore = create<TranslationStore>()(persist((set, get) => ({
  response: "",
  setResponse: (response) => set({ response }),
  isTranslating: false,
  setIsTranslating: (isTranslating) => set({ isTranslating }),
  jsonResponse: [],
  setJsonResponse: (jsonResponse) => set({ jsonResponse }),
  appendJsonResponse: (newArr) => set((state) => ({ jsonResponse: [...state.jsonResponse, ...newArr] })),
  abortControllerRef: { current: abortedAbortController() },
  stopTranslation: () => get().abortControllerRef.current?.abort(),
  translateSubtitles: async (requestBody, apiKey, isFree) => {
    const buffer = await handleStream({
      setResponse: get().setResponse,
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
      set((state) => ({ response: state.response + "\n\n[Failed to parse]" }))
      throw error
    }

    return {
      parsed: parsedResponse,
      raw: buffer,
    }
  },
}),
  {
    name: "translation-storage",
    partialize: (state) => ({
      response: state.response,
      jsonResponse: state.jsonResponse,
    }),
  }
))
