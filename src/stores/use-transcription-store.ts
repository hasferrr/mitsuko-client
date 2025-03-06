import { TRANSCRIPT_URL } from "@/constants/api"
import { cleanUpJsonResponse } from "@/lib/parser"
import { generateSRT } from "@/lib/srt/generate"
import { parseSRT } from "@/lib/srt/parse"
import { abortedAbortController, sleep } from "@/lib/utils"
import { Subtitle } from "@/types/types"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface TranscriptionStore {
  file: File | null
  audioUrl: string | null
  isTranscribing: boolean
  abortControllerRef: React.RefObject<AbortController>
  progress: number
  transcriptionText: string
  transcriptSubtitles: Subtitle[]
  setFileAndUrl: (file: File | null) => void
  setAudioUrl: (audioUrl: string | null) => void
  setIsTranscribing: (isTranscribing: boolean) => void
  setProgress: (progress: number) => void
  setTranscriptionText: (transcriptionText: string) => void
  setTranscriptSubtitles: (subtitles: Subtitle[]) => void
  startTranscription: () => Promise<void>
  stopTranscription: () => void
  parseTranscription: () => void
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
      transcriptSubtitles: [],
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
      setTranscriptSubtitles: (subtitles) => set({ transcriptSubtitles: subtitles }),
      setAudioUrl: (audioUrl) => set({ audioUrl }),
      startTranscription: async () => {
        const file = get().file
        if (!file) return
        if (file.size > 20 * 1024 * 1024) return

        set({ transcriptionText: "", transcriptSubtitles: [], progress: 0 })

        if (!get().abortControllerRef.current.signal.aborted) {
          get().abortControllerRef.current.abort()
          await sleep(1000)
        }
        get().abortControllerRef.current = new AbortController()

        let buffer = ""

        try {
          const formData = new FormData()
          formData.append("audio", file)

          const res = await fetch(TRANSCRIPT_URL, {
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
        get().parseTranscription()
      },
      stopTranscription: () => {
        get().abortControllerRef.current.abort()
      },
      parseTranscription: () => {
        const text = get().transcriptionText.trim()
        const lines = text.split("\n").filter((line) => line.trim() !== "")

        const check = (i: number) => lines.length > 0 && (
          lines[i].trim().startsWith("[")
          || lines[i].trim().startsWith("```")
        )
        while (check(lines.length - 1)) lines.pop()
        while (check(0)) lines.shift()

        let i = 1
        let srtArr: string[] = []

        /**
         * Format:
         * mm:ss:ms --> mm:ss:ms
         * Transcribed Text
         */
        for (let line of lines) {
          line = line.trim()
          const splitted = line.split(" --> ")
          if (splitted.length === 2) {
            const [start, end] = splitted
            const [startMinute, startSecond, startMillisecond] = start.split(":")
            const [endMinute, endSecond, endMillisecond] = end.split(":")
            const s = `00:${startMinute}:${startSecond},${startMillisecond}`
            const e = `00:${endMinute}:${endSecond},${endMillisecond}`
            srtArr.push(`\n${i}\n${s} --> ${e}`)
            i++
          } else {
            srtArr.push(line)
          }
        }

        const srt = srtArr.join("\n")
        console.log(srt)
        set({ transcriptSubtitles: parseSRT(srt) })
      },
      exportTranscription: () => {
        const srtContent = generateSRT(get().transcriptSubtitles)
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
        transcriptSubtitles: state.transcriptSubtitles,
      } as TranscriptionStore),
    }
  )
)
