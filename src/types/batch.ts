export interface BatchFile {
  id: string
  status: "pending" | "partial" | "translating" | "queued" | "done" | "error"
  progress: number
  title: string
  subtitlesCount: number
  translatedCount: number
  type: string
}
