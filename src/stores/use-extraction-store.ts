import { create } from "zustand"

interface ExtractionStore {
  contextResult: string
  isExtracting: boolean
  abortControllerRef: React.RefObject<AbortController | null>
  setContextResult: (result: string) => void
  setIsExtracting: (isExtracting: boolean) => void
  extractContext: (requestBody: any, apiKey: string) => Promise<void>
  stopExtraction: () => void
}

export const useExtractionStore = create<ExtractionStore>((set, get) => ({
  contextResult: "",
  isExtracting: false,
  abortControllerRef: { current: null },
  setContextResult: (result) => set({ contextResult: result }),
  setIsExtracting: (isExtracting) => set({ isExtracting }),
  stopExtraction: () => {
    get().abortControllerRef.current?.abort()
  },
  extractContext: async (requestBody, apiKey) => {
    if (get().isExtracting) return

    set({ isExtracting: true, contextResult: "" })
    const abortController = new AbortController()
    set({ abortControllerRef: { current: abortController } })
    let buffer = ""

    try {
      const res = await fetch("http://localhost:4000/api/stream/extract-context", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: abortController.signal,
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error("Error details from server:", errorData)
        throw new Error(`Request failed (${res.status}), ${JSON.stringify(errorData.details) || errorData.error}`)
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
    } finally {
      set({ isExtracting: false })
      set({ abortControllerRef: { current: null } }) // Reset the ref
    }
  },
}))

