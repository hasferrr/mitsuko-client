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
  isTranscribing: boolean
  progress: number
  transcriptionText: string
  subtitles: Subtitle[]
  audioUrl: string | null
  setFileAndUrl: (file: File | null) => void
  setIsTranscribing: (isTranscribing: boolean) => void
  setProgress: (progress: number) => void
  setTranscriptionText: (transcriptionText: string) => void
  setSubtitles: (subtitles: Subtitle[]) => void
  setAudioUrl: (audioUrl: string | null) => void
  startTranscription: () => Promise<void>
  stopTranscription: () => void
  exportTranscription: () => void
}

export const useTranscriptionStore = create<TranscriptionStore>()(
  persist(
    (set, get) => ({
      file: null,
      isTranscribing: false,
      progress: 0,
      transcriptionText: "",
      subtitles: [],
      audioUrl: null,
      setFileAndUrl: (file) => {
        if (file) {
          const url = URL.createObjectURL(file)
          set({ file, audioUrl: url, transcriptionText: "", subtitles: [], progress: 0, isTranscribing: false })
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

        set({ isTranscribing: true, progress: 0 })

        // Simulate streaming transcription
        const transcriptionLines = [
          "Hello and welcome to this podcast.",
          "Today we're discussing the future of AI technology.",
          "Our guest is a renowned expert in machine learning.",
          "Let's start by talking about recent developments.",
          "The pace of innovation has been remarkable lately.",
          "Neural networks have become increasingly sophisticated.",
          "This has led to breakthroughs in natural language processing.",
          "Applications like TalkNotes wouldn't be possible without these advances.",
          "What do you think will be the next major breakthrough?",
          "I believe multimodal AI systems will define the next era.",
        ]

        let currentProgress = 0
        let currentText = ""

        const interval = setInterval(() => {
          if (get().isTranscribing === false) {
            clearInterval(interval)
            return
          }
          if (currentProgress < transcriptionLines.length) {
            const newLine = transcriptionLines[currentProgress]
            currentText += newLine + " "
            set({ transcriptionText: currentText })

            const formatTimestamp = (seconds: number): string => {
              const hours = Math.floor(seconds / 3600)
              const minutes = Math.floor((seconds % 3600) / 60)
              const secs = Math.floor(seconds % 60)
              const ms = Math.floor((seconds % 1) * 1000)

              return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`
            }

            const startTime = formatTimestamp(currentProgress * 5)
            const endTime = formatTimestamp(currentProgress * 5 + 4.5)

            set((state) => ({
              subtitles: [
                ...state.subtitles,
                {
                  id: currentProgress + 1,
                  start: startTime,
                  end: endTime,
                  text: newLine,
                },
              ],
            }))

            currentProgress++
            set({ progress: (currentProgress / transcriptionLines.length) * 100 })
          } else {
            clearInterval(interval)
            set({ isTranscribing: false, progress: 100 })
          }
        }, 1500)
      },
      stopTranscription: () => {
        set({ isTranscribing: false })
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
        ...state,
        file: undefined,
        url: undefined,
        isTranscribing: undefined,
      }),
    }
  )
)
