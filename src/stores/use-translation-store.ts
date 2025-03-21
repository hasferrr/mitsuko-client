import { create } from "zustand"
import { SubOnlyTranslated } from "@/types/types"
import { parseTranslationJson } from "@/lib/parser"
import { TRANSLATE_URL, TRANSLATE_URL_FREE } from "@/constants/api"
import { abortedAbortController } from "@/lib/utils"
import { handleStream } from "@/lib/stream"
import { ResponseTranslation } from "@/types/project"
import { useTranslationDataStore } from "./use-translation-data-store"

interface TranslationStore {
  response: string
  jsonResponse: SubOnlyTranslated[]
  isTranslatingSet: Set<string>
  abortControllerRef: React.RefObject<AbortController>
  setResponse: (response: string) => void
  setJsonResponse: (jsonResponse: SubOnlyTranslated[]) => void
  appendJsonResponse: (jsonResponse: SubOnlyTranslated[]) => void
  setIsTranslating: (translationId: string, isTranslating: boolean) => void
  stopTranslation: () => void
  translateSubtitles: (requestBody: any, apiKey: string, isFree: boolean) => Promise<{ parsed: SubOnlyTranslated[], raw: string }>
}

const updateResponseNoSave = <K extends keyof ResponseTranslation>(field: K, value: ResponseTranslation[K]) => {
  const currentId = useTranslationDataStore.getState().currentId
  if (!currentId) return
  const translationData = useTranslationDataStore.getState().data[currentId]
  if (!translationData) return
  translationData.response[field] = value
}

export const useTranslationStore = create<TranslationStore>()((set, get) => ({
  response: "",
  jsonResponse: [],
  isTranslatingSet: new Set(),
  abortControllerRef: { current: abortedAbortController() },

  setResponse: (response) => {
    set({ response })
    updateResponseNoSave("response", response)
  },
  setJsonResponse: (jsonResponse) => {
    set({ jsonResponse })
    updateResponseNoSave("jsonResponse", jsonResponse)
  },
  appendJsonResponse: (newArr) => {
    set((state) => {
      const updatedResponse = [...state.jsonResponse, ...newArr]
      updateResponseNoSave("jsonResponse", [...updatedResponse])
      return { jsonResponse: updatedResponse }
    })
  },

  setIsTranslating: (translationId, isTranslating) => {
    if (isTranslating) {
      get().isTranslatingSet.add(translationId)
    } else {
      get().isTranslatingSet.delete(translationId)
    }
  },

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
}))
