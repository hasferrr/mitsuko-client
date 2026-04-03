import { SubtitleType } from "@/types/subtitles"

export function createUtf8SubtitleBlob(content: string, type: SubtitleType): Blob {
  if (type === "vtt") {
    return new Blob([content], { type: "text/vtt;charset=utf-8" })
  }
  return new Blob(["\ufeff", content], { type: "text/plain;charset=utf-8" })
}
