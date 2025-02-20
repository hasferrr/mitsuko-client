import { create } from "zustand"
import { SubtitleMinimal, SubtitleTranslated } from "@/types/types"
import { parseTranslationJson } from "@/lib/parser"
import { persist } from "zustand/middleware"

interface TranslationStore {
  response: string
  setResponse: (response: string) => void
  isTranslating: boolean
  setIsTranslating: (isTranslating: boolean) => void
  jsonResponse: SubtitleMinimal[]
  setJsonResponse: (jsonResponse: SubtitleMinimal[]) => void
  abortControllerRef: React.RefObject<AbortController | null>
  translateSubtitles: (requestBody: any, apiKey: string) => Promise<SubtitleMinimal[]>
  stopTranslation: () => void
}

export const useTranslationStore = create<TranslationStore>()(persist((set, get) => ({
  response: "",
  setResponse: (response) => set({ response }),
  isTranslating: false,
  setIsTranslating: (isTranslating) => set({ isTranslating }),
  jsonResponse: [],
  setJsonResponse: (jsonResponse) => set({ jsonResponse }),
  abortControllerRef: { current: null },
  stopTranslation: () => get().abortControllerRef.current?.abort(),
  translateSubtitles: async (requestBody, apiKey) => {
    set({ response: "" })
    set({ jsonResponse: [] })

    get().abortControllerRef.current = new AbortController()
    let buffer = ""

    try {
      const res = await fetch("http://localhost:4000/api/stream/translate", {
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
        throw new Error(`Request failed (${res.status}), ${JSON.stringify(errorData.details) || errorData.error}`)
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

    } finally {
      get().abortControllerRef.current = null
      let parsedResponse: SubtitleMinimal[] = []
      try {
        parsedResponse = parseTranslationJson(buffer)
        set({ jsonResponse: parsedResponse })
      } catch {
        console.log("Failed to parse: ", buffer)
      }
      return parsedResponse
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
