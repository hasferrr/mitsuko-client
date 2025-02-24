import { create } from "zustand"
import { SubOnlyTranslated } from "@/types/types"
import { parseTranslationJson } from "@/lib/parser"
import { persist } from "zustand/middleware"
import { TRANSLATE_URL, TRANSLATE_URL_FREE } from "@/constants/api"

interface TranslationStore {
  response: string
  setResponse: (response: string) => void
  isTranslating: boolean
  setIsTranslating: (isTranslating: boolean) => void
  jsonResponse: SubOnlyTranslated[]
  setJsonResponse: (jsonResponse: SubOnlyTranslated[]) => void
  appendJsonResponse: (jsonResponse: SubOnlyTranslated[]) => void
  abortControllerRef: React.RefObject<AbortController | null>
  translateSubtitles: (requestBody: any, apiKey: string, isFree: boolean) => Promise<SubOnlyTranslated[]>
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
  abortControllerRef: { current: null },
  stopTranslation: () => get().abortControllerRef.current?.abort(),
  translateSubtitles: async (requestBody, apiKey, isFree) => {
    set({ response: "" })

    get().abortControllerRef.current = new AbortController()
    let buffer = ""

    try {
      const res = await fetch(isFree ? TRANSLATE_URL_FREE : TRANSLATE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: get().abortControllerRef.current?.signal,
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error("Error details from server:", errorData)
        throw new Error(`Request failed (${res.status}), ${JSON.stringify(errorData.details) || errorData.error || errorData.message}`)
      }

      const reader = res.body?.getReader()
      if (!reader) {
        return []
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = new TextDecoder().decode(value)
        buffer += chunk
        set(({ response: buffer }))
      }

    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Request aborted")
        set((state) => ({ response: state.response + "\n\n[Generation stopped by user]" }))
      } else {
        console.error("Error:", error)
        set((state) => ({ response: state.response + `\n\n[An error occurred: ${error instanceof Error ? error.message : error}]` }))
      }
      throw error
    }

    get().abortControllerRef.current = null
    let parsedResponse: SubOnlyTranslated[] = []
    try {
      parsedResponse = parseTranslationJson(buffer)
    } catch (error) {
      console.log("Failed to parse: ", buffer)
      set((state) => ({ response: state.response + "\n\n[Failed to parse]" }))
      throw error
    }
    return parsedResponse

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
