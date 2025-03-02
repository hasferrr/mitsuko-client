import { EXTRACT_CONTEXT_URL, EXTRACT_CONTEXT_URL_FREE } from "@/constants/api"
import { abortedAbortController, sleep } from "@/lib/utils"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ExtractionStore {
  contextResult: string
  isExtracting: boolean
  abortControllerRef: React.RefObject<AbortController>
  setContextResult: (result: string) => void
  setIsExtracting: (isExtracting: boolean) => void
  extractContext: (requestBody: any, apiKey: string, isFree: boolean, attempt?: number) => Promise<void>
  stopExtraction: () => void
}

export const useExtractionStore = create<ExtractionStore>()(persist((set, get) => ({
  contextResult: "",
  isExtracting: false,
  abortControllerRef: { current: abortedAbortController() },
  setContextResult: (result) => set({ contextResult: result }),
  setIsExtracting: (isExtracting) => set({ isExtracting }),
  stopExtraction: () => get().abortControllerRef.current.abort(),
  extractContext: async (requestBody, apiKey, isFree, attempt = 0) => {
    set({ contextResult: "" })

    while (!get().abortControllerRef.current.signal.aborted) {
      get().abortControllerRef.current.abort()
      await sleep(500)
      console.log("reattempting")
    }

    get().abortControllerRef.current = new AbortController()
    let buffer = ""

    try {
      const res = await fetch(isFree ? EXTRACT_CONTEXT_URL_FREE : EXTRACT_CONTEXT_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: get().abortControllerRef.current.signal,
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error("Error details from server:", errorData)
        throw new Error(`Request failed (${res.status}), ${JSON.stringify(errorData.details) || errorData.error || errorData.message}`)
      }

      const reader = res.body?.getReader()
      if (!reader) return

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = new TextDecoder().decode(value)
        buffer += chunk
        set({ contextResult: buffer })
      }

      if (!buffer.trim() && attempt < 3 && !get().abortControllerRef.current.signal.aborted) {
        console.log("Retrying...")
        await sleep(3000)
        return get().extractContext(requestBody, apiKey, isFree, attempt + 1)
      }

    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Request aborted")
        set((state) => ({ contextResult: state.contextResult + "\n\n[Generation stopped by user]" }))
      } else {
        console.error("Error:", error)
        set((state) => ({
          contextResult: state.contextResult + `\n\n[An error occurred: ${error instanceof Error ? error.message : error}]`,
        }))
      }
    }

    get().abortControllerRef.current.abort()
  },
}),
  {
    name: "extraction-storage",
    partialize: (state) => ({ contextResult: state.contextResult }),
  }
))
