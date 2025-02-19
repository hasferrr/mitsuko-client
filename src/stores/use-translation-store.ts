import { create } from "zustand"
import { SubtitleMinimal, SubtitleTranslated } from "@/types/types"
import { useAdvancedSettingsStore } from "./use-advanced-settings-store"
import { useSettingsStore } from "./use-settings-store"
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
  translateSubtitles: (subtitles: SubtitleTranslated[]) => Promise<SubtitleTranslated[]>
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
  translateSubtitles: async (subtitles) => {
    if (get().isTranslating) return [] // Return empty array to satisfy type

    get().setIsTranslating(true)
    get().setResponse("")
    get().setJsonResponse([])

    const settings = useSettingsStore.getState()
    const advancedSettings = useAdvancedSettingsStore.getState()

    get().abortControllerRef.current = new AbortController()
    let buffer = ""

    try {
      const requestBody = {
        subtitles: subtitles.map((s) => ({
          index: s.index,
          actor: s.actor,
          content: s.content,
        })),
        sourceLanguage: settings.sourceLanguage,
        targetLanguage: settings.targetLanguage,
        contextDocument: settings.contextDocument,
        baseURL: settings.useCustomModel ? settings.customBaseUrl : undefined,
        model: settings.useCustomModel ? settings.customModel : "deepseek",
        temperature: advancedSettings.temperature,
        maxCompletionTokens: 8192,
        contextMessage: [],
      }

      const res = await fetch("http://localhost:4000/api/stream/translate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${settings.apiKey}`,
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
        return [] // Return empty array
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
        const updatedSubtitles = subtitles.map(subtitle => {
          const translated = parsedResponse.find(item => item.index === subtitle.index)
          return translated ? { ...subtitle, translated: translated.content } : subtitle
        })
        return updatedSubtitles // Return the updated subtitles
      }

      return []
    }
  },
}))
