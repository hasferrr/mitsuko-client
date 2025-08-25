export interface BatchFile {
  id: string
  status: "pending" | "partial" | "translating" | "queued" | "done" | "error"
  progress: number
  title: string
  description: string
  subtitlesCount: number
  translatedCount: number
  type: string
  showEpisodePrefix?: boolean
}
