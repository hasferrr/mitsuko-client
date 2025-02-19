import { create } from "zustand"
import { SubtitleMinimal, SubtitleTranslated } from "@/types/types"
import { parseTranslationJson } from "@/lib/parser"

interface TranslationStore {
  response: string
  setResponse: (response: string) => void
  isTranslating: boolean
  setIsTranslating: (isTranslating: boolean) => void
  jsonResponse: SubtitleMinimal[]
  setJsonResponse: (jsonResponse: SubtitleMinimal[]) => void
}

interface FetchStore {
  abortControllerRef: React.RefObject<AbortController | null>
  translateSubtitles: (requestBody: any, apiKey: string) => Promise<SubtitleTranslated[]> // Change here
  stopTranslation: () => void
}

export const useTranslationStore = create<TranslationStore & FetchStore>((set, get) => ({
  response: "",
  setResponse: (response) => set({ response }),
  isTranslating: false,
  setIsTranslating: (isTranslating) => set({ isTranslating }),
  jsonResponse: [],
  setJsonResponse: (jsonResponse) => set({ jsonResponse }),
  abortControllerRef: { current: null },
  stopTranslation: () => get().abortControllerRef.current?.abort(),
  translateSubtitles: async (requestBody, apiKey) => {
    if (get().isTranslating) return []

    get().setIsTranslating(true)
    get().setResponse("")
    get().setJsonResponse([])

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
        get().setResponse(buffer)
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
      setTimeout(() => get().setIsTranslating(false), 500)
      get().abortControllerRef.current = null

      let parsedResponse: SubtitleMinimal[] = []
      try {
        console.log(buffer)
        parsedResponse = parseTranslationJson(buffer)
      } catch {
        console.error("Failed to parse")
      }

      if (parsedResponse.length > 0) {
        get().setJsonResponse(parsedResponse)
        const subtitles: SubtitleTranslated[] = requestBody.subtitles
        const updatedSubtitles = subtitles.map(subtitle => {
          const translated = parsedResponse.find(item => item.index === subtitle.index)
          return translated ? { ...subtitle, translated: translated.content } : subtitle
        })
        return updatedSubtitles
      }

      return []
    }
  },
}))
