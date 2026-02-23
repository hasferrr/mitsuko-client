export interface BatchFile {
  id: string
  status: "pending" | "partial" | "uploading" | "processing" | "queued" | "done" | "error"
  progress: number
  title: string
  description: string
  descriptionColor?: "default" | "green" | "blue" | "red" | "yellow"
  subtitlesCount: number
  translatedCount: number
  type: string
  showEpisodePrefix?: boolean
  hasDurationWarning?: boolean
}
