import { abortedAbortController, sleep } from "@/lib/utils"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Subtitle {
  id: number
  start: string
  end: string
  text: string
}

interface TranscriptionStore {
  file: File | null
  audioUrl: string | null
  isTranscribing: boolean
  abortControllerRef: React.RefObject<AbortController>
  progress: number
  transcriptionText: string
  subtitles: Subtitle[]
  setFileAndUrl: (file: File | null) => void
  setAudioUrl: (audioUrl: string | null) => void
  setIsTranscribing: (isTranscribing: boolean) => void
  setProgress: (progress: number) => void
  setTranscriptionText: (transcriptionText: string) => void
  setSubtitles: (subtitles: Subtitle[]) => void
  startTranscription: () => Promise<void>
  stopTranscription: () => void
  exportTranscription: () => void
}

export const useTranscriptionStore = create<TranscriptionStore>()(
  persist(
    (set, get) => ({
      file: null,
      audioUrl: null,
      isTranscribing: false,
      abortControllerRef: { current: abortedAbortController() },
      progress: 0,
      transcriptionText: "",
      subtitles: [],
      setFileAndUrl: (file) => {
        if (file) {
          const url = URL.createObjectURL(file)
          set({ file, audioUrl: url })
        } else {
          set({ file: null, audioUrl: null })
        }
      },
      setIsTranscribing: (isTranscribing) => set({ isTranscribing }),
      setProgress: (progress) => set({ progress }),
      setTranscriptionText: (transcriptionText) => set({ transcriptionText }),
      setSubtitles: (subtitles) => set({ subtitles }),
      setAudioUrl: (audioUrl) => set({ audioUrl }),
      startTranscription: async () => {
        const file = get().file
        if (!file) return

        set({ transcriptionText: "", subtitles: [], progress: 0 })

        if (!get().abortControllerRef.current.signal.aborted) {
          get().abortControllerRef.current.abort()
          await sleep(1000)
        }
        get().abortControllerRef.current = new AbortController()

        let buffer = ""

        try {
          const formData = new FormData()
          formData.append("audio", file)

          const res = await fetch("http://localhost:4000/api/stream/transcript", {
            method: "POST",
            body: formData,
            signal: get().abortControllerRef.current.signal,
          })

          if (!res.ok) {
            const errorData = await res.json()
            console.error("Error details from server:", errorData)
            throw new Error(`Request failed (${res.status}), ${JSON.stringify(errorData.details) || errorData.error || errorData.message}`)
          }

          const reader = res.body?.getReader()
          if (!reader) {
            return
          }

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = new TextDecoder().decode(value)
            buffer += chunk
            set({ transcriptionText: buffer })
          }

        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            console.log("Request aborted")
            set((state) => ({ transcriptionText: state.transcriptionText + "\n\n[Generation stopped by user]" }))
          } else {
            console.error("Error:", error)
            set((state) => ({ transcriptionText: state.transcriptionText + `\n\n[An error occurred: ${error instanceof Error ? error.message : error}]` }))
          }
          get().abortControllerRef.current.abort()
          throw error
        }

        get().abortControllerRef.current.abort()
      },
      stopTranscription: () => {
        get().abortControllerRef.current.abort()
      },
      exportTranscription: () => {
        const subtitles = get().subtitles
        let srtContent = ""

        subtitles.forEach((subtitle, index) => {
          srtContent += `${index + 1}\n`
          srtContent += `${subtitle.start} --> ${subtitle.end}\n`
          srtContent += `${subtitle.text}\n\n`
        })

        const blob = new Blob([srtContent], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "transcription.srt"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      },
    }),
    {
      name: "transcription-storage",
      partialize: (state) => ({
        transcriptionText: state.transcriptionText,
        subtitles: state.subtitles,
      }),
    }
  )
)
