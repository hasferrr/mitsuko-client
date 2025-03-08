import { TRANSCRIPT_URL } from "@/constants/api"
import { isSRT } from "@/lib/ass/subtitle-utils"
import { generateSRT } from "@/lib/srt/generate"
import { parseSRT } from "@/lib/srt/parse"
import { handleStream } from "@/lib/stream"
import { abortedAbortController, sleep } from "@/lib/utils"
import { Subtitle } from "@/types/types"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface TranscriptionStore {
  file: File | null
  audioUrl: string | null
  isTranscribing: boolean
  abortControllerRef: React.RefObject<AbortController>
  transcriptionText: string
  transcriptSubtitles: Subtitle[]
  setFileAndUrl: (file: File | null) => void
  setAudioUrl: (audioUrl: string | null) => void
  setIsTranscribing: (isTranscribing: boolean) => void
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
      setTranscriptionText: (transcriptionText) => set({ transcriptionText }),
      setTranscriptSubtitles: (subtitles) => set({ transcriptSubtitles: subtitles }),
      setAudioUrl: (audioUrl) => set({ audioUrl }),
      startTranscription: async () => {
        const file = get().file
        if (!file) return
        if (file.size > 20 * 1024 * 1024) return

        set({ transcriptionText: "", transcriptSubtitles: [] })

        const formData = new FormData()
        formData.append("audio", file)

        await handleStream(
          get().setTranscriptionText,
          get().abortControllerRef,
          TRANSCRIPT_URL,
          {},
          formData,
        )

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
          const splitted = line.split("-->")
          if (splitted.length === 2) {
            let [start, end] = splitted
            start = start.trim()
            end = end.trim()

            const [startMinuteStr, startSecondStr, startMillisecondStr] = start.split(":")
            const [endMinuteStr, endSecondStr, endMillisecondStr] = end.split(":")

            const startMinute = parseInt(startMinuteStr, 10)
            const startSecond = parseInt(startSecondStr, 10)
            const startMillisecond = parseInt(startMillisecondStr, 10)
            const endMinute = parseInt(endMinuteStr, 10)
            const endSecond = parseInt(endSecondStr, 10)
            const endMillisecond = parseInt(endMillisecondStr, 10)

            if (isNaN(startMinute) || isNaN(startSecond) || isNaN(startMillisecond) ||
              isNaN(endMinute) || isNaN(endSecond) || isNaN(endMillisecond)) {
              throw new Error("Invalid time format in transcription text")
            }

            const s = `00:${startMinute.toString().padStart(2, '0')}:${startSecond.toString().padStart(2, '0')},${startMillisecond.toString().padStart(3, '0')}`
            const e = `00:${endMinute.toString().padStart(2, '0')}:${endSecond.toString().padStart(2, '0')},${endMillisecond.toString().padStart(3, '0')}`

            srtArr.push(`\n${i}\n${s} --> ${e}`)
            i++
          } else {
            srtArr.push(line)
          }
        }

        const srt = srtArr.join("\n")
        if (!isSRT(srt)) {
          throw new Error("Invalid SRT format")
        }

        console.log(srt)
        set({ transcriptSubtitles: parseSRT(srt) })
      },
      exportTranscription: () => {
        const subtitles = get().transcriptSubtitles
        if (!subtitles.length) return

        const srtContent = generateSRT(subtitles)
        if (!srtContent) return

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
