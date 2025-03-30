import { TRANSCRIPT_URL } from "@/constants/api"
import { isSRT } from "@/lib/subtitle-utils"
import { generateSRT } from "@/lib/srt/generate"
import { parseSRT } from "@/lib/srt/parse"
import { handleStream } from "@/lib/stream"
import { Subtitle } from "@/types/types"
import { create } from "zustand"
import { RefObject } from "react"
import { keepOnlyWrapped } from "@/lib/parser"
import { MAX_TRANSCRIPTION_SIZE } from "@/constants/default"
interface TranscriptionStore {
  file: File | null
  audioUrl: string | null
  isTranscribingSet: Set<string>
  abortControllerMap: Map<string, RefObject<AbortController>>
  setFileAndUrl: (file: File | null) => void
  setAudioUrl: (audioUrl: string | null) => void
  setIsTranscribing: (id: string, isTranscribing: boolean) => void
  stopTranscription: (id: string) => void
  startTranscription: (
    id: string,
    setTranscriptionText: (text: string) => void,
    setTranscriptSubtitles: (subtitles: Subtitle[]) => void
  ) => Promise<{ text: string, parsed: Subtitle[] }>
  parseTranscription: (
    transcriptionText: string,
    setTranscriptSubtitles: (subtitles: Subtitle[]) => void,
  ) => Subtitle[]
}

export const useTranscriptionStore = create<TranscriptionStore>()(
  (set, get) => {
    return ({
      file: null,
      audioUrl: null,
      isTranscribingSet: new Set(),
      abortControllerMap: new Map(),
      setFileAndUrl: (file) => {
        if (file) {
          const url = URL.createObjectURL(file)
          set({ file, audioUrl: url })
        } else {
          set({ file: null, audioUrl: null })
        }
      },
      setAudioUrl: (audioUrl) => set({ audioUrl }),
      setIsTranscribing: (id, isTranscribing) => {
        if (isTranscribing) {
          get().isTranscribingSet.add(id)
        } else {
          get().isTranscribingSet.delete(id)
        }
      },
      stopTranscription: (id) => {
        get().isTranscribingSet.delete(id)
        get().abortControllerMap.get(id)?.current?.abort()
        get().abortControllerMap.delete(id)
      },
      startTranscription: async (id, setTranscriptionText, setTranscriptSubtitles) => {
        const file = get().file
        if (!file) throw new Error("No file selected")
        if (file.size > MAX_TRANSCRIPTION_SIZE) {
          throw new Error(`File size must be less than ${MAX_TRANSCRIPTION_SIZE / (1024 * 1024)}MB`)
        }

        setTranscriptionText("")
        setTranscriptSubtitles([])

        const formData = new FormData()
        formData.append("audio", file)

        const abortControllerRef = { current: new AbortController() }
        get().abortControllerMap.set(id, abortControllerRef)

        const transcriptionText = await handleStream({
          setResponse: setTranscriptionText,
          abortControllerRef,
          isFree: true,
          apiKey: "",
          requestUrl: TRANSCRIPT_URL,
          requestHeader: {},
          requestBody: formData,
        })
        get().abortControllerMap.delete(id)

        return {
          text: transcriptionText,
          parsed: get().parseTranscription(transcriptionText, setTranscriptSubtitles)
        }
      },
      parseTranscription: (transcriptionText, setTranscriptSubtitles) => {
        let text = transcriptionText.trim()
        text = keepOnlyWrapped(text, "```", "```") || text
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
        const parsed = parseSRT(srt)
        setTranscriptSubtitles(parsed)
        return parsed
      },
    })
  }
)
